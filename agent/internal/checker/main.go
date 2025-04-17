package checker

import (
	"context"
	"time"

	"github.com/alitto/pond/v2"
	"github.com/rs/zerolog/log"

	"github.com/skgsergio/tinyuptime/agent/internal/batcher"
)

var (
	defaultMaxConcurrency    = 50
	defaultSchedulerInterval = 10 * time.Second
)

type Checker struct {
	ctx               context.Context
	checks            []*Check
	pool              pond.Pool
	schedulerInterval time.Duration
	resultFn          func([]Result)
	batcher           *batcher.Batcher[Result]
}

func NewChecker(ctx context.Context, checks []*Check, resultFn func([]Result), options ...func(*Checker)) *Checker {
	ckr := &Checker{
		ctx:               ctx,
		checks:            checks,
		pool:              pond.NewPool(defaultMaxConcurrency),
		schedulerInterval: defaultSchedulerInterval,
		resultFn:          resultFn,
		batcher:           nil,
	}

	for _, option := range options {
		option(ckr)
	}

	return ckr
}

func (ckr *Checker) Run() {
	runLog := log.Info().
		Int("max_concurrency", ckr.pool.MaxConcurrency()).
		Str("scheduler_interval", ckr.schedulerInterval.String())

	if ckr.batcher != nil {
		runLog = runLog.Int("batch_size", ckr.batcher.BatchSize())

		if ckr.batcher.FlushInterval() != nil {
			runLog = runLog.Str("flush_interval", ckr.batcher.FlushInterval().String())
		}
	}

	runLog.Msg("Running checker")

	if ckr.batcher.FlushInterval() != nil {
		go func() {
			err := ckr.batcher.RunFlushScheduler()
			log.Panic().Err(err).Msg("Failed to run flush scheduler")
		}()
	}

	ckr.submit()

	checksTicker := time.NewTicker(ckr.schedulerInterval)
	defer checksTicker.Stop()

	for {
		select {
		case <-checksTicker.C:
			log.Info().
				Int64("workers_running", ckr.pool.RunningWorkers()).
				Uint64("tasks_submitted", ckr.pool.SubmittedTasks()).
				Uint64("tasks_waiting", ckr.pool.WaitingTasks()).
				Uint64("tasks_successful", ckr.pool.SuccessfulTasks()).
				Uint64("tasks_failed", ckr.pool.FailedTasks()).
				Uint64("tasks_completed", ckr.pool.CompletedTasks()).
				Uint64("tasks_dropped", ckr.pool.DroppedTasks()).
				Msg("Checker pool status")

			ckr.submit()

		case <-ckr.ctx.Done():
			log.Warn().Msg("Context done, stopping checks ticker")
			return
		}
	}
}

func (ckr *Checker) submit() {
	for _, check := range ckr.checks {
		if check.IsStale() {
			log.Debug().
				Interface("check", check).
				Msg("Submitting check")

			ckr.pool.Submit(func() {
				result := check.Run(ckr.ctx)

				if ckr.batcher != nil {
					ckr.batcher.Add(result)
				} else {
					ckr.resultFn([]Result{result})
				}
			})
		} else {
			log.Debug().
				Str("name", check.Name).
				Msg("Check still fresh")
		}
	}
}
