package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/midtrans"
)

type DonationHandler struct {
	midtransService midtrans.MidtransService
}

func NewDonationHandler(midtransService midtrans.MidtransService) *DonationHandler {
	return &DonationHandler{
		midtransService: midtransService,
	}
}


func (h *DonationHandler) WebHookTransaction(ctx echo.Context) error {
	var req dto.DonationsCreate
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	err := h.midtransService.WebHookTransaction(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully update donation status", nil))
}

func (h *DonationHandler) CreateTransaction(ctx echo.Context) error {
	var req dto.PaymentRequest

	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	claims, ok := ctx.Get("user").(*jwt.Token)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user claims")
	}

	// Extract user information from claims
	claimsData, ok := claims.Claims.(*token.JwtCustomClaims)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "unable to get user information from claims")
	}
	// Generate order ID
	req.OrderID = "ORDER-" + strconv.FormatInt(claimsData.Id, 10) + "-" + time.Now().Format("20060102150405")
	req.Fullname = claimsData.Name
	req.Email = claimsData.Email

	redirectURL, err := h.midtransService.CreateTransaction(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully created transaction", map[string]interface{}{
		"redirect_url": redirectURL,
	}))
}
