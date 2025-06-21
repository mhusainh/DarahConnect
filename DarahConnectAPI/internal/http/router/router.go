package router

import (
	"net/http"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/handler"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/route"
)

var (
	adminOnly = []string{"Administrator"}
	userOnly  = []string{"User"}
	allRoles  = []string{"Administrator", "User"}
)

func PublicRoutes(
	userHandler handler.UserHandler,
	notificationHandler handler.NotificationHandler,
) []route.Route {
	return []route.Route{
		// User Handler
		{
			Method:  http.MethodPost,
			Path:    "/login",
			Handler: userHandler.Login,
		},
		{
			Method:  http.MethodPost,
			Path:    "/register",
			Handler: userHandler.Register,
		},
		{
			Method:  http.MethodPost,
			Path:    "/request-reset-password",
			Handler: userHandler.ResetPasswordRequest,
		},
		{
			Method:  http.MethodPost,
			Path:    "/reset-password/:token",
			Handler: userHandler.ResetPassword,
		},
		{
			Method:  http.MethodGet,
			Path:    "/verify-email/:token",
			Handler: userHandler.VerifyEmail,
		},
	}
}

func PrivateRoutes(
	userHandler handler.UserHandler,
	notificationHandler handler.NotificationHandler,
) []route.Route {
	return []route.Route{
		// Notification Handler
		// Role User
		{
			Method:  http.MethodGet,
			Path:    "/notifications/user",
			Handler: notificationHandler.GetNotificationByUser,
			Roles:   userOnly,
		},
		// Role admin
		{
			Method:  http.MethodGet,
			Path:    "/admin/notifications",
			Handler: notificationHandler.GetNotifications,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/notification",
			Handler: notificationHandler.GetNotification,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/notifications/user/:user_id",
			Handler: notificationHandler.GetNotificationByUserId,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/notification",
			Handler: notificationHandler.CreateNotification,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/notification/:id",
			Handler: notificationHandler.UpdateNotification,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/notification/:id",
			Handler: notificationHandler.DeleteNotification,
			Roles:   adminOnly,
		},

		// User Handler
		{
			Method:  http.MethodGet,
			Path:    "/users/profile",
			Handler: userHandler.GetProfile,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodPut,
			Path:    "/users/profile",
			Handler: userHandler.UpdateUser,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodPost,
			Path:    "/users/profile/picture",
			Handler: userHandler.UpdateUser,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/users",
			Handler: userHandler.GetUsers,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/users/:id",
			Handler: userHandler.GetUser,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/users/:id",
			Handler: userHandler.DeleteUser,
			Roles:   adminOnly,
		},
	}
}
