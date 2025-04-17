package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/skgsergio/tinyuptime/agent/internal/checker"
	"github.com/skgsergio/tinyuptime/agent/internal/tinybird"
)

var (
	debugFlag = flag.Bool(
		"debug",
		BoolFromEnv("TINYUPTIME_DEBUG", false),
		"enable debug log level (env var \"TINYUPTIME_DEBUG\")",
	)

	prettyFlag = flag.Bool(
		"pretty",
		BoolFromEnv("TINYUPTIME_PRETTY", false),
		"enable human-friendly logging (env var \"TINYUPTIME_PRETTY\")",
	)

	checkSchedulerInterval = flag.Int(
		"check-scheduler-interval",
		IntFromEnv("TINYUPTIME_CHECK_SCHEDULER_INTERVAL", 30),
		"interval for stale checks comprobation and check scheduling in seconds (env var \"TINYUPTIME_CHECK_SCHEDULER_INTERVAL\")",
	)

	checkMaxConcurrency = flag.Int(
		"check-max-concurrency",
		IntFromEnv("TINYUPTIME_CHECK_MAX_CONCURRENCY", 100),
		"maximum concurrent checks at the same time (env var \"TINYUPTIME_CHECK_MAX_CONCURRENCY\")",
	)

	batchSize = flag.Int(
		"batch-size",
		IntFromEnv("TINYUPTIME_BATCH_SIZE", 50),
		"how many results to batch before sending to Tinybird (env var \"TINYUPTIME_BATCH_SIZE\")",
	)

	batchFlushInterval = flag.Int(
		"batch-flush-interval",
		IntFromEnv("TINYUPTIME_BATCH_FLUSH_INTERVAL", 5),
		"how often the pending batches are flushed if didn't reach the batch size (env var \"TINYUPTIME_BATCH_FLUSH_INTERVAL\")",
	)

	tbApiEndpoint = flag.String(
		"tb-api-endpoint",
		StrFromEnv("TINYUPTIME_TB_API_ENDPOINT", "https://api.tinybird.co"),
		"Tinybird's region API endpoint for your Tinyuptime workspace (env var \"TINYUPTIME_TB_API_ENDPOINT\")",
	)

	tbApiTokenFlag = flag.String(
		"tb-api-token",
		StrFromEnv("TINYUPTIME_TB_API_TOKEN", ""),
		"Tinybird's 'agent' API token for your Tinyuptime workspace (env var \"TINYUPTIME_TB_API_TOKEN\")",
	)
)

func StrFromEnv(envVar string, defaultVal string) string {
	if value := os.Getenv(envVar); value != "" {
		return value
	}
	return defaultVal
}

func IntFromEnv(envVar string, defaultVal int) int {
	if value := os.Getenv(envVar); value != "" {
		intVal, err := strconv.Atoi(value)
		if err != nil {
			panic(fmt.Sprintf("environment variable `%s` has invalid value `%s`", envVar, value))
		}
		return intVal
	}
	return defaultVal
}

func BoolFromEnv(envVar string, defaultVal bool) bool {
	if value := os.Getenv(envVar); value != "" {
		boolVal, err := strconv.ParseBool(value)
		if err != nil {
			panic(fmt.Sprintf("environment variable `%s` has invalid value `%s`", envVar, value))
		}
		return boolVal
	}

	return defaultVal
}

func main() {
	flag.Parse()

	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	if *debugFlag {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	if *prettyFlag {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})
	}

	if *tbApiTokenFlag == "" {
		log.Fatal().Msg("missing Tinybird API token!")
	}

	config, err := getChecksConfig(*tbApiEndpoint, *tbApiTokenFlag)
	if err != nil {
		log.Fatal().Err(err).Msg("Error reading config")
	}

	log.Info().Int("num_checks", len(config.Checks)).Msg("Checks loaded")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	tbResults := tinybird.New[checker.Result](*tbApiEndpoint, *tbApiTokenFlag, "results_landing")

	ckr := checker.NewChecker(
		ctx,
		config.Checks,
		func(resultSet []checker.Result) {
			log.Info().Int("results", len(resultSet)).Msg("Sending check results...")
			log.Debug().Interface("results", resultSet).Msg("Check results")
			tbResults.SendEvents(resultSet)
		},
		checker.WithSchedulerInterval(*checkSchedulerInterval),
		checker.WithMaxConcurrency(*checkMaxConcurrency),
		checker.WithBatcher(*batchSize, *batchFlushInterval),
	)

	ckr.Run()
}
