package googleoauth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"
)

type GoogleAuthService interface {
	Login(ctx echo.Context) error
	Callback(ctx echo.Context) error
}
type Service struct {
	tokenService token.TokenUseCase
	userService  service.UserService
}

func NewGoogleOAuthService(tokenService token.TokenUseCase, userService service.UserService) *Service {
	return &Service{
		tokenService,
		userService,
	}
}

func InitGoogle(cfg *configs.GoogleOauth) error {
	if cfg.ClientId == "" || cfg.ClientSecret == "" || cfg.CallbackURL == "" {
		return errors.New("Environment variables (CLIENT_ID, CLIENT_SECRET, CLIENT_CALLBACK_URL) are required")
	}

	goth.UseProviders(
		google.New(cfg.ClientId, cfg.ClientSecret, cfg.CallbackURL),
	)
	return nil
}

func (s *Service) Login(ctx echo.Context) (goth.User, error) {
	provider := ctx.Param("provider")
	if provider == "" {
		return goth.User{}, errors.New("Provider not specified")
	}

	q := ctx.Request().URL.Query()
	q.Add("provider", ctx.Param("provider"))
	ctx.Request().URL.RawQuery = q.Encode()

	req := ctx.Request()
	res := ctx.Response().Writer
	if gothUser, err := gothic.CompleteUserAuth(res, req); err == nil {
		return gothUser, nil
	}
	gothic.BeginAuthHandler(res, req)
	return goth.User{}, errors.New("Failed to complete user authentication")
}

func (s *Service) Callback(ctx echo.Context) (map[string]interface{}, error) {
	req := ctx.Request()
	res := ctx.Response().Writer
	user, err := gothic.CompleteUserAuth(res, req)
	if err != nil {
		return nil, err
	}

	// Check if user already exists in the database
	IsNew, err := s.userService.CheckGoogleOAuth(ctx.Request().Context(), user.Email, &user)
	if err != nil {
		return nil, errors.New("ada kesalahan saat check google oauth")
	}

	// Buat JWT claims dari data Google OAuth
	claims := &token.GoogleOAuthClaims{
		Id:         user.UserID,
		Email:      user.Email,
		Name:       user.Name,
		PictureURL: user.AvatarURL,
		Provider:   "google",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Generate token
	accessToken, err := s.tokenService.GenerateAccessToken(claims)
	if err != nil {
		return nil, errors.New("ada kesalahan saat generate token")
	}

	// Return token dan data user
	return map[string]interface{}{
		"token": accessToken,
		"user":  user,
		"IsNew": IsNew,
	}, nil
}
