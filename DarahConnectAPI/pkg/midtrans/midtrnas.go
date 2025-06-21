	package midtrans

	import (

		"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
		"github.com/midtrans/midtrans-go"
		"github.com/midtrans/midtrans-go/snap"
	)
	
	type Service struct {
		cfg *configs.Config
	}

	func initMidtrans(cfg *configs.Config) snap.Client {
		snapClient := snap.Client{}
	
		if cfg.ENV == "dev" {
			snapClient.New(cfg.MidtransConfig.ServerKey, midtrans.Sandbox)
		} else {
			snapClient.New(cfg.MidtransConfig.ServerKey, midtrans.Production)
		}
	
		return snapClient
	}
