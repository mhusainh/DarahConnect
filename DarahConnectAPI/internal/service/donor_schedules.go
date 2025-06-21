package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type DonorScheduleService interface {
	GetAll(ctx context.Context, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error)
	GetById(ctx context.Context, id int64) (*entity.DonorSchedule, error)
	GetByHospitalId(ctx context.Context, hospitalId int64, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error)
	Create(ctx context.Context, req dto.DonorScheduleCreateRequest) error
	Update(ctx context.Context, req dto.DonorScheduleUpdateRequest, donorSchedule *entity.DonorSchedule) error
	Delete(ctx context.Context, id int64) error
}

type donorScheduleService struct {
	donorScheduleRepository repository.DonorScheduleRepository
}

func NewDonorScheduleService(donorScheduleRepository repository.DonorScheduleRepository) DonorScheduleService {
	return &donorScheduleService{
		donorScheduleRepository,
	}
}

func (s *donorScheduleService) GetAll(ctx context.Context, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error) {
	donorSchedules, total, err := s.donorScheduleRepository.GetAll(ctx, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan jadwal donor")
	}
	return donorSchedules, total, nil
}

func (s *donorScheduleService) GetById(ctx context.Context, id int64) (*entity.DonorSchedule, error) {
	donorSchedule, err := s.donorScheduleRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Jadwal donor tidak ditemukan")
	}
	return donorSchedule, nil
}

func (s *donorScheduleService) GetByHospitalId(ctx context.Context, hospitalId int64, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error) {
	donorSchedules, total, err := s.donorScheduleRepository.GetByHospitalId(ctx, hospitalId, req)
	if err != nil {
		return nil, 0, errors.New("Gagal mendapatkan jadwal donor")
	}
	return donorSchedules, total, nil
}

func (s *donorScheduleService) Create(ctx context.Context, req dto.DonorScheduleCreateRequest) error {
	donorSchedule := new(entity.DonorSchedule)
	donorSchedule.HospitalId = req.HospitalId
	donorSchedule.EventName = req.EventName
	donorSchedule.EventDate = req.EventDate
	donorSchedule.StartTime = req.StartTime
	donorSchedule.EndTime = req.EndTime
	donorSchedule.SlotsAvailable = req.SlotsAvailable
	donorSchedule.SlotsBooked = req.SlotsBooked
	donorSchedule.Description = req.Description
	donorSchedule.Status = "upcoming"

	err := s.donorScheduleRepository.Create(ctx, donorSchedule)
	if err != nil {
		return errors.New("Gagal membuat jadwal donor")
	}
	return nil
}

func (s *donorScheduleService) Update(ctx context.Context, req dto.DonorScheduleUpdateRequest, donorSchedule *entity.DonorSchedule) error {
	if req.EventName != "" {
		donorSchedule.EventName = req.EventName
	}
	if !req.EventDate.IsZero() {
		donorSchedule.EventDate = req.EventDate
	}
	if !req.StartTime.IsZero() {
		donorSchedule.StartTime = req.StartTime
	}
	if !req.EndTime.IsZero() {
		donorSchedule.EndTime = req.EndTime
	}
	if req.SlotsAvailable != 0 {
		donorSchedule.SlotsAvailable = req.SlotsAvailable
	}
	if req.SlotsBooked != 0 {
		donorSchedule.SlotsBooked = req.SlotsBooked
	}
	if req.Description != "" {
		donorSchedule.Description = req.Description
	}
	if req.Status != "" {
		donorSchedule.Status = req.Status
	}

	if err := s.donorScheduleRepository.Update(ctx, donorSchedule); err != nil {
		return errors.New("Gagal mengupdate jadwal donor")
	}
	return nil
}

func (s *donorScheduleService) Delete(ctx context.Context, id int64) error {
	donorSchedule, err := s.donorScheduleRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Jadwal donor tidak ditemukan")
	}

	if err := s.donorScheduleRepository.Delete(ctx, donorSchedule); err != nil {
		return errors.New("Gagal menghapus jadwal donor")
	}
	return nil
}
