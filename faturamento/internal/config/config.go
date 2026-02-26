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

	ginMode := os.Getenv("GIN_MODE")

	if ginMode == "" {
		ginMode = "release"
	}

	cfg := &Config{

		AppPort: os.Getenv("FATURAMENTO_PORT"),

		GinMode: ginMode,
		
		StockBaseURL: os.Getenv("ESTOQUE_PORT"),

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
	if cfg.StockBaseURL == "" {
		cfg.StockBaseURL = "http://estoque:5002"
	}

	return cfg
}
