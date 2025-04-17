package checker

import (
	"time"

	"github.com/alitto/pond/v2"

	"github.com/skgsergio/tinyuptime/agent/internal/batcher"
)

func WithMaxConcurrency(maxConcurrency int) func(*Checker) {
	return func(c *Checker) {
		c.pool = pond.NewPool(maxConcurrency)
	}
}

func WithBatcher(batchSize int, flushSeconds int) func(*Checker) {
	return func(c *Checker) {
		c.batcher = batcher.NewBatcher[Result](batchSize, c.resultFn, batcher.WithFlushInterval[Result](c.ctx, flushSeconds))
	}
}

func WithSchedulerInterval(seconds int) func(*Checker) {
	return func(c *Checker) {
		c.schedulerInterval = time.Duration(seconds) * time.Second
	}
}
