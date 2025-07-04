package midtrans

import (
	"context"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type MidtransService interface {
	CreateTransaction(ctx context.Context, req dto.PaymentRequest) (string, error)
	WebHookTransaction(ctx context.Context, input *dto.DonationsCreate) error
}


type midtransService struct {
	cfg *configs.MidtransConfig
	snapClient snap.Client
	DonationsRepository repository.DonationsRepository
	
}


func InitMidtrans(cfg *configs.MidtransConfig) (MidtransService, error) {
	snapClient := snap.Client{}

	snapClient.New(cfg.ServerKey, midtrans.Sandbox)
	

	return &midtransService{
		cfg:        cfg,
		snapClient: snapClient,
	}, nil
}

func NewMidtransService(cfg *configs.MidtransConfig) *midtransService {
    snapClient := snap.Client{}
    snapClient.New(cfg.ServerKey, midtrans.Sandbox)
    
    return &midtransService{
        cfg: cfg,
        snapClient: snapClient,
    }
}

func (s *midtransService) CreateTransaction(ctx context.Context, req dto.PaymentRequest) (string, error) {
	donation := new(entity.Donation)
	request := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  req.OrderID,
			GrossAmt: req.Amount,
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: req.Fullname,
			Email: req.Email,
		},
	}
	resp, err := s.snapClient.CreateTransaction(request)
	if err != nil {
		return "", err
	}

	OrderID, errParse := strconv.ParseInt(strings.Split(req.OrderID, "-")[2], 10, 64)
	if errParse != nil {
		return "",errors.New("format order id salah")
	}

	donation.UserId = req.UserId
	donation.Amount = req.Amount
	donation.OrderId = OrderID
	donation.CreatedAt = time.Now()
	donation.UpdatedAt = time.Now()
	donation.Status = "pending"

	if err := s.DonationsRepository.Create(ctx, donation); err != nil {
		return "",errors.New("gagal memproses donasi")
	}
	return resp.RedirectURL, nil
}

func (s *midtransService) WebHookTransaction(ctx context.Context, input *dto.DonationsCreate) error {
	donation := new(entity.Donation)

	OrderID, err := strconv.ParseInt(strings.Split(input.OrderID, "-")[2], 10, 64)
	if err != nil {
		return errors.New("format order id salah")
	}

	donation.OrderId = OrderID
	donation.Status = input.Transaction_status
	donation.UpdatedAt = time.Now()

	// Validate transaction status
	if input.Transaction_status != "settlement" && input.Transaction_status != "capture" {
		return errors.New("status transaksi tidak valid")
	} 
	donation.Status = "success"
	log.Printf("data : %v", donation )
	// Save donation to database
	if err := s.DonationsRepository.Update(ctx,OrderID, donation); err != nil {
		return errors.New("gagal memproses donasi")
	}

	return nil
}