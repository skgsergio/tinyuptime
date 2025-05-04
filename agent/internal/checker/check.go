package checker

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"math"
	"net/http"
	"sync"
	"time"
)

var (
	defaultCheckInterval = 120
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
	Timeout          *int    `json:"timeout_seconds,omitempty" yaml:"timeout_seconds,omitempty"`
	Interval         *int    `json:"interval_seconds,omitempty" yaml:"interval_seconds,omitempty"`
	running          bool
	lastRun          time.Time
	mutex            sync.Mutex
}

func (ck *Check) IsStale() bool {
	if ck.Interval == nil {
		ck.Interval = &defaultCheckInterval
	}

	return !ck.running && time.Since(ck.lastRun) >= time.Duration(*ck.Interval)*time.Second
}

func (ck *Check) Run(ctx context.Context) Result {
	maxRetries := 2
	baseDelay := 2 * time.Second

	res := Result{}

	for r := 1; r <= maxRetries; r++ {
		res = ck.run(ctx)
		if res.Success {
			break
		}

		if r < maxRetries {
			time.Sleep(time.Duration(math.Pow(2, float64(r))) * baseDelay)
		}
	}

	return res
}

func (ck *Check) run(ctx context.Context) Result {
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
		result.Error = err.Error()
		return result
	}

	// Create http client with timeout and insecure TLS options.
	client := &http.Client{
		Timeout: 2 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: (ck.VerifySSL != nil && !*ck.VerifySSL)},
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	if ck.Timeout != nil && *ck.Timeout > 0 {
		client.Timeout = time.Duration(*ck.Timeout) * time.Second
	}

	if ck.Host != nil && *ck.Host != "" {
		req.Host = *ck.Host
		client.Transport.(*http.Transport).TLSClientConfig.ServerName = *ck.Host
	}

	start := time.Now()
	resp, err := client.Do(req)
	if err != nil {
		result.Success = false
		result.Error = err.Error()
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
			result.Error = err.Error()
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
