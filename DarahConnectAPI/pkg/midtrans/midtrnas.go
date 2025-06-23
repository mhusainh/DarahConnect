package midtrans

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type Service struct {
	cfg *configs.MidtransConfig
}

type PaymentRequest struct {
	OrderID  string
	Amount   int64
	Fullname string
	Email    string
}

func initMidtrans(cfg *configs.MidtransConfig) snap.Client {
	snapClient := snap.Client{}

	snapClient.New(cfg.ServerKey, midtrans.Sandbox)
	

	return snapClient
}

func NewMidtransService(cfg *configs.MidtransConfig) *Service {
	return &Service{
		cfg: cfg,
	}
}

func (s *Service) CreateTransaction(ctx context.Context, req PaymentRequest) (string, error) {
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

	snapClient := initMidtrans(s.cfg)
	resp, err := snapClient.CreateTransaction(request)
	if err != nil {
		return "", err
	}
	return resp.RedirectURL, nil
}
