package handler

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/labstack/echo/v4"
)

type BloodDonationHandler struct {
	bloodDonationService service.BloodDonationService
	notificationService  service.NotificationService
	certificateService   service.CertificateService
}

func NewBloodDonationHandler(
	bloodDonationService service.BloodDonationService,
	notificationService service.NotificationService,
	certificateService service.CertificateService,
) BloodDonationHandler {
	return BloodDonationHandler{
		bloodDonationService,
		notificationService,
		certificateService,
	}
}

func (h *BloodDonationHandler) GetAll(ctx echo.Context) error {
	var req dto.GetAllBloodDonationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodDonations, total, err := h.bloodDonationService.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all blood donations", bloodDonations, req.Page, req.Limit, total))
}

func (h *BloodDonationHandler) GetByUser(ctx echo.Context) error {
	var req dto.GetAllBloodDonationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user claims")
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user information from claims")
	}

	bloodDonations, total, err := h.bloodDonationService.GetByUserId(ctx.Request().Context(), claimsData.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all blood donations by user", bloodDonations, req.Page, req.Limit, total))
}

func (h *BloodDonationHandler) GetById(ctx echo.Context) error {
	var req dto.BloodDonationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user claims")
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user information from claims")
	}

	bloodDonation, err := h.bloodDonationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if claimsData.Role == "User" {
		// Check if the user is the owner of the donation
		if bloodDonation.UserId != claimsData.Id {
			return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "forbidden"))
		}
	}
	// Return the donation data
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully showing blood donation by id", bloodDonation))
}

// user
func (h *BloodDonationHandler) Create(ctx echo.Context) error {
	var req dto.BloodDonationCreateRequest

	// Manually bind the image file
	imageFile, err := ctx.FormFile("image")
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Image file is required"))
	}
	req.Image = imageFile

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Validasi request
	if err := ctx.Validate(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user claims")
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user information from claims")
	}

	req.UserId = claimsData.Id

	if err := h.bloodDonationService.Create(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully creating blood donation", nil))
}

// hanya untuk user
func (h *BloodDonationHandler) Update(ctx echo.Context) error {
	var req dto.BloodDonationUpdateRequest
	req.Status="pending"

	// Manually bind the image file
	if imageFile, err := ctx.FormFile("image"); err != nil {
		// If the error is due to missing file, it means the image is optional
		if err == http.ErrMissingFile {
			req.Image = nil // Set image to nil if not provided
		} else {
			// Handle other errors (e.g., malformed multipart data)
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
		}
	} else {
		req.Image = imageFile
	}

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Validasi request
	if err := ctx.Validate(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user claims")
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user information from claims")
	}
	bloodDonation, err := h.bloodDonationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if claimsData.Role != "User" && bloodDonation.UserId != claimsData.Id {
		return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "forbidden"))
	}

	if bloodDonation.Status == "completed" {
		return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "Donasi darah tidak bisa diubah"))
	}

	var acceptedImages = map[string]struct{}{
		"image/png":  {},
		"image/jpeg": {},
		"image/jpg": {},
	}

	if req.Image != nil {
		if _, ok := acceptedImages[req.Image.Header.Get("Content-Type")]; !ok {
			return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "unsupported image type"))
		}
	}

	updatedBloodDonation, err := h.bloodDonationService.Update(ctx.Request().Context(), req, bloodDonation)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully updating blood donation", updatedBloodDonation))
}

// admin
func (h *BloodDonationHandler) StatusBloodDonation(ctx echo.Context) error {
	var req dto.BloodDonationUpdateRequest
	var notif dto.NotificationCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodDonation, err := h.bloodDonationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if bloodDonation.Status != "pending" {
		return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "Donasi darah tidak bisa diubah"))
	}

	updatedBloodDonation, err := h.bloodDonationService.Update(ctx.Request().Context(), req, bloodDonation)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	var certificateNumber string
	if updatedBloodDonation.Status == "completed" {
		certificate, err := h.certificateService.Create(ctx.Request().Context(), updatedBloodDonation)
		if err != nil {
			return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
		}
		certificateNumber = certificate.CertificateNumber
	}

	notif.UserId = bloodDonation.UserId
	notif.Title = "Status Donasi Darah"
	if updatedBloodDonation.Status == "completed" {
		notif.Message = "Status donasi darah anda telah " + req.Status + " dengan nomor sertifikat " + certificateNumber
	} else {
		notif.Message = "Status donasi darah anda telah " + req.Status
	}
	notif.NotificationType = "information"
	if err := h.notificationService.Create(ctx.Request().Context(), notif); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully updating status blood donation", nil))
}

func (h *BloodDonationHandler) Delete(ctx echo.Context) error {
	var req dto.BloodDonationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user claims")
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user information from claims")
	}

	bloodDonation, err := h.bloodDonationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if claimsData.Role == "User"{
		if bloodDonation.UserId != claimsData.Id {
			return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "unauthorized"))
		}

		if bloodDonation.Status != "pending" {
			return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "Donasi darah tidak bisa dihapus"))
		}
	}

	if err := h.bloodDonationService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully deleting blood donation", nil))
}
