package server

import (
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/response"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/route"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return err
	}
	return nil
}

// RegisterCustomValidators mendaftarkan validator kustom
func RegisterCustomValidators(v *validator.Validate) {
	// Validator untuk ekstensi file berdasarkan magic numbers
	v.RegisterValidation("ext", validateFileExtension)
}

// validateFileExtension memvalidasi ekstensi file berdasarkan magic numbers
func validateFileExtension(fl validator.FieldLevel) bool {
	// Mendapatkan nilai field
	field := fl.Field()

	// Jika field kosong dan tag omitempty ada, validasi berhasil
	if field.IsNil() {
		return true
	}

	// Mendapatkan parameter dari tag validasi (ext=jpg|jpeg|png)
	params := strings.Split(fl.Param(), "|")

	// Mendapatkan file header dari field
	fileHeader, ok := field.Interface().(*multipart.FileHeader)
	if !ok {
		return false
	}

	// Validasi berdasarkan ekstensi file
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext == "" {
		return false
	}

	// Hapus titik dari ekstensi
	ext = strings.TrimPrefix(ext, ".")

	// Periksa apakah ekstensi ada dalam parameter
	validExt := false
	for _, allowedExt := range params {
		if ext == allowedExt {
			validExt = true
			break
		}
	}

	// Jika ekstensi tidak valid, return false
	if !validExt {
		return false
	}

	// Validasi berdasarkan magic numbers
	file, err := fileHeader.Open()
	if err != nil {
		return false
	}
	defer file.Close()

	// Baca 512 byte pertama untuk deteksi tipe konten
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return false
	}

	// Deteksi tipe konten berdasarkan magic numbers
	contentType := http.DetectContentType(buffer)

	// Validasi tipe konten sesuai dengan ekstensi yang diizinkan
	switch ext {
	case "jpg", "jpeg":
		return contentType == "image/jpeg"
	case "png":
		return contentType == "image/png"
	default:
		// Ekstensi tidak didukung dalam validasi konten
		return false
	}
}

type Server struct {
	*echo.Echo
}

func NewServer(cfg *configs.Config,
	publicRoutes, privateRoutes []route.Route) *Server {
	e := echo.New()
	e.HideBanner = true
	
	// Inisialisasi validator
	validator := validator.New()
	RegisterCustomValidators(validator)
	e.Validator = &CustomValidator{validator: validator}

	// Add CORS middleware
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Add logging middleware
	e.Use(middleware.Logger())

	v1 := e.Group("/api/v1/")

	if len(publicRoutes) > 0 {
		for _, route := range publicRoutes {
			v1.Add(route.Method, route.Path, route.Handler)
		}
	}

	if len(privateRoutes) > 0 {
		for _, route := range privateRoutes {
			v1.Add(route.Method, route.Path, route.Handler, JWTMiddleware(cfg.JWT.SecretKey), RBACMiddleware(route.Roles))
		}
	}
	return &Server{e}
}

func JWTMiddleware(secretKey string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(token.JwtCustomClaims)
		},
		SigningKey: []byte(secretKey),
		ErrorHandler: func(ctx echo.Context, err error) error {
			return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "anda harus login untuk megakses resource ini."))
		},
	})
}

func RBACMiddleware(roles []string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			user := ctx.Get("user").(*jwt.Token)
			claims := user.Claims.(*token.JwtCustomClaims)

			allowed := false
			for _, role := range roles {
				if role == claims.Role {
					allowed = true
					break
				}
			}

			if !allowed {
				return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "anda tidak diizinkan untuk mengakses resource ini."))
			}

			return next(ctx)
		}
	}
}
