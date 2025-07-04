package handler

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/timezone"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
)

type DonorRegistrationHandler struct {
	donorRegistrationService service.DonorRegistrationService
	healthPassportService    service.HealthPassportService
	notificationService service.NotificationService
	bloodRequestService service.BloodRequestService
}

func NewDonorRegistrationHandler(
	donorRegistrationService service.DonorRegistrationService,
	healthPassportService service.HealthPassportService,
	notificationService service.NotificationService,
	bloodRequestService service.BloodRequestService,
) DonorRegistrationHandler {
	return DonorRegistrationHandler{
		donorRegistrationService,
		healthPassportService,
		notificationService,
		bloodRequestService,

	}
}

func (h *DonorRegistrationHandler) GetDonorRegistrations(ctx echo.Context) error {
	var req dto.GetAllDonorRegistrationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}
	
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	if claimsData.Role != "user" {
		req.UserId = claimsData.Id
	}

	donorRegistrations, total, err := h.donorRegistrationService.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pendaftaran donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua pendaftaran donor", donorRegistrations, req.Page, req.Limit, total))
}

func (h *DonorRegistrationHandler) GetDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}
	
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	donorRegistration, err := h.donorRegistrationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pendaftaran donor: "+err.Error()))
	}

	if donorRegistration == nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "pendaftaran donor tidak ditemukan"))
	}

	if claimsData.Role == "User" && donorRegistration.UserId != claimsData.Id {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Anda tidak memiliki akses"))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan pendaftaran donor", donorRegistration))
}

func (h *DonorRegistrationHandler) GetRiwayatDonor(ctx echo.Context) error {
	var req dto.GetAllDonorRegistrationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	donorRegistrations, total, err := h.donorRegistrationService.GetAllByUserId(ctx.Request().Context(), claimsData.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan riwayat donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua riwayat donor", donorRegistrations, req.Page, req.Limit, total))
}

func (h *DonorRegistrationHandler) CreateDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.RequestId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data permintaan darah: "+err.Error()))
	}
	if bloodRequest.Status != "verified" {
		if bloodRequest.Status == "pending"{
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Permintaan darah masih" + bloodRequest.Status))
		}
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Permintaan darah sudah " + bloodRequest.Status))
	}
	
	donorRegistration, _ := h.donorRegistrationService.GetByRequestId(ctx.Request().Context(), req.RequestId, claimsData.Id)

	if donorRegistration != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Anda sudah mendaftar di event ini"))
	}

	req.UserId = claimsData.Id
	healthPassport, err := h.healthPassportService.GetByUserId(ctx.Request().Context(), req.UserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Anda belum memiliki health passport, silahkan untuk mengisi health passport terlebih dahulu"))
	}

	if time.Now().In(timezone.JakartaLocation).After(healthPassport.ExpiryDate) {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "health passport sudah expired"))
	}

	if err := h.donorRegistrationService.Create(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat pendaftaran donor: "+err.Error()))
	}

	_ = h.bloodRequestService.RegistrationDonate(ctx.Request().Context(), "registered", bloodRequest)

	notificationData := dto.NotificationCreateRequest{
		UserId: req.UserId,
		Title:  "Registrasi donor darah",
		Message:   "Registrasi donor darah anda telah berhasil, silahkan tunggu konfirmasi dari admin",
		NotificationType: "Donor Registration",

	}
	if err := h.notificationService.Create(ctx.Request().Context(), notificationData); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat notifikasi: "+err.Error()))
	}
	
	return ctx.JSON(http.StatusCreated, response.SuccessResponse("berhasil membuat pendaftaran donor", nil))
}

// AllRole
func (h *DonorRegistrationHandler) UpdateDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	donorRegistration, err := h.donorRegistrationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pendaftaran donor: "+err.Error()))
	}

	if donorRegistration == nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "pendaftaran donor tidak ditemukan"))
	}

	if claimsData.Role == "User"{
		if donorRegistration.UserId != claimsData.Id {
			return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "Tidak memiliki izin"))
		}
		if donorRegistration.Status != "registered" {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Pendaftaran sudah tidak dapat diupdate"))
		}
		if req.Status == "cancelled" {
			if !donorRegistration.BloodRequest.EventDate.Before(time.Now().In(timezone.JakartaLocation)) {
				return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "tidak dapat membatalkan pendaftaran setelah event"))
			}
			bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), donorRegistration.RequestId)
			if err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data permintaan darah: "+err.Error()))
			}
			_ = h.bloodRequestService.RegistrationDonate(ctx.Request().Context(), req.Status, bloodRequest)
		}
	} else {
		req.Notes = ""
	}

	if err := h.donorRegistrationService.Update(ctx.Request().Context(), req, donorRegistration); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal memperbarui pendaftaran donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusCreated, response.SuccessResponse("berhasil memperbarui pendaftaran donor", nil))
}

func (h *DonorRegistrationHandler) DeleteDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pengguna"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan informasi pengguna dari token"))
	}

	donorRegistration, err := h.donorRegistrationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data pendaftaran donor: "+err.Error()))
	}
	if claimsData.Role == "User"{
		if claimsData.Id != donorRegistration.UserId {
			return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "Tidak memiliki izin"))
		}
	}
	
	if err := h.donorRegistrationService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal menghapus pendaftaran donor: "+err.Error()))
	}
	return ctx.JSON(http.StatusCreated, response.SuccessResponse("berhasil menghapus pendaftaran donor", nil))
}
