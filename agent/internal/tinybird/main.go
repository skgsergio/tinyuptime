package tinybird

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

const (
	maxRetries = 5
	baseDelay  = 1 * time.Second
)

type TinyBird[T any] struct {
	apiEndpoint string
	apiKey      string
	datasource  string
}

func New[T any](apiEndpoint string, apiKey string, datasource string) *TinyBird[T] {
	return &TinyBird[T]{
		apiEndpoint: apiEndpoint,
		apiKey:      apiKey,
		datasource:  datasource,
	}
}

func (tb *TinyBird[T]) postEvents(payload []byte) bool {
	url := fmt.Sprintf("%s/v0/events?name=%s", tb.apiEndpoint, tb.datasource)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		log.Fatal().
			Err(err).
			Msg("Failed creating http request")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tb.apiKey))

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		log.Error().
			Err(err).
			Msg("Failed posting events to Tinybird")
		return false
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Error().
			Err(err).
			Msg("Failed reading response body")
	}

	if res.StatusCode < 200 || res.StatusCode > 299 {
		log.Warn().
			Str("body", string(body)).
			Int("status_code", res.StatusCode).
			Msg("Received non 2xx response from Tinybird!")

		return false
	}

	log.Info().
		Str("body", string(body)).
		Int("status_code", res.StatusCode).
		Msg("Events posted to Tinybird")

	return true
}

func (tb *TinyBird[T]) SendEvents(events []T) bool {
	payload := []byte{}
	for _, evt := range events {
		evtJSON, err := json.Marshal(evt)
		if err != nil {
			log.Error().
				Err(err).
				Msg("Failed marshalling event to JSON")
			return false
		}

		// NDJSON - Newline Delimited JSON
		payload = append(payload, evtJSON...)
		payload = append(payload, byte('\n'))
	}

	for r := 1; r <= maxRetries; r++ {
		if ok := tb.postEvents(payload); ok {
			return true
		}

		if r < maxRetries {
			sleepTime := time.Duration(math.Pow(2, float64(r))) * baseDelay

			log.Warn().
				Int("attempt", r).
				Int("max_retries", maxRetries).
				Str("sleep_time", sleepTime.String()).
				Msg("Failed sending events, retry...")

			time.Sleep(sleepTime)
		}
	}

	return false
}

func (tb *TinyBird[T]) SendEvent(event T) bool {
	return tb.SendEvents([]T{event})
}
