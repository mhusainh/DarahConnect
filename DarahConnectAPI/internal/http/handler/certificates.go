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

type CertificateHandler struct {
	certificateHandler service.CertificateService
}

func NewCertificateHandler(certificateHandler service.CertificateService) CertificateHandler {
	return CertificateHandler{certificateHandler}
}

func (h *CertificateHandler) GetAll(ctx echo.Context) error {
	var req dto.GetAllCertificateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Gagal memproses permintaan: "+err.Error()))
	}

	certificates, total, err := h.certificateHandler.GetAll(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data sertifikat: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil mengambil semua sertifikat", certificates, req.Page, req.Limit, total))
}

func (h *CertificateHandler) GetById(ctx echo.Context) error {
	var req dto.CertificateGetByIdRequest
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

	certificate, err := h.certificateHandler.GetById(ctx.Request().Context(), req.Id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data sertifikat: "+err.Error()))
	}

	if claimsData.Role == "User" {
		if certificate.UserId != claimsData.Id {
			return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "Tidak memiliki izin"))
		}
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("berhasil mengambil sertifikat", certificate))
}

func (h *CertificateHandler) GetByUser(ctx echo.Context) error {
	var req dto.GetAllCertificateRequest
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

	certificates, total, err := h.certificateHandler.GetByUser(ctx.Request().Context(), claimsData.Id, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, "Gagal mendapatkan data sertifikat pengguna: "+err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponseWithPagi("berhasil mengambil sertifikat pengguna", certificates, req.Page, req.Limit, total))
}