package domain

import "github.com/google/uuid"

type Product struct {

	ID uuid.UUID `json:"id"`

	Code string `json:"code"`

	Description string `json:"description"`

	Balance int `json:"balance"`
}