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

type DonorRegistrationHandler struct {
	donorRegistrationService service.DonorRegistrationService
}

func NewDonorRegistrationHandler(donorRegistrationService service.DonorRegistrationService) DonorRegistrationHandler {
	return DonorRegistrationHandler{
		donorRegistrationService,
	}
}

func (h *DonorRegistrationHandler) GetDonorRegistrations(ctx echo.Context) error {
	var req dto.GetAllDonorRegistrationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorRegistrations, total, err := h.donorRegistrationService.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all donor registrations", donorRegistrations, req.Page, req.Limit, total))
}

func (h *DonorRegistrationHandler) GetDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorRegistration, err := h.donorRegistrationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully showing donor registration", donorRegistration))
}

func (h *DonorRegistrationHandler) GetDonorRegistrationsByUserId(ctx echo.Context) error {
	var req dto.GetAllDonorRegistrationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	var userId dto.DonorRegistrationByUserIdRequest
	if err := ctx.Bind(&userId); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorRegistrations, total, err := h.donorRegistrationService.GetAllByUserId(ctx.Request().Context(), userId.UserId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all donor registrations", donorRegistrations, req.Page, req.Limit, total))
}

func (h *DonorRegistrationHandler) GetDonorRegistrationsByScheduleId(ctx echo.Context) error {
	var req dto.GetAllDonorRegistrationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	var scheduleId dto.DonorRegistrationByScheduleIdRequest
	if err := ctx.Bind(&scheduleId); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorRegistrations, total, err := h.donorRegistrationService.GetAllByScheduleId(ctx.Request().Context(), scheduleId.ScheduleId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all donor registrations", donorRegistrations, req.Page, req.Limit, total))
}

func (h *DonorRegistrationHandler) CreateDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	
	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "unable to get user claims"))
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "unable to get user information from claims"))
	}

	req.UserId = claimsData.Id
	
	if err := h.donorRegistrationService.Create(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusCreated, response.SuccessResponse("successfully creating donor registration", nil))
}

func (h *DonorRegistrationHandler) UpdateDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorRegistration, err := h.donorRegistrationService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.donorRegistrationService.Update(ctx.Request().Context(), req, donorRegistration); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusCreated, response.SuccessResponse("successfully updating donor registration", nil))
}

func (h *DonorRegistrationHandler) DeleteDonorRegistration(ctx echo.Context) error {
	var req dto.DonorRegistrationByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.donorRegistrationService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusCreated, response.SuccessResponse("successfully deleting donor registration", nil))
}