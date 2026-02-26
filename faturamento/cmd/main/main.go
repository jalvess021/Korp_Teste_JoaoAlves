package main

import (
	"log"

	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/bootstrap"
)

func main() {
	log.SetPrefix("[KORP-FATURAMENTO] ")
	log.SetFlags(log.LstdFlags)
	
	app, err := bootstrap.NewApp()
	if err != nil {
		log.Fatal(err)
	}

	defer app.DB.Close()

	log.Printf("Servidor rodando na porta %s", app.Config.AppPort)

	log.Fatal(
		app.Router.Run(":" + app.Config.AppPort),
	)
}