package http

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/service"
)

type StockClient struct {
	baseURL string
	client  *http.Client
}

func NewStockClient(baseURL string) *StockClient {
	return &StockClient{
		baseURL: baseURL,
		client:  &http.Client{Timeout: 5 * time.Second},
	}
}

func (s *StockClient) DebitStock(ctx context.Context, items []service.DebitItem) error {
	body, err := json.Marshal(items)
	if err != nil {
		return err
	}

	const maxAttempts = 3
	var lastErr error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		req, reqErr := http.NewRequestWithContext(
			ctx,
			http.MethodPost,
			s.baseURL+"/estoque-api/v1/stock/debit",
			bytes.NewReader(body),
		)
		if reqErr != nil {
			return reqErr
		}
		req.Header.Set("Content-Type", "application/json")
		if service.ShouldSimulateStockFailure(ctx) {
			req.Header.Set("X-Simulate-Stock-Failure", "true")
		}

		resp, doErr := s.client.Do(req)
		if doErr != nil {
			lastErr = service.ErrStockUnavailable
			if attempt < maxAttempts {
				time.Sleep(time.Duration(attempt) * 200 * time.Millisecond)
			}
			continue
		}

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			resp.Body.Close()
			return nil
		}

		var payload struct {
			Error string `json:"error"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&payload)
		resp.Body.Close()

		if resp.StatusCode >= 500 {
			lastErr = service.ErrStockUnavailable
			if attempt < maxAttempts {
				time.Sleep(time.Duration(attempt) * 200 * time.Millisecond)
			}
			continue
		}

		if payload.Error != "" {
			return fmt.Errorf(payload.Error)
		}
		return fmt.Errorf("estoque retornou status %d", resp.StatusCode)
	}

	if lastErr != nil {
		return fmt.Errorf("falha ao debitar estoque após %d tentativas: %w", maxAttempts, lastErr)
	}

	return errors.New("falha desconhecida ao debitar estoque")
}
