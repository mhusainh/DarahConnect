package dto

import "time"

type BloodDonationCreateRequest struct {
	UserId         int64     `json:"user_id" validate:"required"`
	HospitalId     int64     `json:"hospital_id" validate:"required"`
	RegistrationId int64     `json:"registration_id" validate:"required"`
	DonationDate   time.Time `json:"donation_date" validate:"required"`
	BloodType      string    `json:"blood_type" validate:"required"` // e.g., "A+", "O-", etc.
}

type BloodDonationUpdateRequest struct {
	Id           int64     `param:"id" validate:"required"`
	DonationDate time.Time `json:"donation_date"`
	BloodType    string    `json:"blood_type"` // e.g., "A+", "O-", etc.
	Status       string    `json:"status"`     //'Completed', 'Rejected', 'Deferred'
}