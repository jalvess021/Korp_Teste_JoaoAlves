package http

import (
	"database/sql"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/config"
	v1handler "github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/handler/v1"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/repository"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/service"
)

func SetupRouter(db *sql.DB, cfg *config.Config) *gin.Engine {

	gin.SetMode(cfg.GinMode)
	router := gin.Default()

	stockClient := NewStockClient(cfg.StockBaseURL)

	invoiceRepo := repository.NewInvoiceRepository(db)
	invoiceService := service.NewInvoiceService(invoiceRepo, db, stockClient)
	invoiceHandler := v1handler.NewInvoiceHandler(invoiceService)

	router.GET("/", func(c *gin.Context) {
		routes := router.Routes()

		var list []gin.H

		for _, r := range routes {
			list = append(list, gin.H{
				"method": r.Method,
				"path":   r.Path,
			})
		}

		c.IndentedJSON(200, gin.H{
			"service": "faturamento",
			"routes":  list,
		})
	})

	router.NoRoute(func(c *gin.Context) {
		c.Redirect(302, "/")
	})

	api := router.Group("/faturamento-api")
	{
		v1 := api.Group("/v1")
		{
			invoices := v1.Group("/invoices")
			{
				invoices.POST("", invoiceHandler.CreateInvoice)
				invoices.GET("", invoiceHandler.ListInvoices)
				invoices.GET("/:id", invoiceHandler.GetInvoiceByID)
				invoices.POST("/:id/print", invoiceHandler.PrintInvoice)
			}
		}
	}

	return router
}
