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
