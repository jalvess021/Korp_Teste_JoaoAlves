package bootstrap

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/config"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/database"
	httpinfra "github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/infra/http"
)

type App struct {
	Config *config.Config
	DB     *sql.DB
	Router *gin.Engine
}

func NewApp() (*App, error) {

	cfg := config.MustLoad()

	db, err := database.ConnectPostgres(cfg.Database)
	if err != nil {
		return nil, err
	}

	router := httpinfra.SetupRouter(db)

	return &App{
		Config: cfg,
		DB:     db,
		Router: router,
	}, nil
}