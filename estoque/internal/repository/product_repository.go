package repository

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/domain"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{
		db: db,
	}
}

func (r *ProductRepository) ListProducts() ([]domain.Product, error) {

	rows, err := r.db.Query(`
		SELECT id, code, description, balance
		FROM products
		ORDER BY code
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var products []domain.Product

	for rows.Next() {

		var p domain.Product

		err := rows.Scan(
			&p.ID,
			&p.Code,
			&p.Description,
			&p.Balance,
		)

		if err != nil {
			return nil, err
		}

		products = append(products, p)
	}

	return products, nil
}

func (r *ProductRepository) CreateProduct(p domain.Product) (domain.Product, error) {

	var created domain.Product

	err := r.db.QueryRow(`
		INSERT INTO products (code, description, balance)
		VALUES ($1,$2,$3)
		RETURNING id, code, description, balance
	`,
		p.Code,
		p.Description,
		p.Balance,
	).Scan(
		&created.ID,
		&created.Code,
		&created.Description,
		&created.Balance,
	)

	if err != nil {
		return domain.Product{}, err
	}

	return created, nil
}

func (r *ProductRepository) DebitStock(tx *sql.Tx, productID uuid.UUID, quantity int) error {

	var balance int

	err := tx.QueryRow(`
		SELECT balance
		FROM products
		WHERE id=$1
		FOR UPDATE
	`, productID).Scan(&balance)

	if err != nil {
		return err
	}

	if balance < quantity {
		return fmt.Errorf("saldo insuficiente")
	}

	_, err = tx.Exec(`
		UPDATE products
		SET balance = balance - $1
		WHERE id=$2
	`,
		quantity,
		productID,
	)

	return err
}