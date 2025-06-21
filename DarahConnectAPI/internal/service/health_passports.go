package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/timezone"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/utils"
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
	healthPassport.ExpiryDate = time.Now().In(timezone.JakartaLocation).Add(24 * time.Hour)
	healthPassport.Status = "active"

	// Generate nomor paspor yang unik
	var err error
	for i := 0; i < 5; i++ { // Maksimal 5 kali percobaan
		healthPassport.PassportNumber = utils.GenerateRandomPassportNumber()
		// Coba membuat health passport
		err = s.healthPassportRepository.Create(ctx, healthPassport)
		if err == nil {
			break // Berhasil membuat health passport dengan nomor unik
		}
		// Jika error bukan karena duplikasi, return error
		if !strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			return errors.New("Riwayat kesehatan gagal dibuat")
		}
		// Jika error karena duplikasi, lanjut ke iterasi berikutnya untuk generate nomor baru
	}

	// Jika setelah 5 kali percobaan masih gagal
	if err != nil {
		return errors.New("Gagal membuat nomor paspor unik setelah beberapa percobaan")
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
