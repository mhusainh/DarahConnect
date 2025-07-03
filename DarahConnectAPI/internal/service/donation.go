package service

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type DonationsService interface {
	GetAllDonation(ctx context.Context, req dto.GetAllDonation) ([]entity.Donation, int64, error)
	GetById(ctx context.Context, id int64)(*entity.Donation, error)
}

type donationService struct {
	DonationsRepository repository.DonationsRepository
}

func NewDonationService(donationsRepository repository.DonationsRepository) DonationsService {
	return &donationService{
		DonationsRepository: donationsRepository,
	}
}

func (s *donationService) GetAllDonation(ctx context.Context, req dto.GetAllDonation) ([]entity.Donation, int64, error) {
	donations, total, err := s.DonationsRepository.GetAllDonation(ctx, req)
	if err != nil {
		return nil, 0, err
	}
	return donations, total, nil
}

func (s *donationService) GetById(ctx context.Context, id int64)(*entity.Donation, error){
	donation, err := s.DonationsRepository.GetById(ctx,id)
	if err != nil{
		return nil, err
	}
	return donation, nil
}