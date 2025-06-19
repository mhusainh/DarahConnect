package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type HospitalService interface {
	Create(ctx context.Context, req dto.HospitalCreateRequest) error
	GetById(ctx context.Context, id int64) (*entity.Hospital, error)
	GetAll(ctx context.Context) ([]entity.Hospital, error)
	Update(ctx context.Context, req dto.HospitalUpdateRequest) error
	Delete(ctx context.Context, id int64) error
}

type hospitalService struct {
	hospitalRepository repository.HospitalRepository
}

func NewHospitalService(hospitalRepository repository.HospitalRepository) HospitalService {
	return &hospitalService{hospitalRepository}
}

func (s *hospitalService) GetAll(ctx context.Context) ([]entity.Hospital, error) {
	hospitals, err := s.hospitalRepository.GetAll(ctx)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan daftar rumah sakit")
	}
	return hospitals, nil
}

func (s *hospitalService) GetById(ctx context.Context, id int64) (*entity.Hospital, error) {
	hospital, err := s.hospitalRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Rumah sakit tidak ditemukan")
	}
	return hospital, nil
}

func (s *hospitalService) Create(ctx context.Context, req dto.HospitalCreateRequest) error {
	hospital := new(entity.Hospital)
	hospital.Name = req.Name
	hospital.Address = req.Address
	hospital.City = req.City
	hospital.Province = req.Province
	hospital.Latitude = req.Latitude
	hospital.Longitude = req.Longitude

	if err := s.hospitalRepository.Create(ctx, hospital); err != nil {
		return errors.New("gagal membuat rumah sakit" + err.Error())
	}
	return nil
}

func (s *hospitalService) Update(ctx context.Context, req dto.HospitalUpdateRequest) error {
	_, err := s.hospitalRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("Rumah sakit tidak ditemukan")
	}

	if err := s.hospitalRepository.Update(ctx, &entity.Hospital{
		Id:        req.Id,
		Name:      req.Name,
		Address:   req.Address,
		City:      req.City,
		Province:  req.Province,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
	}); err != nil {
		return errors.New("Rumah sakit gagal diperbarui")
	}
	return nil
}

func (s *hospitalService) Delete(ctx context.Context, id int64) error {
	hospital, err := s.hospitalRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Rumah sakit tidak ditemukan")
	}

	if err := s.hospitalRepository.Delete(ctx, hospital); err != nil {
		return errors.New("Rumah sakit gagal dihapus")
	}
	return nil
}