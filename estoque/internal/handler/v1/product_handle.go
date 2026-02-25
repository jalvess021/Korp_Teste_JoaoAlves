package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/domain"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/estoque/internal/service"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(service *service.ProductService) *ProductHandler {
	return &ProductHandler{
		service: service,
	}
}

func (h *ProductHandler) ListProducts(c *gin.Context) {

	products, err := h.service.ListProducts()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.IndentedJSON(http.StatusOK, products)
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {

	var product domain.Product

	if err := c.ShouldBindJSON(&product); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "dados inválidos",
		})
		return
	}

	created, err := h.service.CreateProduct(product)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, created)
}

func (h *ProductHandler) DebitStock(c *gin.Context) {

	var items []service.DebitItem

	if err := c.ShouldBindJSON(&items); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "dados inválidos",
		})
		return
	}

	err := h.service.DebitStock(items)

	if err != nil {
		c.IndentedJSON(http.StatusConflict, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.Status(http.StatusOK)
}