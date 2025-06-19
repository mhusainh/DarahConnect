package dto

import "time"

type HealthPassportCreateRequest struct {
	UserId         int64     `json:"user_id" validate:"required"`
	PassportNumber string    `json:"passport_number" validate:"required"` // Unique identifier for the health passport
}

type HealthPassportUpdateRequest struct {
	Id             int64     `param:"id" validate:"required"`
	UserId         int64     `json:"user_id"`
	PassportNumber string    `json:"passport_number"` // Unique identifier for the health passport
	ExpiryDate     time.Time `json:"expiry_date"`     // Expiry date of the health passport
	Status         string    `json:"status"`
}