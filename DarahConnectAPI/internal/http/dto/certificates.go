package dto

type CertificateCreateRequest struct {
	DonationId int64 `json:"donation_id" validate:"required"`
	UserId     int64 `json:"user_id" validate:"required"`
	CertificateNumber string `json:"certificate_number" validate:"required"` // Unique identifier for the certificat
	DigitalSignature string `json:"digital_signature" validate:"required"` // Digital signature of the certificate
	CertificateUrl string `json:"certificate_url" validate:"required"` // URL to access the certificate document
}

type CertificateUpdateRequest struct {
	Id int64 `param:"id" validate:"required"`
	DonationId int64 `json:"donation_id"`
	UserId     int64 `json:"user_id"`
	CertificateNumber string `json:"certificate_number"` // Unique identifier for the certificat
	DigitalSignature string `json:"digital_signature"` // Digital signature of the certificate
	CertificateUrl string `json:"certificate_url"` // URL to access the certificate document
}