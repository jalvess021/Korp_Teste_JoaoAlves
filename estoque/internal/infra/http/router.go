package http

import (
	"github.com/gin-gonic/gin"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/handler"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "OK"})
	})

	return router
}