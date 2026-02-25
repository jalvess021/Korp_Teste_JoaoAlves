package bootstrap

import (
	"database/sql"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/config"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/database"
)

func App() (*sql.DB, error) {
	cfg := config.MustLoad()
	
	db, err := database.ConnectPostgres(cfg.Database)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	return db, nil
}