package googleoauth

import (
	"errors"

	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/google"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
)

type Service struct{
	cfg *configs.GoogleOauth
}

func InitGoogle (cfg *configs.GoogleOauth) error {
	if cfg.ClientId == "" || cfg.ClientSecret == "" || cfg.CallbackURL == "" {
		return errors.New("Environment variables (CLIENT_ID, CLIENT_SECRET, CLIENT_CALLBACK_URL) are required")
	}

	goth.UseProviders(
		google.New(cfg.ClientId, cfg.ClientSecret, cfg.CallbackURL),	
	)
	return nil
}



