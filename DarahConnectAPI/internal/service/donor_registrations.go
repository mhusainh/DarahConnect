package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type DonorRegistrationService interface {
	Create(ctx context.Context, req *dto.DonorRegistrationCreateRequest) error
	GetAll(ctx context.Context) ([]entity.DonorRegistration, error)
	GetById(ctx context.Context, id int64) (*entity.DonorRegistration, error)
	Update(ctx context.Context, req *dto.DonorRegistrationUpdateRequest) error
	Delete(ctx context.Context, id int64) error
}

type donorRegistrationService struct {
	donorRegistrationRepository repository.DonorRegistrationRepository
}

func NewDonorRegistrationService(donorRegistrationRepository repository.DonorRegistrationRepository) DonorRegistrationService {
	return &donorRegistrationService{
		donorRegistrationRepository,
	}
}

func (s *donorRegistrationService) Create(ctx context.Context, req *dto.DonorRegistrationCreateRequest) error {
	donorRegistration := new(entity.DonorRegistration)
	donorRegistration.UserId = req.UserId
	donorRegistration.ScheduleId = req.ScheduleId
	donorRegistration.Status = "registered"
	donorRegistration.Notes = req.Notes
	
	if err := s.donorRegistrationRepository.Create(ctx, donorRegistration); err != nil {
		return errors.New("Gagal membuat pendaftaran donor")
	}
	return nil
}

func (s *donorRegistrationService) GetAll(ctx context.Context) ([]entity.DonorRegistration, error) {
	donorRegistrations, err := s.donorRegistrationRepository.GetAll(ctx)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan daftar pendaftaran donor")
	}

	return donorRegistrations, nil
}

func (s *donorRegistrationService) GetById(ctx context.Context, id int64) (*entity.DonorRegistration, error) {
	donorRegistration, err := s.donorRegistrationRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("pendaftaran donor tidak ditemukan")
	}

	return donorRegistration, nil
}

func (s *donorRegistrationService) Update(ctx context.Context, req *dto.DonorRegistrationUpdateRequest) error {
	donorRegistration, err := s.donorRegistrationRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("pendaftaran donor tidak ditemukan")
	}

	if req.Status != "" {
		donorRegistration.Status = req.Status
	}
	if req.Notes != "" {
		donorRegistration.Notes = req.Notes
	}

	if err := s.donorRegistrationRepository.Update(ctx, donorRegistration); err != nil {
		return errors.New("Gagal mengupdate pendaftaran donor")
	}
	return nil
}

func (s *donorRegistrationService) Delete(ctx context.Context, id int64) error {
	donorRegistration, err := s.donorRegistrationRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("pendaftaran donor tidak ditemukan")
	}

	if err := s.donorRegistrationRepository.Delete(ctx, donorRegistration); err != nil {
		return errors.New("Gagal menghapus pendaftaran donor")
	}
	return nil
}