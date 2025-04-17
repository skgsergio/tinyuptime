package batcher

import (
	"context"
	"time"
)

func WithFlushInterval[T any](ctx context.Context, seconds int) func(*Batcher[T]) {
	return func(b *Batcher[T]) {
		b.ctx = ctx

		b.flushInterval = new(time.Duration)
		*b.flushInterval = time.Duration(seconds) * time.Second
	}
}
