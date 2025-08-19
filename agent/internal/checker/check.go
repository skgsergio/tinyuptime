package checker

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"
)

var (
	defaultCheckInterval = 120
	defaultMaxRetries    = 2
	defaultRetryDelay    = 1 * time.Second
	defaultTimeout       = 2 * time.Second
)

type Result struct {
	Timestamp       int64   `json:"timestamp"`
	CheckName       string  `json:"check_name"`
	Success         bool    `json:"success"`
	HTTPStatus      int     `json:"http_status,omitempty"`
	DurationSeconds float64 `json:"duration_seconds,omitempty"`
	Error           string  `json:"error,omitempty"`
}

type Check struct {
	Name             string  `json:"name" yaml:"name"`
	URL              string  `json:"url" yaml:"url"`
	Host             *string `json:"host,omitempty" yaml:"host,omitempty"`
	AcceptedStatuses *[]int  `json:"accepted_statuses,omitempty" yaml:"accepted_statuses,omitempty"`
	Keyword          *string `json:"keyword,omitempty" yaml:"keyword,omitempty"`
	VerifySSL        *bool   `json:"verify_ssl,omitempty" yaml:"verify_ssl,omitempty"`
	TimeoutSeconds   *int    `json:"timeout_seconds,omitempty" yaml:"timeout_seconds,omitempty"`
	IntervalSeconds  *int    `json:"interval_seconds,omitempty" yaml:"interval_seconds,omitempty"`
	running          bool
	lastRun          time.Time
	mutex            sync.Mutex
}

func (ck *Check) IsStale() bool {
	if ck.IntervalSeconds == nil {
		ck.IntervalSeconds = &defaultCheckInterval
	}

	return !ck.running && time.Since(ck.lastRun) >= time.Duration(*ck.IntervalSeconds)*time.Second
}

func (ck *Check) RunWithRetries(ctx context.Context) Result {
	maxRetries := defaultMaxRetries
	retryDelay := defaultRetryDelay

	res := Result{}

	for r := 1; r <= maxRetries; r++ {
		res = ck.Run(ctx)
		if res.Success {
			break
		}

		if r < maxRetries {
			time.Sleep(time.Duration(math.Pow(2, float64(r))) * retryDelay)
		}
	}

	return res
}

func (ck *Check) Run(ctx context.Context) Result {
	ck.mutex.Lock()
	ck.running = true

	defer func() {
		ck.lastRun = time.Now()
		ck.running = false
		ck.mutex.Unlock()
	}()

	result := Result{
		Timestamp: time.Now().Unix(),
		CheckName: ck.Name,
	}

	// Create a new request with the context
	req, err := http.NewRequestWithContext(ctx, "GET", ck.URL, nil)
	if err != nil {
		result.Success = false
		result.Error = fmt.Sprintf("Request creation failed: %s", err.Error())
		return result
	}

	// Create http client with timeout and insecure TLS options.
	client := &http.Client{
		Timeout: defaultTimeout,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: (ck.VerifySSL != nil && !*ck.VerifySSL),
			},
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	if ck.TimeoutSeconds != nil && *ck.TimeoutSeconds > 0 {
		client.Timeout = time.Duration(*ck.TimeoutSeconds) * time.Second
	}

	if ck.Host != nil && *ck.Host != "" {
		req.Host = *ck.Host
		client.Transport.(*http.Transport).TLSClientConfig.ServerName = *ck.Host
	}

	start := time.Now()
	resp, err := client.Do(req)
	if err != nil {
		// Crappy error identification to avoid leaking too much information

		if strings.Contains(err.Error(), "context deadline exceeded") {
			result.Error = "Request failed: context deadline exceeded"
		} else if strings.Contains(err.Error(), "context canceled") {
			result.Error = "Request failed: context canceled"
		} else if strings.Contains(err.Error(), "no such host") {
			result.Error = "Request failed: no such host"
		} else if strings.Contains(err.Error(), "no route to host") {
			result.Error = "Request failed: no route to host"
		} else if strings.Contains(err.Error(), "network is unreachable") {
			result.Error = "Request failed: network is unreachable"
		} else if strings.Contains(err.Error(), "connection refused") {
			result.Error = "Request failed: connection refused"
		} else if strings.Contains(err.Error(), "connection reset by peer") {
			result.Error = "Request failed: connection reset by peer"
		} else if strings.Contains(err.Error(), "i/o timeout") {
			result.Error = "Request failed: i/o timeout"
		} else if strings.Contains(err.Error(), "TLS handshake") {
			result.Error = "Request failed: TLS handshake error"
		} else if strings.Contains(err.Error(), "TLS certificate") {
			result.Error = "Request failed: TLS certificate error"
		} else if strings.Contains(err.Error(), "EOF") {
			result.Error = "Request failed: EOF"
		} else {
			result.Error = fmt.Sprintf("Request failed: %s", err.Error())
		}

		result.Success = false
		return result
	}
	defer resp.Body.Close()

	result.DurationSeconds = time.Since(start).Seconds()
	result.HTTPStatus = resp.StatusCode

	// Basic status code check
	if ck.AcceptedStatuses != nil && len(*ck.AcceptedStatuses) > 0 {
		result.Success = false

		for _, status := range *ck.AcceptedStatuses {
			if resp.StatusCode == status {
				result.Success = true
				break
			}
		}

		if !result.Success {
			result.Error = fmt.Sprintf("Status code %d not accepted, expecting: %v", resp.StatusCode, *ck.AcceptedStatuses)
			return result
		}
	} else {
		result.Success = resp.StatusCode >= 200 && resp.StatusCode < 400

		if !result.Success {
			result.Error = fmt.Sprintf("Status code %d not accepted, expecting: [200-399]", resp.StatusCode)
			return result
		}
	}

	// Keyword search
	if ck.Keyword != nil && *ck.Keyword != "" {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			result.Success = false
			result.Error = fmt.Sprintf("Failed reading response body: %s", err.Error())
			return result
		}

		if !bytes.Contains(body, []byte(*ck.Keyword)) {
			result.Success = false
			result.Error = fmt.Sprintf("Keyword '%s' not found in response.", *ck.Keyword)
		}
	}

	// We are fine
	result.Success = true
	return result
}
