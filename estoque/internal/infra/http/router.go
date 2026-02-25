package http

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	v1handler "github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/handler/v1"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/repository"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/service"
)

func SetupRouter(db *sql.DB) *gin.Engine {

	router := gin.Default()

	productRepo := repository.NewProductRepository(db)
	productService := service.NewProductService(productRepo, db)
	productHandler := v1handler.NewProductHandler(productService)

	router.GET("/", func(c *gin.Context) {
		routes := router.Routes()

		var list []gin.H

		for _, r := range routes {
			list = append(list, gin.H{
				"method": r.Method,
				"path": r.Path,
			})
		}

		c.IndentedJSON(200, gin.H{
			"service": "estoque",
			"routes": list,
		})
	})

	router.NoRoute(func(c *gin.Context) {
		c.Redirect(302, "/")
	})

	api := router.Group("/api")
	{
		v1 := api.Group("/v1")
		{
			products := v1.Group("/products")
			{
				products.GET("", productHandler.ListProducts)
				products.POST("", productHandler.CreateProduct)
			}
			stock := v1.Group("/stock")
			{
				stock.POST("/debit", productHandler.DebitStock)
			}
		}
	}

	return router
}