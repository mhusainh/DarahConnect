package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type DashboardService interface {
	DashboardUser(ctx context.Context, userId int64) (map[string]interface{}, error)
}

type dashboardService struct {
	bloodDonationRepository repository.BloodDonationRepository
}

func NewDashboardService(bloodDonationRepository repository.BloodDonationRepository) DashboardService {
	return &dashboardService{
		bloodDonationRepository,
	}
}

func (s *dashboardService) DashboardUser(ctx context.Context, userId int64) (map[string]interface{}, error) {
	bloodDonations, err := s.bloodDonationRepository.GetByUser(ctx, userId)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan data dashboard")
	}
	var lastDonation interface{}
	if len(bloodDonations) > 0 {
		lastDonation = bloodDonations[0].CreatedAt
	}
	data := map[string]interface{}{
		"total donor":      int(len(bloodDonations)),
		"last donation":    lastDonation,
		"total sertifikat": countCompletedDonations(bloodDonations),
	}
	return data, nil
}

func countCompletedDonations(donations []entity.BloodDonation) int {
	count := 0
	for _, donation := range donations {
		if donation.Status == "completed" {
			count++
		}
	}
	return count
}
