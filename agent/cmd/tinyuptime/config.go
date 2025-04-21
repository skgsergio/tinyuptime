package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/skgsergio/tinyuptime/agent/internal/checker"
)

type Config struct {
	Checks checker.CheckSet `json:"data"`
}

func getChecksConfig(tbHost string, tbToken string) (*Config, error) {
	req, err := http.NewRequest(
		"GET",
		fmt.Sprintf("%s/v0/pipes/checks_config.json?token=%s", tbHost, tbToken),
		nil,
	)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, fmt.Errorf("http status code not 200: %d", res.StatusCode)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	config := Config{}
	if err := json.Unmarshal(body, &config); err != nil {
		return nil, fmt.Errorf("error parsing config file: %w", err)
	}

	return &config, nil
}
