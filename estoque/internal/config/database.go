package config

import (
	"fmt"
)
type DatabaseConfig struct {

	Driver string

	Host string
	Port string
	User string
	Password string
	Name string
}

func (c *DatabaseConfig) Validate() {

	if c.Driver == "" {
		panic("database driver não configurado")
	}

	switch c.Driver {
		case "postgres":
			c.validatePostgres()

		default:
			panic(fmt.Errorf("driver não suportado: %s", c.Driver))
	}
}

func (c *DatabaseConfig) validatePostgres() {

	if c.User == "" || c.Password == "" || c.Host == "" || c.Port == "" || c.Name == "" { 
		panic("variáveis de ambiente do PostgreSQL estão faltando ou estão vazias") 
	}

}