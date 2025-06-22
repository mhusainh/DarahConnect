package handler

import (
	"net/http"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"

	"github.com/labstack/echo/v4"
)

type BloodRequestHandler struct {
	bloodRequestService service.BloodRequestService
}

func NewBloodRequestHandler(bloodRequestService service.BloodRequestService) BloodRequestHandler {
	return BloodRequestHandler{
		bloodRequestService: bloodRequestService,
	}
}

func (h *BloodRequestHandler) GetBloodRequests(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequests, total, err := h.bloodRequestService.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all blood requests", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) GetBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully showing blood request", bloodRequest))
}

func (h *BloodRequestHandler) GetBloodRequestsByUserId(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	var userId dto.BloodRequestByUserIdRequest
	if err := ctx.Bind(&userId); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequests, total, err := h.bloodRequestService.GetAllByUserId(ctx.Request().Context(), userId.UserId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all blood requests", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) GetBloodRequestsByHospitalId(ctx echo.Context) error {
	var req dto.GetAllBloodRequestRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	var hospitalId dto.BloodRequestByHospitalIdRequest
	if err := ctx.Bind(&hospitalId); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequests, total, err := h.bloodRequestService.GetAllByHospitalId(ctx.Request().Context(), hospitalId.HospitalId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all blood requests", bloodRequests, req.Page, req.Limit, total))
}

func (h *BloodRequestHandler) UpdateBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	bloodRequest, err := h.bloodRequestService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.bloodRequestService.Update(ctx.Request().Context(), req, bloodRequest); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully updating blood request", bloodRequest))
}

func (h *BloodRequestHandler) DeleteBloodRequest(ctx echo.Context) error {
	var req dto.BloodRequestByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.bloodRequestService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully deleting blood request", nil))
}