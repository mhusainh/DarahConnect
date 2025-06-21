package dto

type DonationsCreate struct {
	UserID int64 `json:"user_id" validate:"required"`
	Amount int64 `json:"amount" validate:"required"`
}