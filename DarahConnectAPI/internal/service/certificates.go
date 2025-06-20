package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type CertificateService interface {
	Create(ctx context.Context, req *dto.CertificateCreateRequest) error
	GetAll(ctx context.Context) ([]entity.Certificate, error)
	GetById(ctx context.Context, id int64) (*entity.Certificate, error)
	Update(ctx context.Context, req *dto.CertificateUpdateRequest) error
	Delete(ctx context.Context, id int64) error
}

type certificateService struct {
	certificateRepository repository.CertificateRepository
}

func NewCertificateService(certificateRepository repository.CertificateRepository) CertificateService {
	return &certificateService{
		certificateRepository,
	}
}

func (s *certificateService) Create(ctx context.Context, req *dto.CertificateCreateRequest) error {
	certificate := new(entity.Certificate)
	certificate.DonationId = req.DonationId
	certificate.UserId = req.UserId
	certificate.CertificateNumber = req.CertificateNumber
	certificate.DigitalSignature = req.DigitalSignature
	certificate.CertificateUrl = req.CertificateUrl

	if err := s.certificateRepository.Create(ctx, certificate); err != nil {
		return errors.New("Gagal membuat sertifikat")
	}
	return nil
}

func (s *certificateService) GetAll(ctx context.Context) ([]entity.Certificate, error) {
	certificates, err := s.certificateRepository.GetAll(ctx)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan sertifikat")
	}
	return certificates, nil
}

func (s *certificateService) GetById(ctx context.Context, id int64) (*entity.Certificate, error) {
	certificate, err := s.certificateRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan sertifikat")
	}
	return certificate, nil
}

func (s *certificateService) Update(ctx context.Context, req *dto.CertificateUpdateRequest) error {
	certificate, err := s.certificateRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("Gagal mendapatkan sertifikat")
	}

	if req.CertificateNumber != "" {
		certificate.CertificateNumber = req.CertificateNumber
	}
	if req.DigitalSignature != "" {
		certificate.DigitalSignature = req.DigitalSignature
	}
	if req.CertificateUrl != "" {
		certificate.CertificateUrl = req.CertificateUrl
	}

	if err := s.certificateRepository.Update(ctx, certificate); err != nil {
		return errors.New("Gagal update sertifikat")
	}
	return nil
}

func (s *certificateService) Delete(ctx context.Context, id int64) error {
	certificate, err := s.certificateRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Gagal mendapatkan sertifikat")
	}

	if err := s.certificateRepository.Delete(ctx, certificate); err != nil {
		return errors.New("Gagal delete sertifikat")
	}
	return nil
}