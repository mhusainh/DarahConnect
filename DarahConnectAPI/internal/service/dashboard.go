package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type DashboardService interface {
	DashboardUser(ctx context.Context, userId int64) (map[string]interface{}, error)
	DashboardAdmin(ctx context.Context) (map[string]interface{}, error)
}

type dashboardService struct {
	bloodDonationRepository repository.BloodDonationRepository
	bloodRequestRepository repository.BloodRequestRepository
}

func NewDashboardService(
	bloodDonationRepository repository.BloodDonationRepository,
	bloodRequestRepository repository.BloodRequestRepository,
	) DashboardService {
	return &dashboardService{
		bloodDonationRepository,
		bloodRequestRepository,
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
		"total_donor":      int(len(bloodDonations)),
		"last_donation":    lastDonation,
		"total_sertifikat": countCompletedDonations(bloodDonations),
	}
	return data, nil
}

func (s *dashboardService) DashboardAdmin(ctx context.Context) (map[string]interface{}, error) {
	totalDonation, err := s.bloodRequestRepository.CountTotal(ctx, "blood_request")
	if err != nil {
		return nil, errors.New("Gagal menghitung total Blood Request")
	}
	totalCampaign, err := s.bloodRequestRepository.CountTotal(ctx, "campaign")
	if err != nil {
		return nil, errors.New("Gagal menghitung total Campaign")
	}
	DonorTerverifikasi, err := s.bloodRequestRepository.CountBloodRequest(ctx, "verified", "blood_request")
	if err != nil {
		return nil, errors.New("Gagal menghitung total Donor Terverifikasi")
	}
	RequestPending, err := s.bloodRequestRepository.CountBloodRequest(ctx, "pending", "blood_request")
	if err != nil {
		return nil, errors.New("Gagal menghitung total Request Pending")
	}
	CampaignActive, err := s.bloodRequestRepository.CountCampaignActive(ctx, "pending", "blood_request")
	if err != nil {
		return nil, errors.New("Gagal menghitung total Request Pending")
	}

	data := map[string]interface{}{
		"total_donor":      totalDonation,
		"total_campaign":   totalCampaign,
		"donor_terverifikasi": DonorTerverifikasi,
		"request_pending": RequestPending,
		"campaign_active": CampaignActive,
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
