package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type HealthPassportService interface {
	Create(ctx context.Context, req dto.HealthPassportCreateRequest) error
	GetById(ctx context.Context, id int64) (*entity.HealthPassport, error)
	GetAll(ctx context.Context) ([]entity.HealthPassport, error)
	Update(ctx context.Context, req dto.HealthPassportUpdateRequest) error
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
	if err := s.healthPassportRepository.Create(ctx, healthPassport); err != nil {
		return errors.New("Riwayat kesehatan gagal dibuat")
	}
	return nil
}

func (s *healthPassportService) GetAll(ctx context.Context) ([]entity.HealthPassport, error) {

	healthPassports, err := s.healthPassportRepository.GetAll(ctx)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan daftar riwayat kesehatan")
	}
	return healthPassports, nil
}

func (s *healthPassportService) GetById(ctx context.Context, id int64) (*entity.HealthPassport, error) {
	healthPassport, err := s.healthPassportRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Riwayat kesehatan tidak ditemukan")
	}
	return healthPassport, nil
}

func (s *healthPassportService) Update(ctx context.Context, req dto.HealthPassportUpdateRequest) error {
	_, err := s.healthPassportRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("Riwayat kesehatan tidak ditemukan")
	}

	if err := s.healthPassportRepository.Update(ctx, &entity.HealthPassport{
		Id:               req.Id,
		UserId:           req.UserId,
		PassportNumber:   req.PassportNumber,
	}); err != nil {
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
