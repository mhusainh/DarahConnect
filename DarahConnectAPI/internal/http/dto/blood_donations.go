package dto

import (
	"mime/multipart"
	"time"
)

type BloodDonationCreateRequest struct {
	UserId         int64                 `json:"user_id" validate:"required"`
	HospitalId     int64                 `json:"hospital_id" validate:"required"`
	RegistrationId int64                 `json:"registration_id" validate:"required"`
	DonationDate   time.Time             `json:"donation_date" validate:"required"`
	BloodType      string                `json:"blood_type" validate:"required"` // e.g., "A+", "O-", etc.
	Image          *multipart.FileHeader `json:"image" validate:"required,ext=jpg|jpeg|png"`
}

type BloodDonationUpdateRequest struct {
	Id           int64                 `param:"id" validate:"required"`
	DonationDate time.Time             `json:"donation_date"`
	BloodType    string                `json:"blood_type"` // e.g., "A+", "O-", etc.
	Status       string                `json:"status"`     //'Completed', 'Rejected', 'Deferred'
	Image        *multipart.FileHeader `json:"image" validate:"omitempty,ext=jpg|jpeg|png"`
}

type BloodDonationByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type GetAllBloodDonationRequest struct {
	Page      int64  `query:"page"`
	Limit     int64  `query:"limit"`
	Search    string `query:"search"`
	Sort      string `query:"sort"`
	Order     string `query:"order"`
	Status    string `query:"status"`
	StartDate string `query:"start_date"`
	EndDate   string `query:"end_date"`
	BloodType string `query:"blood_type"`
}
