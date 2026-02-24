package main

import (
	"log"
	"net/http"
)

func main() {

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	log.Println("Servidor rodando na porta 5002")

	http.ListenAndServe(":5002", nil)
}