package service

import "context"

type contextKey string

const simulateStockFailureContextKey contextKey = "simulate-stock-failure"

func WithSimulateStockFailure(ctx context.Context, enabled bool) context.Context {
	if !enabled {
		return ctx
	}
	return context.WithValue(ctx, simulateStockFailureContextKey, true)
}

func ShouldSimulateStockFailure(ctx context.Context) bool {
	value, ok := ctx.Value(simulateStockFailureContextKey).(bool)
	return ok && value
}
