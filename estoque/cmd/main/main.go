package main

import (
	"fmt"
	"log"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/bootstrap"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/config"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/infra/http"
)

func main() {
	bootstrap.App()
	router := http.SetupRouter()

	port := config.Config{}.AppPort
	if port == "" {
		port = "5002"
	}

	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("Servidor rodando na porta %s\n", port)
	log.Fatal(router.Run(serverAddr))
}