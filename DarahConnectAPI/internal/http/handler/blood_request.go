package handler

import (
	"net/http"
	"strconv"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/labstack/echo/v4"
)

type BloodRequestHandler struct {
	bloodRequestService service.BloodRequestService
	notificationService service.NotificationService
}

func NewBloodRequestHandler(
	bloodRequestService service.BloodRequestService,
	notificationService service.NotificationService,
	) BloodRequestHandler {
	return BloodRequestHandler{
		bloodRequestService,
		notificationService,
	}
}

func (h *BloodRequestHandler) CreateBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	if err := ctx.Validate(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Data tidak valid: "+err.Error()))
	}

	if imageFile, err := ctx.FormFile("image");err != nil {
		// Jika error bukan karena file tidak ada, berarti ada masalah lain.
		if err != http.ErrMissingFile {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Kesalahan memproses file gambar: "+err.Error()))
		}
		// Jika errornya adalah http.ErrMissingFile, tidak apa-apa, karena gambar bersifat opsional.
		// req.Image akan tetap nil.
	} else {
		// Jika file ada, masukkan ke dalam struct request.
		req.Image = imageFile
	}
	var acceptedImages = map[string]struct{}{
		"image/png":  {},
		"image/jpeg": {},
		"image/jpg": {},
	}
	if req.Image != nil {
		if _, ok := acceptedImages[req.Image.Header.Get("Content-Type")]; !ok {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Tipe gambar tidak didukung"))
		}
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

	if err := h.bloodRequestService.CreateBloodRequest(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat permintaan darah: "+err.Error()))
	}

	notificationData := dto.NotificationCreateRequest{
		UserId:      req.UserId,
		Title:       "Pemberitahuan Permintaan Darah",
		Message:	 "Anda telah membuat permintaan darah. Mohon tunggu konfirmasi dari pihak admin.",
		NotificationType: "Request",
	}
	if err := h.notificationService.Create(ctx.Request().Context(),notificationData ); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat notifikasi: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil membuat permintaan darah", nil))
}

func (h *BloodRequestHandler) CreateCampaign(ctx echo.Context) error {
	var req dto.CampaignCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	if err := ctx.Validate(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Data tidak valid: "+err.Error()))
	}
	if imageFile, err := ctx.FormFile("image");err != nil {
		// Jika error bukan karena file tidak ada, berarti ada masalah lain.
		if err != http.ErrMissingFile {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Kesalahan memproses file gambar: "+err.Error()))
		}
		// Jika errornya adalah http.ErrMissingFile, tidak apa-apa, karena gambar bersifat opsional.
		// req.Image akan tetap nil.
	} else {
		// Jika file ada, masukkan ke dalam struct request.
		req.Image = imageFile
	}
	var acceptedImages = map[string]struct{}{
		"image/png":  {},
		"image/jpeg": {},
		"image/jpg": {},
	}
	if req.Image != nil {
		if _, ok := acceptedImages[req.Image.Header.Get("Content-Type")]; !ok {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Tipe gambar tidak didukung"))
		}
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

	if err := h.bloodRequestService.CreateCampaign(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat kampanye: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil membuat kampanye", nil))
}

func (h *BloodRequestHandler) GetBloodRequests(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	bloodRequests, total, err := h.bloodRequestService.GetAllBloodRequest(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data permintaan darah: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua permintaan darah", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) GetBloodRequestByUser(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
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

	bloodRequests, total, err := h.bloodRequestService.GetAllBloodRequestByUser(ctx.Request().Context(), claimsData.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data permintaan darah pengguna: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua permintaan darah", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) GetBloodRequestsByAdmin(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	bloodRequests, total, err := h.bloodRequestService.GetAllAdminBloodRequest(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data permintaan darah admin: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua permintaan darah", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) GetCampaigns(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequests, total, err := h.bloodRequestService.GetAllCampaign(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data kampanye: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil menampilkan semua kampanye", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) GetById(ctx echo.Context) error {
	var req dto.BloodRequestByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data permintaan darah: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan permintaan darah", bloodRequest))
}

func (h *BloodRequestHandler) UpdateBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if imageFile, err := ctx.FormFile("image");err != nil {
		// Jika error bukan karena file tidak ada, berarti ada masalah lain.
		if err != http.ErrMissingFile {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Kesalahan memproses file gambar: "+err.Error()))
		}
		// Jika errornya adalah http.ErrMissingFile, tidak apa-apa, karena gambar bersifat opsional.
		// req.Image akan tetap nil.
	} else {
		// Jika file ada, masukkan ke dalam struct request.
		req.Image = imageFile
	}
	var acceptedImages = map[string]struct{}{
		"image/png":  {},
		"image/jpeg": {},
		"image/jpg": {},
	}
	if req.Image != nil {
		if _, ok := acceptedImages[req.Image.Header.Get("Content-Type")]; !ok {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Tipe gambar tidak didukung"))
		}
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

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if claimsData.Role == "User" {
		if claimsData.Id != bloodRequest.UserId {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Anda tidak memiliki izin untuk memperbarui permintaan ini"))
		}
		if bloodRequest.Status == "completed" || bloodRequest.Status == "verified" {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Permintaan Sudah tidak bisa diupdate"))
		}
		if req.Status != "" && req.Status != "canceled" {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Anda hanya bisa membatalkan permintaan"))
		}
	}

	if err := h.bloodRequestService.UpdateBloodRequest(ctx.Request().Context(), req, bloodRequest); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal memperbarui permintaan darah: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil memperbarui permintaan darah", bloodRequest))
}

func (h *BloodRequestHandler) UpdateCampaign(ctx echo.Context) error {
	var req dto.CampaignUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if imageFile, err := ctx.FormFile("image");err != nil {
		// Jika error bukan karena file tidak ada, berarti ada masalah lain.
		if err != http.ErrMissingFile {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Kesalahan memproses file gambar: "+err.Error()))
		}
		// Jika errornya adalah http.ErrMissingFile, tidak apa-apa, karena gambar bersifat opsional.
		// req.Image akan tetap nil.
	} else {
		// Jika file ada, masukkan ke dalam struct request.
		req.Image = imageFile
	}
	var acceptedImages = map[string]struct{}{
		"image/png":  {},
		"image/jpeg": {},
		"image/jpg": {},
	}
	if req.Image != nil {
		if _, ok := acceptedImages[req.Image.Header.Get("Content-Type")]; !ok {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Tipe gambar tidak didukung"))
		}
	}

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.bloodRequestService.UpdateCampaign(ctx.Request().Context(), req, bloodRequest); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil memperbarui kampanye", bloodRequest))
}

func (h *BloodRequestHandler) StatusBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestUpdateRequest
	var notif dto.NotificationCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.bloodRequestService.UpdateBloodRequest(ctx.Request().Context(), req, bloodRequest); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	notif.UserId = bloodRequest.UserId
	notif.Title = "Permintaan Darah"
	notif.Message = "Permintaan darah anda telah di" + req.Status
	notif.NotificationType = "info"
	if err := h.notificationService.Create(ctx.Request().Context(), notif); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil membuat permintaan darah", nil))
}

func (h *BloodRequestHandler) DeleteBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestByIdRequest
	// Mengambil ID dari parameter URL, bukan dari body request
	idStr := ctx.Param("id")
	if idStr == "" {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Parameter id diperlukan"))
	}
	
	// Parse ID ke int64
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Format id tidak valid"))
	}
	
	req.Id = id

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

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if claimsData.Role == "User" {
		if claimsData.Id != bloodRequest.UserId {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Anda tidak mempunyai akses"))
		}

		if bloodRequest.Status != "pending" {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Kampanye tidak dapat dihapus karena status " + bloodRequest.Status))
		}
	}
	if err := h.bloodRequestService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal menghapus permintaan darah: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menghapus permintaan darah", nil))
}
