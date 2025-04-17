package batcher

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Batcher[T any] struct {
	mu            sync.Mutex
	buffer        []T
	size          int
	flush         func([]T)
	ctx           context.Context
	flushInterval *time.Duration
}

func NewBatcher[T any](size int, flush func([]T), options ...func(*Batcher[T])) *Batcher[T] {
	b := &Batcher[T]{
		buffer: make([]T, 0, size),
		size:   size,
		flush:  flush,
	}

	for _, option := range options {
		option(b)
	}

	return b
}

func (b *Batcher[T]) BatchSize() int {
	return b.size
}

func (b *Batcher[T]) FlushInterval() *time.Duration {
	return b.flushInterval
}

func (b *Batcher[T]) Add(item T) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.buffer = append(b.buffer, item)
	if len(b.buffer) >= b.size {
		b.flushNow()
	}
}

func (b *Batcher[T]) RunFlushScheduler() error {
	if b.flushInterval == nil {
		return fmt.Errorf("Batcher instantiated without a flush interval")
	}

	ticker := time.NewTicker(*b.flushInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			b.Flush()

		case <-b.ctx.Done():
			return nil
		}
	}
}

func (b *Batcher[T]) Flush() {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.flushNow()
}

func (b *Batcher[T]) flushNow() {
	if len(b.buffer) == 0 {
		return
	}
	b.flush(b.buffer)
	b.buffer = b.buffer[:0]
}
