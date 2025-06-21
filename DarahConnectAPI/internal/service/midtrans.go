package service

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type midtrans interface {
	WebHookTransaction(ctx echo.Context) error
}

type midtransService struct {
	donationsRepository repository.DonationsRepository
}

func (s *midtransService) WebHookTransaction(ctx echo.Context) error {
	var input dto.DonationsCreate

	if err := ctx.Bind(&input); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	orderID, err := strconv.ParseInt(input.OrderID, 10, 64)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	fmt.Println("orderID : ", orderID)
	transaction, err := h.transactionService.GetById(ctx.Request().Context(), orderID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	user, err := h.userService.GetById(ctx.Request().Context(), transaction.UserID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	if input.TransactionStatus == "settlement" {
		status := "paid"
		transaction.Status = status
		err = h.transactionService.Update(ctx.Request().Context(), orderID, status)
		if err != nil {
			return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
		}
		event, err := h.eventService.GetById(ctx.Request().Context(), transaction.EventID)
		if err != nil {
			return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
		}
		if transaction.Type == "tiket" {
			notification := &dto.NotificationInput{
				UserID:    event.UserID,
				Message:   "Check your ticket on your email! ",
				Is_Read:   false,
				Create_at: time.Now(),
			}
			event.Quantity = event.Quantity - transaction.Quantity
			event.Sold = event.Sold + transaction.Quantity

			if err := h.eventService.UpdateSold(ctx.Request().Context(), event.ID, event.Sold); err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
			}
			if err := h.eventService.UpdateQuantity(ctx.Request().Context(), event.ID, event.Quantity); err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
			}

			if err := h.NotificationService.CreateNotification(ctx.Request().Context(), *notification); err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
			}
			if err := h.NotificationService.SendEmailTiket(ctx.Request().Context(), user, event, transaction); err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
			}
			fmt.Println("orderID : ", orderID)
		} else {
			notification := &dto.NotificationInput{
				UserID:    event.UserID,
				Message:   "Your submission waiting for admin approval! ",
				Is_Read:   false,
				Create_at: time.Now(),
			}
			if err := h.NotificationService.CreateNotification(ctx.Request().Context(), *notification); err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
			}
			err = h.eventService.UpdateStatus(ctx.Request().Context(), transaction.EventID, "pending")
			if err != nil {
				return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
			}
		}
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("Successfully Payment", nil))
}