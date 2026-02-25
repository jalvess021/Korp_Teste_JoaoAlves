package config

import "os"

func MustLoad() *Config {

	cfg := &Config{

		AppPort: os.Getenv("APP_PORT"),

		Database: DatabaseConfig{

			Driver: os.Getenv("DB_DRIVER"),

			Host: os.Getenv("DB_HOST"),
			Port: os.Getenv("DB_PORT"),
			User: os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			Name: os.Getenv("DB_NAME"),
		},
	}

	cfg.Database.Validate()

	return cfg
}