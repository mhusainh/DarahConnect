package dto

import "time"

type BloodRequestCreateRequest struct {
	UserId       int64     `json:"user_id" validate:"required"`
	HospitalId   int64     `json:"hospital_id" validate:"required"`
	PatientName  string    `json:"patient_name" validate:"required"` // Unique identifier for the health passport
	BloodType    string    `json:"blood_type" validate:"required"`   // Unique identifier for the health passport
	Quantity     int       `json:"quantity" validate:"required"`
	UrgencyLevel string    `json:"urgency_level" validate:"required"` // Unique identifier for the health passport
	Diagnosis    string    `json:"diagnosis" validate:"required"`     // Unique identifier for the health passport
	ExpiryDate   time.Time `json:"expiry_date" validate:"required"`
}

type BloodRequestUpdateRequest struct {
	Id           int64     `param:"id" validate:"required"`
	PatientName  string    `json:"patient_name"` // Unique identifier for the health passport
	BloodType    string    `json:"blood_type"`   // Unique identifier for the health passport
	Quantity     int       `json:"quantity"`
	UrgencyLevel string    `json:"urgency_level"` // Unique identifier for the health passport
	Diagnosis    string    `json:"diagnosis"`     // Unique identifier for the health passport
	Status       string    `json:"status"`        // Unique identifier for the health passport
	ExpiryDate   time.Time `json:"expiry_date"`
}

type BloodRequestByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type BloodRequestByUserIdRequest struct {
	UserId int64 `param:"user_id" validate:"required"`
}

type BloodRequestByHospitalIdRequest struct {
	HospitalId int64 `param:"hospital_id" validate:"required"`
}

type GetAllBloodRequestRequest struct {
	Page           int64  `query:"page"`
	Limit          int64  `query:"limit"`
	Search         string `query:"search"`
	Sort           string `query:"sort"`
	Order          string `query:"order"`
	StartDate      string `query:"start_date"`
	EndDate        string `query:"end_date"`
	MaxQuantity    int64   `query:"max_quantity"`
	MinQuantity    int64   `query:"min_quantity"`
	UrgencyLevel   string `query:"urgency_level"`
	BloodType      string `query:"blood_type"`
}