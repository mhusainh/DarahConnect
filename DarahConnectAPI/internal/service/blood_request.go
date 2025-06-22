package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type BloodRequestService interface {
	CreateBloodRequest(ctx context.Context, req dto.BloodRequestCreateRequest) error
	CreateCampaign(ctx context.Context, req dto.CampaignCreateRequest) error
	GetAllBloodRequest(ctx context.Context, req dto.GetAllBloodRequestRequest) ([]entity.BloodRequest, int64, error)
	GetAllCampaign(ctx context.Context, req dto.GetAllBloodRequestRequest) ([]entity.BloodRequest, int64, error)
	GetById(ctx context.Context, id int64) (*entity.BloodRequest, error)
	UpdateCampaign(ctx context.Context, req dto.CampaignUpdateRequest, bloodRequest *entity.BloodRequest) error
	UpdateBloodRequest(ctx context.Context, req dto.BloodRequestUpdateRequest, bloodRequest *entity.BloodRequest) error
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

func (s *bloodRequestService) CreateBloodRequest(ctx context.Context, req dto.BloodRequestCreateRequest) error {
	bloodRequest := new(entity.BloodRequest)
	bloodRequest.UserId = req.UserId
	bloodRequest.HospitalId = req.HospitalId
	bloodRequest.EventName = req.EventName
	bloodRequest.BloodType = req.BloodType
	bloodRequest.Quantity = req.Quantity
	bloodRequest.UrgencyLevel = req.UrgencyLevel
	bloodRequest.Diagnosis = req.Diagnosis
	bloodRequest.Status = "pending"
	bloodRequest.EventDate = req.EventDate
	bloodRequest.EventType = "blood_request"

	if err := s.bloodRequestRepository.Create(ctx, bloodRequest); err != nil {
		return errors.New("Gagal membuat permintaan darah")
	}

	return nil
}

func (s *bloodRequestService) CreateCampaign(ctx context.Context, req dto.CampaignCreateRequest) error {
	bloodRequest := new(entity.BloodRequest)
	bloodRequest.UserId = req.UserId
	bloodRequest.HospitalId = req.HospitalId
	bloodRequest.EventName = req.EventName
	bloodRequest.StartTime = req.StartTime
	bloodRequest.EndTime = req.EndTime
	bloodRequest.SlotsAvailable = req.SlotsAvailable
	bloodRequest.SlotsBooked = req.SlotsBooked
	bloodRequest.EventDate = req.EventDate
	bloodRequest.EventType = "campaign"

	if err := s.bloodRequestRepository.Create(ctx, bloodRequest); err != nil {
		return errors.New("Gagal membuat permintaan darah")
	}

	return nil
}

func (s *bloodRequestService) GetAllBloodRequest(ctx context.Context, req dto.GetAllBloodRequestRequest) ([]entity.BloodRequest, int64, error) {
	bloodRequests, total, err := s.bloodRequestRepository.GetAllBloodRequest(ctx, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan permintaan darah")
	}

	return bloodRequests, total, nil
}

func (s *bloodRequestService) GetAllCampaign(ctx context.Context, req dto.GetAllBloodRequestRequest) ([]entity.BloodRequest, int64, error) {
	bloodRequests, total, err := s.bloodRequestRepository.GetAllCampaign(ctx, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan permintaan darah")
	}

	return bloodRequests, total, nil
}

func (s *bloodRequestService) GetById(ctx context.Context, id int64) (*entity.BloodRequest, error) {
	bloodRequest, err := s.bloodRequestRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Permintaan darah tidak ditemukan")
	}

	return bloodRequest, nil
}

func (s *bloodRequestService) UpdateBloodRequest(ctx context.Context, req dto.BloodRequestUpdateRequest, bloodRequest *entity.BloodRequest) error {
	if req.EventName != "" {
		bloodRequest.EventName = req.EventName
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
	if !req.EventDate.IsZero() {
		bloodRequest.EventDate = req.EventDate
	}

	if err := s.bloodRequestRepository.Update(ctx, bloodRequest); err != nil {
		return errors.New("Gagal mengupdate permintaan darah")
	}

	return nil
}

func (s *bloodRequestService) UpdateCampaign(ctx context.Context, req dto.CampaignUpdateRequest, bloodRequest *entity.BloodRequest) error {
	if req.EventName != "" {
		bloodRequest.EventName = req.EventName
	}
	if !req.StartTime.IsZero() {
		bloodRequest.StartTime = req.StartTime
	}
	if !req.EndTime.IsZero() {
		bloodRequest.EndTime = req.EndTime
	}
	if !req.EventDate.IsZero() {
		bloodRequest.EventDate = req.EventDate
	}
	bloodRequest.SlotsAvailable = req.SlotsAvailable
	bloodRequest.SlotsBooked = req.SlotsBooked

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
