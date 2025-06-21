package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"

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
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorSchedules, total, err := h.donorScheduleService.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all donor schedules", donorSchedules, total, req.Page, req.Limit))
}

func (h *DonorScheduleHandler) GetDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorSchedule, err := h.donorScheduleService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully showing donor schedule", donorSchedule))
}

func (h *DonorScheduleHandler) GetDonorScheduleByHospitalId(ctx echo.Context) error {
	var req dto.GetAllDonorScheduleRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	var hospitalId dto.HospitalGetByIdRequest
	if err := ctx.Bind(&hospitalId); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorSchedules, total, err := h.donorScheduleService.GetByHospitalId(ctx.Request().Context(), hospitalId.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("successfully showing all donor schedules", donorSchedules, req.Page, req.Limit, total))
}

func (h *DonorScheduleHandler) CreateDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.donorScheduleService.Create(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully created donor schedule", nil))
}

func (h *DonorScheduleHandler) UpdateDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	donorSchedule, err := h.donorScheduleService.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.donorScheduleService.Update(ctx.Request().Context(), req, donorSchedule); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully updated donor schedule", nil))
}

func (h *DonorScheduleHandler) DeleteDonorSchedule(ctx echo.Context) error {
	var req dto.DonorScheduleByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.donorScheduleService.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully deleted donor schedule", nil))
}
