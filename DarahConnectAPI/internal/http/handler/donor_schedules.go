package handler

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
)

type DonorScheduleHandler struct {
	donorScheduleService service.DonorScheduleService
}

func NewDonorScheduleHandler(donorScheduleService service.DonorScheduleService) DonorScheduleHandler {
	return DonorScheduleHandler{
		donorScheduleService,
	}
}

func (h *DonorScheduleHandler) GetDonorSchedules(ctx echo.Context) error {
	var req dto.GetAllDonorScheduleRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

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
	

	donorSchedules, total, err := h.donorScheduleService.GetAll(ctx.Request().Context(), claimsData.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data jadwal donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua jadwal donor", donorSchedules, req.Page, req.Limit, total))
}

func (h *DonorScheduleHandler) GetDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

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

	donorSchedule, err := h.donorScheduleService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data jadwal donor: "+err.Error()))
	}

	if claimsData.Id != donorSchedule.UserId {
		return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "Tidak memiliki izin"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan jadwal donor", donorSchedule))
}

func (h *DonorScheduleHandler) CreateDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

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

	req.UserId = claimsData.Id

	if err := h.donorScheduleService.Create(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat jadwal donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil membuat jadwal donor", nil))
}

func (h *DonorScheduleHandler) UpdateDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

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

	donorSchedule, err := h.donorScheduleService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data jadwal donor: "+err.Error()))
	}

	if claimsData.Id != donorSchedule.UserId {
		return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "Tidak memiliki izin"))
	}

	if err := h.donorScheduleService.Update(ctx.Request().Context(), req, donorSchedule); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal memperbarui jadwal donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil memperbarui jadwal donor", nil))
}

func (h *DonorScheduleHandler) DeleteDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

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

	donorSchedule, err := h.donorScheduleService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data jadwal donor: "+err.Error()))
	}

	if claimsData.Id != donorSchedule.UserId {
		return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "Tidak memiliki izin"))
	}
	
	if err := h.donorScheduleService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal menghapus jadwal donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menghapus jadwal donor", nil))
}
