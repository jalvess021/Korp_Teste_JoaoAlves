package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/domain"
	"github.com/jalvess021/Korp_Teste_JoaoAlves/faturamento/internal/service"
)

type InvoiceHandler struct {
	service *service.InvoiceService
}

func NewInvoiceHandler(service *service.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{service: service}
}

func (h *InvoiceHandler) ListInvoices(c *gin.Context) {
	invoices, err := h.service.ListInvoices(c.Request.Context())
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if invoices == nil {
		c.IndentedJSON(http.StatusOK, []domain.Invoice{})
		return
	}
	c.IndentedJSON(http.StatusOK, invoices)
}

type createInvoiceRequest struct {
	Items []service.DebitItem `json:"items"`
}

func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var req createInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "dados inválidos"})
		return
	}

	if len(req.Items) == 0 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "nota fiscal deve ter pelo menos um item"})
		return
	}

	for i, item := range req.Items {
		if item.ProductID == uuid.Nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "item sem produto especificado"})
			return
		}
		if item.Quantity <= 0 {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "quantidade do item deve ser maior que zero"})
			return
		}

		for j := i + 1; j < len(req.Items); j++ {
			if req.Items[j].ProductID == item.ProductID {
				c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "produto duplicado na nota fiscal"})
				return
			}
		}
	}

	created, err := h.service.CreateInvoice(c.Request.Context(), req.Items)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, created)
}

func (h *InvoiceHandler) GetInvoiceByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}

	inv, err := h.service.GetInvoiceByID(c.Request.Context(), id)
	if err != nil {
		if service.IsNotFound(err) {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, inv)
}

func (h *InvoiceHandler) PrintInvoice(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}
	key := c.GetHeader("Idempotency-Key")
	simulateStockFailure := c.GetHeader("X-Simulate-Stock-Failure") == "true"
	ctx := service.WithSimulateStockFailure(c.Request.Context(), simulateStockFailure)

	inv, err := h.service.PrintInvoice(ctx, id, key)
	if err != nil {
		status := http.StatusConflict

		switch {
		case key == "":
			status = http.StatusBadRequest
		case service.IsNotFound(err):
			status = http.StatusNotFound
		case service.IsStockUnavailable(err):
			status = http.StatusServiceUnavailable
		}

		c.IndentedJSON(status, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, inv)
}
