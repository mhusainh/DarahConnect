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

type NotificationHandler struct {
	notificationService service.NotificationService
}

func NewNotificationHandler(
	notificationService service.NotificationService,
	) NotificationHandler {
	return NotificationHandler{
		notificationService,
	}
}

func (h *NotificationHandler) GetNotifications(ctx echo.Context) error {
	// Bind query parameters ke struct request
	var req dto.GetAllNotificationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	notifications, total, err := h.notificationService.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, 
		response.SuccessResponseWithPagi("berhasil menampilkan semua notifikasi", notifications, req.Page, req.Limit, total))
}

func (h *NotificationHandler) GetNotification(ctx echo.Context) error {
	var req dto.NotificationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	notification, err := h.notificationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan notifikasi", notification))
}

func (h *NotificationHandler) GetNotificationByUserId(ctx echo.Context) error{
	// Bind query parameters ke struct request
	var userReq dto.NotificationByUserIdRequest
	if err := ctx.Bind(&userReq); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Bind query parameters untuk filter dan pagination
	var req dto.GetAllNotificationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	notifications, total, err := h.notificationService.GetByUserId(ctx.Request().Context(), userReq.UserId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, 
		response.SuccessResponseWithPagi("berhasil menampilkan semua notifikasi", notifications, req.Page, req.Limit, total,))
}

func (h *NotificationHandler) GetNotificationsByUser(ctx echo.Context) error {
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

	// Bind query parameters untuk filter dan pagination
	var req dto.GetAllNotificationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	notifications, total, err := h.notificationService.GetByUserId(ctx.Request().Context(), claimsData.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, 
		response.SuccessResponseWithPagi("berhasil menampilkan semua notifikasi pengguna", notifications, req.Page, req.Limit, total))
}

func (h *NotificationHandler) GetNotificationByUser(ctx echo.Context) error {
	var req dto.NotificationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "gagal mendapatkan user klaims"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "gagal mendapatkan informasi pengguna dari token"))
	}

	notification, err := h.notificationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	// Check if the notification belongs to the user
	if notification.UserId != claimsData.Id {
		return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "Tidak memiliki izin"))
	}
	
	var update dto.NotificationUpdateRequest
	update.IsRead = true
	if err := h.notificationService.Update(ctx.Request().Context(), update, notification); err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan notifikasi pengguna", notification))
}

func (h *NotificationHandler) GetUnreadNotificationCount(ctx echo.Context) error {
	// Retrieve user claims from the JWT token
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "gail mendapatkan user klaims"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "gagal mendapatkan informasi pengguna dari token"))
	}

	count, err := h.notificationService.GetUnreadCountByUserId(ctx.Request().Context(), claimsData.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menampilkan jumlah notifikasi belum dibaca", count))
}

func (h *NotificationHandler) CreateNotification(ctx echo.Context) error {
	var req dto.NotificationCreateRequest

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := ctx.Validate(&req); err != nil{
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	
	if err := h.notificationService.Create(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusCreated, response.SuccessResponse("berhasil membuat notifikasi", nil))
}

func (h *NotificationHandler) UpdateNotification(ctx echo.Context) error {
	var req dto.NotificationUpdateRequest

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	notification, err := h.notificationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.notificationService.Update(ctx.Request().Context(), req, notification); err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusCreated, response.SuccessResponse("berhasil memperbarui notifikasi", nil))
}

func (h *NotificationHandler) DeleteNotification(ctx echo.Context) error {
	var req dto.NotificationByIdRequest

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.notificationService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError,
			response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menghapus notifikasi", nil))
}
