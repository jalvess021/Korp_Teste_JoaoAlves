package config

import "fmt"

func (c *DatabaseConfig) Validate() {

	if c.Driver == "" {
		panic("database driver não configurado")
	}

	switch c.Driver {
		case "postgres":
			c.validatePostgres()

		default:
			panic(fmt.Sprintf("driver não suportado: %s", c.Driver))
	}
}

func (c *DatabaseConfig) validatePostgres() {

	if c.User == "" || c.Password == "" || c.Host == "" || c.Port == "" || c.Name == "" { 
		panic("variáveis de ambiente do PostgreSQL estão faltando ou estão vazias") 
	}

}