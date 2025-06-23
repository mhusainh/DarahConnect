package googleoauth

import (
	"errors"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"
)

type GoogleAuthService interface {
	Login(ctx echo.Context) error
	Callback(ctx echo.Context) error
}
type Service struct {
	tokenService   token.TokenUseCase
	UserRepository repository.UserRepository
}

func NewGoogleOAuthService(tokenService token.TokenUseCase, userRepository repository.UserRepository) *Service {
	return &Service{
		tokenService,
		userRepository,
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

func (s *Service) Login(ctx echo.Context) error {
	provider := ctx.Param("provider")
	if provider == "" {
		return ctx.String(http.StatusBadRequest, "Provider not specified")
	}

	q := ctx.Request().URL.Query()
	q.Add("provider", ctx.Param("provider"))
	ctx.Request().URL.RawQuery = q.Encode()

	req := ctx.Request()
	res := ctx.Response().Writer
	if gothUser, err := gothic.CompleteUserAuth(res, req); err == nil {
		return ctx.JSON(http.StatusOK, gothUser)
	}
	gothic.BeginAuthHandler(res, req)
	return nil
}

func (s *Service) Callback(ctx echo.Context) error {
	req := ctx.Request()
	res := ctx.Response().Writer
	user, err := gothic.CompleteUserAuth(res, req)
	if err != nil {
		return ctx.String(http.StatusBadRequest, err.Error())
	}

	_, err = s.UserRepository.GetByEmail(ctx.Request().Context(), user.Email)
	if err != nil {
		// User not found, create a new one
		newUser := new(entity.User)
		newUser.Email = user.Email
		newUser.Name = user.Name
		newUser.Role = "User"
		newUser.IsVerified = 1
		if err = s.UserRepository.Create(ctx.Request().Context(), newUser); err != nil {
			return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
		}
	}

	// Buat JWT claims dari data Google OAuth
	claims := &token.GoogleOAuthClaims{
		Id:         user.UserID,
		Email:      user.Email,
		Name:       user.Name,
		PictureURL: user.AvatarURL,
		Provider:   "google",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Generate token
	accessToken, err := s.tokenService.GenerateAccessToken(claims)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	// Return token dan data user
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"token": accessToken,
		"user":  user,
	})
}
