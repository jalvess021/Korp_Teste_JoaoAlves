package config

import (
	"os"
)

type Config struct {
	AppPort      string
	GinMode      string
	Database     DatabaseConfig
	StockBaseURL string
}

func MustLoad() *Config {

	appPort := os.Getenv("FATURAMENTO_PORT")
	if appPort == "" {
		appPort = "5001"
	}

	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "release"
	}

	stockPort := os.Getenv("ESTOQUE_PORT")
	if stockPort == "" {
		stockPort = "5002"
	}

	stockBaseURL := "http://estoque:" + stockPort

	cfg := &Config{

		AppPort: appPort,

		GinMode: ginMode,

		StockBaseURL: stockBaseURL,

		Database: DatabaseConfig{

			Driver: os.Getenv("DB_DRIVER"),

			Host:     os.Getenv("DB_HOST"),
			Port:     os.Getenv("DB_PORT"),
			User:     os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			Name:     os.Getenv("DB_NAME"),

			AutoMigrate: os.Getenv("DB_AUTO_MIGRATE") == "true",
		},
	}

	cfg.Database.Validate()

	return cfg
}
