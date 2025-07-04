package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
)

type HospitalHandler struct {
	hospitalHandler service.HospitalService
}

func NewHospitalHandler(hospitalHandler service.HospitalService) HospitalHandler {
	return HospitalHandler{hospitalHandler}
}

func (h *HospitalHandler) GetAll(ctx echo.Context) error {
	var req dto.GetAllHospitalRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	hospitals, total, err := h.hospitalHandler.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data rumah sakit: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil mengambil semua rumah sakit", hospitals, req.Page, req.Limit, total))
}

func (h *HospitalHandler) Create(ctx echo.Context) error {
	var req dto.HospitalCreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	if err := ctx.Validate(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Data tidak valid: "+err.Error()))
	}
	hospital, err := h.hospitalHandler.Create(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal membuat rumah sakit: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil membuat rumah sakit", hospital))
}

func (h *HospitalHandler) GetById(ctx echo.Context) error {
	var req dto.HospitalGetByIdRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	hospital, err := h.hospitalHandler.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data rumah sakit: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil mengambil rumah sakit berdasarkan id", hospital))
}

func (h *HospitalHandler) Update(ctx echo.Context) error {
	var req dto.HospitalUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	hospital, err := h.hospitalHandler.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if err := h.hospitalHandler.Update(ctx.Request().Context(), req, hospital); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal memperbarui rumah sakit: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil memperbarui rumah sakit", nil))
}

func (h *HospitalHandler) Delete(ctx echo.Context) error {
	var req dto.HospitalDeleteRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.hospitalHandler.Delete(ctx.Request().Context(), req.Id); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal menghapus rumah sakit: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil menghapus rumah sakit", nil))
}
