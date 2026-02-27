package service

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/domain"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/repository"
)

var ErrProductCodeAlreadyExists = errors.New("product code already exists")

type ProductService struct {
	repo *repository.ProductRepository
	db   *sql.DB
}

func NewProductService(repo *repository.ProductRepository, db *sql.DB) *ProductService {
	return &ProductService{
		repo: repo,
		db:   db,
	}
}

func (s *ProductService) ListProducts() ([]domain.Product, error) {
	return s.repo.ListProducts()
}

func (s *ProductService) CreateProduct(p domain.Product) (domain.Product, error) {
	exists, err := s.repo.ExistsByCode(p.Code)
	if err != nil {
		return domain.Product{}, err
	}

	if exists {
		return domain.Product{}, ErrProductCodeAlreadyExists
	}

	return s.repo.CreateProduct(p)
}

func IsProductCodeAlreadyExists(err error) bool {
	return errors.Is(err, ErrProductCodeAlreadyExists)
}

type DebitItem struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
}

func (s *ProductService) DebitStock(ctx context.Context, items []DebitItem) error {
	tx, err := s.db.BeginTx(ctx, nil)

	if err != nil {
		return err
	}

	defer tx.Rollback()

	for _, item := range items {
		err := s.repo.DebitStock(
			ctx,
			tx,
			item.ProductID,
			item.Quantity,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
