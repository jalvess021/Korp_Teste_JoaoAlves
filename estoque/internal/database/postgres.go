package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/config"
)

func ConnectPostgres(cfg config.DatabaseConfig) (*sql.DB, error) {

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Password,
		cfg.Name,
	)

	db, err := sql.Open("postgres", connStr)

	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}