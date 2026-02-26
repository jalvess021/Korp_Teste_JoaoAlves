package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/domain"
)

var ErrInvoiceNotFound = errors.New("nota não encontrada")

type InvoiceRepository struct {
	db *sql.DB
}

func NewInvoiceRepository(db *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) ListInvoices(ctx context.Context) ([]domain.Invoice, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT i.id, i.number, i.status, i.created_at, i.closed_at,
		       it.id, it.invoice_id, it.product_id, it.quantity
		FROM invoices i
		LEFT JOIN invoice_items it ON it.invoice_id = i.id
		ORDER BY i.number DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byID := map[uuid.UUID]*domain.Invoice{}
	order := make([]uuid.UUID, 0)

	for rows.Next() {
		var (
			invID     uuid.UUID
			number    int64
			status    string
			createdAt time.Time
			closedAt  sql.NullTime

			itemID      sql.NullString
			itemInvoice sql.NullString
			productID   sql.NullString
			quantity    sql.NullInt32
		)

		if err := rows.Scan(
			&invID, &number, &status, &createdAt, &closedAt,
			&itemID, &itemInvoice, &productID, &quantity,
		); err != nil {
			return nil, err
		}

		inv, ok := byID[invID]
		if !ok {
			var closedAtPtr *time.Time
			if closedAt.Valid {
				v := closedAt.Time
				closedAtPtr = &v
			}
			inv = &domain.Invoice{
				ID:        invID,
				Number:    number,
				Status:    status,
				CreatedAt: createdAt,
				ClosedAt:  closedAtPtr,
				Items:     []domain.InvoiceItem{},
			}
			byID[invID] = inv
			order = append(order, invID)
		}

		if itemID.Valid {
			itID, err := uuid.Parse(itemID.String)
			if err != nil {
				return nil, err
			}
			invID2, err := uuid.Parse(itemInvoice.String)
			if err != nil {
				return nil, err
			}
			prodID, err := uuid.Parse(productID.String)
			if err != nil {
				return nil, err
			}
			inv.Items = append(inv.Items, domain.InvoiceItem{
				ID:        itID,
				InvoiceID: invID2,
				ProductID: prodID,
				Quantity:  int(quantity.Int32),
			})
		}
	}

	result := make([]domain.Invoice, 0, len(order))
	for _, id := range order {
		result = append(result, *byID[id])
	}
	return result, nil
}

func (r *InvoiceRepository) GetInvoiceByID(ctx context.Context, id uuid.UUID) (domain.Invoice, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT i.id, i.number, i.status, i.created_at, i.closed_at,
		       it.id, it.invoice_id, it.product_id, it.quantity
		FROM invoices i
		LEFT JOIN invoice_items it ON it.invoice_id = i.id
		WHERE i.id = $1
		ORDER BY i.number DESC
	`, id)
	if err != nil {
		return domain.Invoice{}, err
	}
	defer rows.Close()

	var inv *domain.Invoice

	for rows.Next() {
		var (
			invID     uuid.UUID
			number    int64
			status    string
			createdAt time.Time
			closedAt  sql.NullTime

			itemID      sql.NullString
			itemInvoice sql.NullString
			productID   sql.NullString
			quantity    sql.NullInt32
		)

		if err := rows.Scan(
			&invID, &number, &status, &createdAt, &closedAt,
			&itemID, &itemInvoice, &productID, &quantity,
		); err != nil {
			return domain.Invoice{}, err
		}

		if inv == nil {
			var closedAtPtr *time.Time
			if closedAt.Valid {
				v := closedAt.Time
				closedAtPtr = &v
			}
			inv = &domain.Invoice{
				ID:        invID,
				Number:    number,
				Status:    status,
				CreatedAt: createdAt,
				ClosedAt:  closedAtPtr,
				Items:     []domain.InvoiceItem{},
			}
		}

		if itemID.Valid {
			itID, err := uuid.Parse(itemID.String)
			if err != nil {
				return domain.Invoice{}, err
			}
			invID2, err := uuid.Parse(itemInvoice.String)
			if err != nil {
				return domain.Invoice{}, err
			}
			prodID, err := uuid.Parse(productID.String)
			if err != nil {
				return domain.Invoice{}, err
			}
			inv.Items = append(inv.Items, domain.InvoiceItem{
				ID:        itID,
				InvoiceID: invID2,
				ProductID: prodID,
				Quantity:  int(quantity.Int32),
			})
		}
	}

	if inv == nil {
		return domain.Invoice{}, ErrInvoiceNotFound
	}
	return *inv, nil
}

func (r *InvoiceRepository) CreateInvoice(ctx context.Context, tx *sql.Tx, items []domain.InvoiceItem) (domain.Invoice, error) {
	var created domain.Invoice
	var closedAt sql.NullTime
	if err := tx.QueryRowContext(ctx, `
		INSERT INTO invoices (status)
		VALUES ($1)
		RETURNING id, number, status, created_at, closed_at
	`, domain.InvoiceStatusOpen).Scan(
		&created.ID,
		&created.Number,
		&created.Status,
		&created.CreatedAt,
		&closedAt,
	); err != nil {
		return domain.Invoice{}, err
	}
	if closedAt.Valid {
		v := closedAt.Time
		created.ClosedAt = &v
	}

	created.Items = make([]domain.InvoiceItem, 0, len(items))
	for _, it := range items {
		var createdItem domain.InvoiceItem
		if err := tx.QueryRowContext(ctx, `
			INSERT INTO invoice_items (invoice_id, product_id, quantity)
			VALUES ($1,$2,$3)
			RETURNING id, invoice_id, product_id, quantity
		`, created.ID, it.ProductID, it.Quantity).Scan(
			&createdItem.ID,
			&createdItem.InvoiceID,
			&createdItem.ProductID,
			&createdItem.Quantity,
		); err != nil {
			return domain.Invoice{}, err
		}
		created.Items = append(created.Items, createdItem)
	}

	return created, nil
}

func (r *InvoiceRepository) LockInvoiceForPrint(ctx context.Context, tx *sql.Tx, invoiceID uuid.UUID) (domain.Invoice, error) {
	var inv domain.Invoice
	var closedAt sql.NullTime
	if err := tx.QueryRowContext(ctx, `
		SELECT id, number, status, created_at, closed_at
		FROM invoices
		WHERE id=$1
		FOR UPDATE
	`, invoiceID).Scan(&inv.ID, &inv.Number, &inv.Status, &inv.CreatedAt, &closedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Invoice{}, ErrInvoiceNotFound
		}
		return domain.Invoice{}, err
	}
	if closedAt.Valid {
		v := closedAt.Time
		inv.ClosedAt = &v
	}
	return inv, nil
}

func (r *InvoiceRepository) SetInvoiceClosed(ctx context.Context, tx *sql.Tx, invoiceID uuid.UUID) error {
	_, err := tx.ExecContext(ctx, `
		UPDATE invoices
		SET status=$1, closed_at=NOW()
		WHERE id=$2
	`, domain.InvoiceStatusClosed, invoiceID)
	return err
}

func (r *InvoiceRepository) GetPrintByKey(ctx context.Context, tx *sql.Tx, invoiceID uuid.UUID, key string) (string, error) {
	var status string
	err := tx.QueryRowContext(ctx, `
		SELECT status
		FROM invoice_prints
		WHERE invoice_id=$1 AND idempotency_key=$2
	`, invoiceID, key).Scan(&status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return status, nil
}

func (r *InvoiceRepository) UpsertPrintInProgress(ctx context.Context, tx *sql.Tx, invoiceID uuid.UUID, key string) (bool, error) {
	res, err := tx.ExecContext(ctx, `
		INSERT INTO invoice_prints (invoice_id, idempotency_key, status)
		VALUES ($1,$2,'IN_PROGRESS')
		ON CONFLICT (invoice_id, idempotency_key) DO NOTHING
	`, invoiceID, key)
	if err != nil {
		return false, err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return rows > 0, nil
}

func (r *InvoiceRepository) SetPrintSuccess(ctx context.Context, tx *sql.Tx, invoiceID uuid.UUID, key string) error {
	_, err := tx.ExecContext(ctx, `
		UPDATE invoice_prints
		SET status='SUCCESS'
		WHERE invoice_id=$1 AND idempotency_key=$2
	`, invoiceID, key)
	return err
}
