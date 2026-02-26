package http

import (
	"bytes"
	"context"
	"encoding/json"
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

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		s.baseURL+"/estoque-api/v1/stock/debit",
		bytes.NewReader(body),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	var payload struct {
		Error string `json:"error"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&payload)
	if payload.Error != "" {
		return fmt.Errorf(payload.Error)
	}
	return fmt.Errorf("estoque retornou status %d", resp.StatusCode)
}
