package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/config"
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
		return nil, fmt.Errorf("erro ao abrir conexão com PostgreSQL: %w", err)
	}

	log.Println("Conexão com PostgreSQL aberta, realizando ping...")

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("erro ao tentar realizar o ping ao banco de dados: %w", err)
	}

	log.Println("Ping ao PostgreSQL bem-sucedido, conexão estabelecida com sucesso")

	return db, nil
}
