package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/utils"
)

type CertificateService interface {
	Create(ctx context.Context, bloodDonation *entity.BloodDonation) (*entity.Certificate, error)
	GetAll(ctx context.Context, req dto.GetAllCertificateRequest) ([]entity.Certificate, int64, error)
	GetById(ctx context.Context, id int64) (*entity.Certificate, error)
	GetByUser(ctx context.Context, userId int64, req dto.GetAllCertificateRequest) ([]entity.Certificate, int64, error)
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

func (s *certificateService) Create(ctx context.Context, bloodDonation *entity.BloodDonation) (*entity.Certificate, error) {
	certificateNumber, err := utils.GenerateUniqueCertificateNumber()
	if err != nil {
		return nil, errors.New("Gagal membuat sertifikat")
	}
	digitalSignature, err := utils.GenerateCertificateNumber()
	if err != nil {
		return nil, errors.New("Gagal membuat sertifikat")
	}
	certificate := &entity.Certificate{
		DonationId:        bloodDonation.Id,
		UserId:            bloodDonation.UserId,
		CertificateNumber: certificateNumber,
		DigitalSignature:  digitalSignature,
	}
	if err := s.certificateRepository.Create(ctx, certificate); err != nil {
		return nil, errors.New("Gagal membuat sertifikat")
	}
	return certificate, nil
}

func (s *certificateService) GetAll(ctx context.Context, req dto.GetAllCertificateRequest) ([]entity.Certificate, int64, error) {
	certificates, total, err := s.certificateRepository.GetAll(ctx, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan sertifikat")
	}
	return certificates, total, nil
}

func (s *certificateService) GetById(ctx context.Context, id int64) (*entity.Certificate, error) {
	certificate, err := s.certificateRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan sertifikat")
	}
	return certificate, nil
}

func (s *certificateService) GetByUser(ctx context.Context, userId int64, req dto.GetAllCertificateRequest) ([]entity.Certificate, int64, error) {
	certificates, total, err := s.certificateRepository.GetByUser(ctx, userId, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan sertifikat")
	}
	return certificates, total, nil
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