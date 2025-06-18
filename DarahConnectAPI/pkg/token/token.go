package token

import (
	"github.com/golang-jwt/jwt/v5"
)

type TokenUseCase interface {
	GenerateAccessToken(claims jwt.Claims) (string, error)
}

type tokenUseCase struct {
	secretKey string
}

func NewTokenUseCase(secretKey string) TokenUseCase {
	return &tokenUseCase{secretKey}
}

type JwtCustomClaims struct {
	Id    int64    `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Name  string `json:"name"`
	jwt.RegisteredClaims
}

type ResetPasswordClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func (t *tokenUseCase) GenerateAccessToken(claims jwt.Claims) (string, error) {
	plainToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	encodedToken, err := plainToken.SignedString([]byte(t.secretKey))
	if err != nil {
		return "", err
	}

	return encodedToken, nil
}

