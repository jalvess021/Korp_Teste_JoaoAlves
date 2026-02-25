package bootstrap

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/config"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/infra/database"
	httpinfra "github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/infra/http"
)

type App struct {
	Config *config.Config
	DB     *sql.DB
	Router *gin.Engine
}

func NewApp() (*App, error) {

	cfg := config.MustLoad()
	log.Println("Configurações de inicialização carregadas.")
	log.Printf("Configurações utilizadas | {AppPort=%s}, {AutoMigrate=%t} & {Database = %s:%s/%s}", 
				cfg.AppPort, 
				cfg.Database.AutoMigrate, 
				cfg.Database.Host, 
				cfg.Database.Port, 
				cfg.Database.Name,
			)

	db, err := database.ConnectPostgres(cfg.Database)
	if err != nil {
		return nil, err
	}

	if cfg.Database.AutoMigrate {
		if err := database.RunMigrations(db); err != nil {
			_ = db.Close()
			return nil, err
		}
		log.Printf("Migrations de inicialização executadas com sucesso.")
	}

	router := httpinfra.SetupRouter(db)

	return &App{
		Config: cfg,
		DB:     db,
		Router: router,
	}, nil
}