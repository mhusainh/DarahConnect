package entity

import "time"

type Certificate struct {
	Id                int64     `json:"id"`
	DonationId        int64     `json:"donation_id"` // Reference to the blood donation
	UserId            int64     `json:"user_id"`
	CertificateNumber string    `json:"certificate_number"` // Unique identifier for the certificate
	DigitalSignature  string    `json:"digital_signature"` // Digital signature of the certificate
	CertificateUrl    string    `json:"certificate_url"`   // URL to access the certificate document
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (Certificate) TableName() string {
	return "public.certificates"
}
