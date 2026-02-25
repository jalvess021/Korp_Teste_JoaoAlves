package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/config"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/database"
)

func main() {

	cfg := config.MustLoad()

	log.Println("===== CONFIG =====")
	log.Printf("APP_PORT: %s\n", cfg.AppPort)
	log.Printf("DB_DRIVER: %s\n", cfg.Database.Driver)
	log.Printf("DB_HOST: %s\n", cfg.Database.Host)
	log.Printf("DB_PORT: %s\n", cfg.Database.Port)
	log.Printf("DB_USER: %s\n", cfg.Database.User)
	log.Printf("DB_NAME: %s\n", cfg.Database.Name)
	log.Println("==================")

	if cfg.Database.Driver == "postgres" {
		
		db, err := database.ConnectPostgres(cfg.Database)

		if err != nil {
			log.Fatalf("Erro ao conectar PostgreSQL: %v", err)
		}

		defer db.Close()

		log.Println("Banco conectado com sucesso")
	}

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	port := cfg.AppPort

	if port == "" {
		port = "5002"
	}

	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("Servidor rodando na porta %s\n", port)
	log.Fatal(http.ListenAndServe(serverAddr, nil))
}