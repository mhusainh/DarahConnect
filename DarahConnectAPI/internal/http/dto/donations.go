package dto

type DonationsCreate struct {
	UserID int64 `json:"user_id" validate:"required"`
	Amount int64 `json:"amount" validate:"required"`
	Transaction_time string `json:"transaction_time" validate:"required"`
	Transaction_status string `json:"transaction_status" validate:"required"`
}