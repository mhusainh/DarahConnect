package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type BloodDonationService interface {
	Create(ctx context.Context, req dto.BloodDonationCreateRequest) error
	GetAll(ctx context.Context, req dto.GetAllBloodDonationRequest) ([]entity.BloodDonation, int64, error)
	GetByUserId(ctx context.Context, userId int64, req dto.GetAllBloodDonationRequest) ([]entity.BloodDonation, int64, error)
	GetById(ctx context.Context, id int64) (*entity.BloodDonation, error)
	Update(ctx context.Context, req dto.BloodDonationUpdateRequest) error
	Delete(ctx context.Context, id int64) error
}

type bloodDonationService struct {
	bloodDonationRepository repository.BloodDonationRepository
}

func NewBloodDonationService(bloodDonationRepository repository.BloodDonationRepository) BloodDonationService {
	return &bloodDonationService{
		bloodDonationRepository,
	}
}

func (s *bloodDonationService) Create(ctx context.Context, req dto.BloodDonationCreateRequest) error {
	bloodDonation := new(entity.BloodDonation)
	bloodDonation.UserId = req.UserId
	bloodDonation.HospitalId = req.HospitalId
	bloodDonation.RegistrationId = req.RegistrationId
	bloodDonation.DonationDate = req.DonationDate
	bloodDonation.BloodType = req.BloodType
	bloodDonation.Status = "pending"

	if err := s.bloodDonationRepository.Create(ctx, bloodDonation); err != nil {
		return errors.New("Gagal membuat donasi darah")
	}

	return nil
}

func (s *bloodDonationService) GetAll(ctx context.Context, req dto.GetAllBloodDonationRequest) ([]entity.BloodDonation, int64, error) {
	bloodDonations, total, err := s.bloodDonationRepository.GetAll(ctx, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mengambil donasi darah")
	}

	return bloodDonations, total, nil
}

func (s *bloodDonationService) GetByUserId(ctx context.Context, userId int64, req dto.GetAllBloodDonationRequest) ([]entity.BloodDonation, int64, error) {
	bloodDonations, total, err := s.bloodDonationRepository.GetByUserId(ctx, userId, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mengambil donasi darah")
	}

	return bloodDonations, total, nil
}

func (s *bloodDonationService) GetById(ctx context.Context, id int64) (*entity.BloodDonation, error) {
	bloodDonation, err := s.bloodDonationRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Gagal mengambil donasi darah")
	}

	return bloodDonation, nil
}

func (s *bloodDonationService) Update(ctx context.Context, req dto.BloodDonationUpdateRequest) error {
	bloodDonation, err := s.bloodDonationRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("Gagal mengambil donasi darah")
	}

	if !req.DonationDate.IsZero() {
		bloodDonation.DonationDate = req.DonationDate
	}
	if req.BloodType != "" {
		bloodDonation.BloodType = req.BloodType
	}
	if req.Status != "" {
		bloodDonation.Status = req.Status
	}

	if err := s.bloodDonationRepository.Update(ctx, bloodDonation); err != nil {
		return errors.New("Gagal mengupdate donasi darah")
	}

	return nil
}

func (s *bloodDonationService) Delete(ctx context.Context, id int64) error {
	bloodDonation, err := s.bloodDonationRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Gagal mengambil donasi darah")
	}

	if err := s.bloodDonationRepository.Delete(ctx, bloodDonation); err != nil {
		return errors.New("Gagal menghapus donasi darah")
	}

	return nil
}
