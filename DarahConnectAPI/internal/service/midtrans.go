package service

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type midtrans interface {
	WebHookTransaction(ctx echo.Context) error
}

type midtransService struct {
	donationsRepository repository.DonationsRepository
}

// NewMidtransService creates a new instance of midtransService
func NewMidtransService(donationsRepository repository.DonationsRepository) midtrans {
	return &midtransService{
		donationsRepository: donationsRepository,
	}
}

func (s *midtransService) WebHookTransaction(ctx echo.Context) error {
	var input dto.DonationsCreate

	if err := ctx.Bind(&input); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"status":  "error",
			"message": "Invalid request payload",
		})
	}

	// Parse transaction time
	transactionTime, err := time.Parse("2006-01-02 15:04:05", input.Transaction_time)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"status":  "error",
			"message": "Invalid transaction time format",
		})
	}
	if input.Transaction_status != "settlement" && input.Transaction_status != "capture" {
		return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"status":  "error",
			"message": "Invalid transaction status",
		})
	}
	// Create donation record
	donation := &entity.Donation{
		UserID:    input.UserID,
		Amount:    input.Amount,
		Status:    "success",
		CreatedAt: transactionTime,
		UpdatedAt: time.Now(),
	}

	// Save donation to database
	if err := s.donationsRepository.Create(ctx.Request().Context(), donation); err != nil {
		fmt.Printf("Failed to save donation: %v\n", err)
		return ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
			"status":  "error",
			"message": "Failed to process donation",
		})
	}

	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"status":  "success",
		"message": "Donation processed successfully",
		"data": map[string]interface{}{
			"id":     donation.ID,
			"user_id": donation.UserID,
			"amount":  donation.Amount,
			"status":  donation.Status,
		},
	})
}