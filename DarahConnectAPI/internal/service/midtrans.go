package service

import (
	"context"
	"errors"
	"time"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type MidtransService interface {
	WebHookTransaction(ctx context.Context, input *dto.DonationsCreate) error
}

type midtransService struct {
	donationsRepository repository.DonationsRepository
}

// NewMidtransService creates a new instance of midtransService
func NewMidtransService(donationsRepository repository.DonationsRepository) MidtransService {
	return &midtransService{
		donationsRepository: donationsRepository,
	}
}

func (s *midtransService) WebHookTransaction(ctx context.Context, input *dto.DonationsCreate) error {
	donation := new(entity.Donation)

	donation.UserId = input.UserID
	donation.Amount = input.Amount
	donation.Status = input.Transaction_status
	donation.CreatedAt = time.Now()
	donation.UpdatedAt = time.Now()
	
	// Parse transaction time
	transactionTime, err := time.Parse("2006-01-02 15:04:05", input.Transaction_time)
	if err != nil {
		return errors.New("Invalid transaction time format")
	}
	donation.TransactionTime = transactionTime

	// Validate transaction status
	if input.Transaction_status != "settlement" && input.Transaction_status != "capture" {
		return errors.New("Invalid transaction status")
	} 
	donation.Status = "success"
	
	// Save donation to database
	if err := s.donationsRepository.Create(ctx, donation); err != nil {
		return errors.New("Failed to process donation")
	}

	return nil
}