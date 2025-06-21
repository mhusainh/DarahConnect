package service

import (
	"context"
	"errors"
	"time"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/timezone"
)

type HealthPassportService interface {
	Create(ctx context.Context, req dto.HealthPassportCreateRequest) error
	GetById(ctx context.Context, id int64) (*entity.HealthPassport, error)
	GetAll(ctx context.Context, req dto.GetAllHealthPassportRequest) ([]entity.HealthPassport, int64, error)
	GetByUserId(ctx context.Context, userId int64) (*entity.HealthPassport, error)
	Update(ctx context.Context, req dto.HealthPassportUpdateRequest, healthPassport *entity.HealthPassport) error
	Delete(ctx context.Context, id int64) error
}

type healthPassportService struct {
	healthPassportRepository repository.HealthPassportRepository
}

func NewHealthPassportService(healthPassportRepository repository.HealthPassportRepository) HealthPassportService {
	return &healthPassportService{healthPassportRepository}
}

func (s *healthPassportService) Create(ctx context.Context, req dto.HealthPassportCreateRequest) error {

	healthPassport := new(entity.HealthPassport)
	healthPassport.UserId = req.UserId
	healthPassport.PassportNumber = req.PassportNumber
	healthPassport.ExpiryDate = time.Now().In(timezone.JakartaLocation).Add(24 * time.Hour)
	healthPassport.Status = "active"

	if err := s.healthPassportRepository.Create(ctx, healthPassport); err != nil {
		return errors.New("Riwayat kesehatan gagal dibuat")
	}
	return nil
}

func (s *healthPassportService) GetAll(ctx context.Context, req dto.GetAllHealthPassportRequest) ([]entity.HealthPassport, int64, error) {

	healthPassports, total, err := s.healthPassportRepository.GetAll(ctx, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan daftar riwayat kesehatan")
	}
	return healthPassports, total, nil
}

func (s *healthPassportService) GetById(ctx context.Context, id int64) (*entity.HealthPassport, error) {
	healthPassport, err := s.healthPassportRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Riwayat kesehatan tidak ditemukan")
	}
	return healthPassport, nil
}

func (s *healthPassportService) GetByUserId(ctx context.Context, userId int64) (*entity.HealthPassport, error) {
	healthPassports, err := s.healthPassportRepository.GetByUserId(ctx, userId)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan daftar riwayat kesehatan")
	}
	return healthPassports, nil
}

func (s *healthPassportService) Update(ctx context.Context, req dto.HealthPassportUpdateRequest, healthPassport *entity.HealthPassport) error {
	if req.PassportNumber != "" {
		healthPassport.PassportNumber = req.PassportNumber
	}
	healthPassport.ExpiryDate = time.Now().In(timezone.JakartaLocation).Add(24 * time.Hour)
	healthPassport.Status = "active"

	if err := s.healthPassportRepository.Update(ctx, healthPassport); err != nil {
		return errors.New("Riwayat kesehatan gagal diperbarui")
	}
	return nil
}

func (s *healthPassportService) Delete(ctx context.Context, id int64) error {
	healthPassport, err := s.healthPassportRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Riwayat kesehatan tidak ditemukan")
	}

	if err := s.healthPassportRepository.Delete(ctx, healthPassport); err != nil {
		return errors.New("Riwayat kesehatan gagal dihapus")
	}
	return nil
}
