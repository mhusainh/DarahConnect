package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/midtrans"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
)

type DonationHandler struct {
	midtransService midtrans.MidtransService
	notificationService service.NotificationService
	donationService service.DonationsService
}

func NewDonationHandler(midtransService midtrans.MidtransService, notificationService service.NotificationService, donationService service.DonationsService) *DonationHandler {
	return &DonationHandler{
		midtransService: midtransService,
		notificationService: notificationService,
		donationService: donationService,
	}
}


func (h *DonationHandler) WebHookTransaction(ctx echo.Context) error {
	var req dto.DonationsCreate
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	err := h.midtransService.WebHookTransaction(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal memproses transaksi webhook: "+err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil memperbarui status donasi", nil))
}

func (h *DonationHandler) CreateTransaction(ctx echo.Context) error {
	var req dto.PaymentRequest

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	if err := ctx.Validate(req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Data tidak valid: "+err.Error()))
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
	// Generate order ID
	req.OrderID = "ORDER-" + strconv.FormatInt(claimsData.Id, 10) + "-" + time.Now().Format("20060102150405")
	req.Fullname = claimsData.Name
	req.Email = claimsData.Email
	req.UserId = claimsData.Id

	redirectURL, err := h.midtransService.CreateTransaction(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat transaksi: "+err.Error()))
	}
	notificationData := dto.NotificationCreateRequest{
		UserId:      claimsData.Id,
		Title:       "Pemberitahuan Donasi",
		Message:     "Terima kasih telah berdonasi. Sialahkan cek pembayaran di email anda. Atau anda bisa klik link ini : " + redirectURL,
		NotificationType: "Donation",
	}
	if err := h.notificationService.Create(ctx.Request().Context(), notificationData); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat notifikasi: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil membuat transaksi", map[string]interface{}{
		"redirect_url": redirectURL,
	}))
}

func (h	 *DonationHandler) GetDonations(ctx echo.Context) error {
	var req dto.GetAllDonation
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}
	donations, total, err := h.donationService.GetAllDonation(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data donasi: "+err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua donasi", donations, req.Page, req.Limit, total))
}

func (h *DonationHandler) GetDonation(ctx echo.Context) error {
	// Ambil ID dari parameter path
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Format ID tidak valid"))
	}

	donation, err := h.donationService.GetById(ctx.Request().Context(), id)
	if err != nil {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Donasi tidak ditemukan: "+err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil mendapatkan data", donation))
}