package router

import (
	"mhusainh/DarahConnect/DarahConnectAPI/internal/http/handler"
	"net/http"

	"github.com/mhusainh/DarahConnect/DarahConnectAPIConnect/DarahConnectAPI/pkg/route"
)

func PublicRoutes(userHandler handler.UserHandler) []route.Route {
	return []route.Route{
		{
			Method:  http.MethodPost,
			Path:    "/login",
			Handler: userHandler.Login,
		},
		{
			Method:  http.MethodGet,
			Path:    "/generate-password/:password",
			Handler: userHandler.GeneratePassword,
		},
	}
}

func PrivateRoutes(userHandler handler.UserHandler) []route.Route {
	return []route.Route{
		{
			Method:  http.MethodGet,
			Path:    "/users",
			Handler: userHandler.FindAll,
			Roles:   []string{"admin", "editor"},
		},
	}
}
