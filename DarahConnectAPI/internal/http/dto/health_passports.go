package dto

import "time"

type HealthPassportCreateRequest struct {
	UserId         int64  `json:"user_id" validate:"required"`
}

type HealthPassportUpdateRequest struct {
	Id             int64     `param:"id" validate:"required"`
	PassportNumber string    `json:"passport_number"` // Unique identifier for the health passport
	ExpiryDate     time.Time `json:"expiry_date"`     // Expiry date of the health passport
	Status         string    `json:"status"`          //'Active', 'Expired', 'Suspended'
}

type GetAllHealthPassportRequest struct {
	Page      int64  `query:"page"`
	Limit     int64  `query:"limit"`
	Search    string `query:"search"`
	Sort      string `query:"sort"`
	Order     string `query:"order"`
	Status    string `query:"status"`
}

type HealthPassportByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type HealthPassportByUserIdRequest struct {
	UserId int64 `param:"user_id" validate:"required"`
}
