package config

import (
	"os"
)

type Config struct {
	AppPort string
	Database DatabaseConfig
}

func MustLoad() *Config {

	cfg := &Config{

		AppPort: os.Getenv("ESTOQUE_PORT"),

		Database: DatabaseConfig{

			Driver: os.Getenv("DB_DRIVER"),

			Host: os.Getenv("DB_HOST"),
			Port: os.Getenv("DB_PORT"),
			User: os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			Name: os.Getenv("DB_NAME"),

			AutoMigrate: os.Getenv("DB_AUTO_MIGRATE") == "true",
		},
	}

	cfg.Database.Validate()

	return cfg
}