package service

import (
	"database/sql"

	"github.com/google/uuid"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/domain"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/repository"
)

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
	return s.repo.CreateProduct(p)
}

type DebitItem struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity int `json:"quantity"`
}

func (s *ProductService) DebitStock(items []DebitItem) error {
	tx, err := s.db.Begin()

	if err != nil {
		return err
	}

	defer tx.Rollback()

	for _, item := range items {
		err := s.repo.DebitStock(
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