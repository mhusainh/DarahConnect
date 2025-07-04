package handler

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"
)

type Dashboard struct {
	dashboardService service.DashboardService
}

func NewDashboardHandler(
	dashboardService service.DashboardService) Dashboard {
	return Dashboard{
		dashboardService,
	}
}

func (h *Dashboard) DashboardUser(ctx echo.Context) error {

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	data, err := h.dashboardService.DashboardUser(ctx.Request().Context(), claimsData.Id)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal mendapatkan data dashboard pengguna: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan dashboard pengguna", data))

}

func (h *Dashboard) DashboardAdmin(ctx echo.Context) error {
	data, err := h.dashboardService.DashboardAdmin(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal mendapatkan data dashboard admin: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan dashboard admin", data))
}

func (h *Dashboard) GetLandingPage(ctx echo.Context) error {
	data, err := h.dashboardService.LandingPage(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal mendapatkan data landing page: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan landing page", data))
}