package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type BloodRequestService interface {
	Create(ctx context.Context, req *dto.BloodRequestCreateRequest) error
	GetAll(ctx context.Context) ([]entity.BloodRequest, error)
	GetById(ctx context.Context, id int64) (*entity.BloodRequest, error)
	Update(ctx context.Context, req *dto.BloodRequestUpdateRequest) error
	Delete(ctx context.Context, id int64) error
}

type bloodRequestService struct {
	bloodRequestRepository repository.BloodRequestRepository
}

func NewBloodRequestService(bloodRequestRepository repository.BloodRequestRepository) BloodRequestService {
	return &bloodRequestService{
		bloodRequestRepository,
	}
}

func (s *bloodRequestService) Create(ctx context.Context, req *dto.BloodRequestCreateRequest) error {
	bloodRequest := new(entity.BloodRequest)
	bloodRequest.UserId = req.UserId
	bloodRequest.HospitalId = req.HospitalId
	bloodRequest.PatientName = req.PatientName
	bloodRequest.BloodType = req.BloodType
	bloodRequest.Quantity = req.Quantity
	bloodRequest.UrgencyLevel = req.UrgencyLevel
	bloodRequest.Diagnosis = req.Diagnosis
	bloodRequest.Status = "pending"
	bloodRequest.ExpiryDate = req.ExpiryDate

	if err := s.bloodRequestRepository.Create(ctx, bloodRequest); err != nil {
		return errors.New("Gagal membuat permintaan darah")
	}

	return nil
}

func (s *bloodRequestService) GetAll(ctx context.Context) ([]entity.BloodRequest, error) {
	bloodRequests, err := s.bloodRequestRepository.GetAll(ctx)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan permintaan darah")
	}

	return bloodRequests, nil
}

func (s *bloodRequestService) GetById(ctx context.Context, id int64) (*entity.BloodRequest, error) {
	bloodRequest, err := s.bloodRequestRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Permintaan darah tidak ditemukan")
	}

	return bloodRequest, nil
}

func (s *bloodRequestService) Update(ctx context.Context, req *dto.BloodRequestUpdateRequest) error {
	bloodRequest, err := s.bloodRequestRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("Permintaan darah tidak ditemukan")
	}

	if req.PatientName != "" {
		bloodRequest.PatientName = req.PatientName
	}
	if req.BloodType != "" {
		bloodRequest.BloodType = req.BloodType
	}
	if req.Quantity != 0 {
		bloodRequest.Quantity = req.Quantity
	}
	if req.UrgencyLevel != "" {
		bloodRequest.UrgencyLevel = req.UrgencyLevel
	}
	if req.Diagnosis != "" {
		bloodRequest.Diagnosis = req.Diagnosis
	}
	if req.Status != "" {
		bloodRequest.Status = req.Status
	}
	if !req.ExpiryDate.IsZero() {
		bloodRequest.ExpiryDate = req.ExpiryDate
	}

	if err := s.bloodRequestRepository.Update(ctx, bloodRequest); err != nil {
		return errors.New("Gagal mengupdate permintaan darah")
	}

	return nil
}

func (s *bloodRequestService) Delete(ctx context.Context, id int64) error {
	bloodRequest, err := s.bloodRequestRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Permintaan darah tidak ditemukan")
	}

	if err := s.bloodRequestRepository.Delete(ctx, bloodRequest); err != nil {
		return errors.New("Gagal menghapus permintaan darah")
	}

	return nil
}
