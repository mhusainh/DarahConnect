package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
)

type DonationHandler struct {
	donationService service.MidtransService
}

func NewDonationHandler(donationService service.MidtransService) *DonationHandler {
	return &DonationHandler{
		donationService: donationService,
	}
}

func (h *DonationHandler) WebHookTransaction(ctx echo.Context) error {
	var req dto.DonationsCreate
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	

	err := h.donationService.WebHookTransaction(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully update donation status", nil))
}	
