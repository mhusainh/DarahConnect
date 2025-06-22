package entity

import "time"

type BloodRequest struct {
	Id           int64     `json:"id"`
	UserId       int64     `json:"user_id"`
	User         User      `json:"user" gorm:"foreignKey:UserId;references:Id"`
	HospitalId   int64     `json:"hospital_id"`
	Hospital     Hospital  `json:"hospital" gorm:"foreignKey:HospitalId;references:Id"`
	PatientName  string    `json:"patient_name"`
	BloodType    string    `json:"blood_type"`
	Quantity     int       `json:"quantity"`
	UrgencyLevel string    `json:"urgency_level"`
	Diagnosis    string    `json:"diagnosis"`
	Status       string    `json:"status"` //'Pending', 'Verified', 'Fulfilled', 'Cancelled', 'Expired'
	ExpiryDate   time.Time `json:"expiry_date"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (BloodRequest) TableName() string {
	return "public.blood_requests"
}
