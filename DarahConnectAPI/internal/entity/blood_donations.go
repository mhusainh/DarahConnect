package entity

import "time"

type BloodDonation struct {
	Id             int64     `json:"id"`
	UserId         int64     `json:"user_id"`
	HospitalId     int64     `json:"hospital_id"`
	RegistrationId int64     `json:"registration_id"`
	DonationDate   time.Time `json:"donation_date"`
	BloodType      string    `json:"blood_type"` // e.g., "A+", "O-", etc.
	Status         string    `json:"status"`     // e.g., "completed", "pending", "cancelled"
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (BloodDonation) TableName() string {
	return "public.blood_donations"
}
