package domain

import (
	"time"

	"github.com/google/uuid"
)

const (
	InvoiceStatusOpen   = "OPEN"
	InvoiceStatusClosed = "CLOSED"
)

type Invoice struct {
	ID        uuid.UUID     `json:"id"`
	Number    int64         `json:"number"`
	Status    string        `json:"status"`
	CreatedAt time.Time     `json:"createdAt"`
	ClosedAt  *time.Time    `json:"closedAt"`
	Items     []InvoiceItem `json:"items,omitempty"`
}

type InvoiceItem struct {
	ID        uuid.UUID `json:"id"`
	InvoiceID uuid.UUID `json:"invoiceId"`
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
}
