package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/domain"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/repository"
)

type StockDebiter interface {
	DebitStock(ctx context.Context, items []DebitItem) error
}

type InvoiceService struct {
	repo  *repository.InvoiceRepository
	db    *sql.DB
	stock StockDebiter
}

func NewInvoiceService(repo *repository.InvoiceRepository, db *sql.DB, stock StockDebiter) *InvoiceService {
	return &InvoiceService{repo: repo, db: db, stock: stock}
}

type DebitItem struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
}

func (s *InvoiceService) ListInvoices(ctx context.Context) ([]domain.Invoice, error) {
	return s.repo.ListInvoices(ctx)
}

func (s *InvoiceService) GetInvoiceByID(ctx context.Context, id uuid.UUID) (domain.Invoice, error) {
	return s.repo.GetInvoiceByID(ctx, id)
}

func (s *InvoiceService) CreateInvoice(ctx context.Context, items []DebitItem) (domain.Invoice, error) {
	if len(items) == 0 {
		return domain.Invoice{}, fmt.Errorf("itens são obrigatórios")
	}

	invoiceItems := make([]domain.InvoiceItem, 0, len(items))
	for _, it := range items {
		if it.ProductID == uuid.Nil || it.Quantity <= 0 {
			return domain.Invoice{}, fmt.Errorf("itens inválidos")
		}
		invoiceItems = append(invoiceItems, domain.InvoiceItem{
			ProductID: it.ProductID,
			Quantity:  it.Quantity,
		})
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.Invoice{}, err
	}
	defer tx.Rollback()

	created, err := s.repo.CreateInvoice(ctx, tx, invoiceItems)
	if err != nil {
		return domain.Invoice{}, err
	}

	if err := tx.Commit(); err != nil {
		return domain.Invoice{}, err
	}

	return created, nil
}

func (s *InvoiceService) PrintInvoice(ctx context.Context, invoiceID uuid.UUID, idempotencyKey string) (domain.Invoice, error) {
	if idempotencyKey == "" {
		return domain.Invoice{}, fmt.Errorf("Idempotency-Key é obrigatório")
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.Invoice{}, err
	}
	defer tx.Rollback()

	prevStatus, err := s.repo.GetPrintByKey(ctx, tx, invoiceID, idempotencyKey)
	if err != nil {
		return domain.Invoice{}, err
	}
	if prevStatus == "SUCCESS" {
		inv, err := s.repo.GetInvoiceByID(ctx, invoiceID)
		if err != nil {
			return domain.Invoice{}, err
		}
		_ = tx.Commit()
		return inv, nil
	}
	if prevStatus == "IN_PROGRESS" {
		return domain.Invoice{}, fmt.Errorf("impressão em processamento")
	}

	inserted, err := s.repo.UpsertPrintInProgress(ctx, tx, invoiceID, idempotencyKey)
	if err != nil {
		return domain.Invoice{}, err
	}
	if !inserted {
		return domain.Invoice{}, fmt.Errorf("impressão em processamento")
	}

	inv, err := s.repo.LockInvoiceForPrint(ctx, tx, invoiceID)
	if err != nil {
		return domain.Invoice{}, err
	}
	if inv.Status != domain.InvoiceStatusOpen {
		return domain.Invoice{}, fmt.Errorf("nota não está aberta")
	}

	full, err := s.repo.GetInvoiceByID(ctx, invoiceID)
	if err != nil {
		return domain.Invoice{}, err
	}
	if len(full.Items) == 0 {
		return domain.Invoice{}, fmt.Errorf("nota sem itens")
	}

	debitItems := make([]DebitItem, 0, len(full.Items))
	for _, it := range full.Items {
		debitItems = append(debitItems, DebitItem{ProductID: it.ProductID, Quantity: it.Quantity})
	}

	if err := s.stock.DebitStock(ctx, debitItems); err != nil {
		return domain.Invoice{}, fmt.Errorf("falha ao debitar estoque: %w", err)
	}

	if err := s.repo.SetInvoiceClosed(ctx, tx, invoiceID); err != nil {
		return domain.Invoice{}, err
	}
	if err := s.repo.SetPrintSuccess(ctx, tx, invoiceID, idempotencyKey); err != nil {
		return domain.Invoice{}, err
	}

	if err := tx.Commit(); err != nil {
		return domain.Invoice{}, err
	}

	updated, err := s.repo.GetInvoiceByID(ctx, invoiceID)
	if err != nil {
		return domain.Invoice{}, err
	}
	return updated, nil
}

func IsNotFound(err error) bool {
	return errors.Is(err, repository.ErrInvoiceNotFound)
}
