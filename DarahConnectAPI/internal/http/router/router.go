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
	bloodRequestHandler handler.BloodRequestHandler,
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
			Path:    "/reset-password",
			Handler: userHandler.ResetPassword,
		},
		{
			Method:  http.MethodGet,
			Path:    "/verify-email",
			Handler: userHandler.VerifyEmail,
		},
		{
			Method:  http.MethodGet,
			Path:    "/campaign",
			Handler: bloodRequestHandler.GetBloodRequests,
		},
		{
			Method:  http.MethodGet,
			Path:    "/campaign/:id",
			Handler: bloodRequestHandler.GetCampaigns,
		},

	}
}

func PrivateRoutes(
	userHandler handler.UserHandler,
	notificationHandler handler.NotificationHandler,
	healthPassportHandler handler.HealthPassportHandler,
	bloodRequestHandler handler.BloodRequestHandler,
	donorRegistrationHandler handler.DonorRegistrationHandler,
	donorScheduleHandler handler.DonorScheduleHandler,
	hospitalHandler handler.HospitalHandler,
) []route.Route {
	return []route.Route{
		// =============================================
		// USER ONLY ROUTES
		// =============================================
		// Health Passport - User Only
		{
			Method:  http.MethodGet,
			Path:    "/health-passport",
			Handler: healthPassportHandler.GetHealthPassportByUser,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodPut,
			Path:    "/health-passport",
			Handler: healthPassportHandler.UpdateHealthPassportByUser,
			Roles:   userOnly,
		},
		// Notification - User Only
		{
			Method:  http.MethodGet,
			Path:    "/notifications/user",
			Handler: notificationHandler.GetNotificationsByUser,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/notifications/user/:id",
			Handler: notificationHandler.GetNotificationByUser,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/notifications/user/count",
			Handler: notificationHandler.GetUnreadNotificationCount,
			Roles:   userOnly,
		},
		// Donor Registration - User Only
		{
			Method:  http.MethodPost,
			Path:    "/admin/users/:id",
			Handler: donorRegistrationHandler.CreateDonorRegistration,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/schedules/",
			Handler: donorScheduleHandler.GetDonorSchedules,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/schedule/:id",
			Handler: donorScheduleHandler.GetDonorSchedule,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodPost,
			Path:    "/schedule/",
			Handler: donorScheduleHandler.CreateDonorSchedule,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodPut,
			Path:    "/schedule/:id",
			Handler: donorScheduleHandler.UpdateDonorSchedule,
			Roles:   userOnly,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/schedule/:id",
			Handler: donorScheduleHandler.DeleteDonorSchedule,
			Roles:   userOnly,
		},

		// =============================================
		// ADMIN ONLY ROUTES
		// =============================================
		// Health Passport - Admin Only
		{
			Method:  http.MethodGet,
			Path:    "/admin/health-passports",
			Handler: healthPassportHandler.GetHealthPassports,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/health-passport/:id",
			Handler: healthPassportHandler.GetHealthPassport,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/health-passport/:id",
			Handler: healthPassportHandler.UpdateStatusHealthPassport,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/health-passport",
			Handler: healthPassportHandler.DeleteHealthPassport,
			Roles:   adminOnly,
		},
		// Blood Request/Campaign - Admin Only
		{
			Method:  http.MethodPut,
			Path:    "/admin/campaign/:id",
			Handler: bloodRequestHandler.UpdateBloodRequest,
			Roles:   adminOnly,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/campaign/:id",
			Handler: bloodRequestHandler.DeleteBloodRequest,
			Roles:   adminOnly,
		},
		// Notification - Admin Only
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
		// User Management - Admin Only
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
		{
			Method:  http.MethodDelete,
			Path:    "/donor-registration/",
			Handler: donorRegistrationHandler.DeleteDonorRegistration,
			Roles:   adminOnly,
		},

		// =============================================
		// ALL ROLES ROUTES (Admin & User)
		// =============================================
		// User Profile - All Roles
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
		// Donor Registration - All Roles
		{
			Method:  http.MethodGet,
			Path:    "/donor-registrations",
			Handler: donorRegistrationHandler.GetDonorRegistrations,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodGet,
			Path:    "/donor-registration/:id",
			Handler: donorRegistrationHandler.GetDonorRegistration,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodPut,
			Path:    "/donor-registration/",
			Handler: donorRegistrationHandler.UpdateDonorRegistration,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodGet,
			Path:    "/hospital/",
			Handler: hospitalHandler.GetAll,
			Roles:   allRoles,
		},
		{
			Method:  http.MethodGet,
			Path:    "/hospital/:id",
			Handler: hospitalHandler.GetById,
			Roles:   allRoles,
		},
	}
}
