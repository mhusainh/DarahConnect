package builder

import (
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/config"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/handler"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/router"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	service "github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/services"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/route"
	"github.com/midtrans/midtrans-go/snap"

	"gorm.io/gorm"
)

func BuilderPublicRoutes(cfg *config.Config, db *gorm.DB, midtransClient snap.Client) []route.Route {
	//repository
	eventRepository := repository.NewEventRepository(db)
	transactionRepository := repository.NewTransactionRepository(db)
	userRepository := repository.NewUserRepository(db)
	notificationRepository := repository.NewNotificationRepository(db)
	requestEventRepository := repository.NewRequestEventRepository(db)
	//end

	//service
	tokenService := service.NewTokenService(cfg.JWTConfig.SecretKey)
	notificationService := service.NewNotificationService(notificationRepository, cfg)
	userService := service.NewUserService(tokenService, cfg, userRepository)
	eventService := service.NewEventService(eventRepository, transactionRepository, cfg, userRepository, notificationService)
	paymentService := service.NewPaymentService(midtransClient, cfg, notificationService)
	tranService := service.NewTransactionService(cfg, transactionRepository, eventRepository, userRepository, paymentService)
	submissionService := service.NewSubmissionService(cfg, requestEventRepository, transactionRepository, userRepository, notificationService, eventService)
	//end

	//handler
	eventHandler := handler.NewEventHandler(eventService, tokenService)
	tranHandler := handler.NewTransactionHandler(tranService, tokenService, paymentService, userService, eventService, notificationService)
	userHandler := handler.NewUserHandler(tokenService, userService)
	submissionHandler := handler.NewRequestEventHandler(submissionService, tokenService, eventService, paymentService, userService)
	//end

	return router.PublicRoutes(eventHandler, userHandler, tranHandler, submissionHandler)
}

func BuilderPrivateRoutes(cfg *config.Config, db *gorm.DB, midtransClient snap.Client) []route.Route {
	//repository
	eventRepository := repository.NewEventRepository(db)
	transactionRepository := repository.NewTransactionRepository(db)
	userRepository := repository.NewUserRepository(db)
	notificationRepository := repository.NewNotificationRepository(db)
	requestEventRepository := repository.NewRequestEventRepository(db)
	//end

	//service
	tokenService := service.NewTokenService(cfg.JWTConfig.SecretKey)
	userService := service.NewUserService(tokenService, cfg, userRepository)
	notifService := service.NewNotificationService(notificationRepository, cfg)
	eventService := service.NewEventService(eventRepository, transactionRepository, cfg, userRepository, notifService)
	submissionService := service.NewSubmissionService(cfg, requestEventRepository, transactionRepository, userRepository, notifService, eventService)
	paymentService := service.NewPaymentService(midtransClient, cfg, notifService)
	tranService := service.NewTransactionService(cfg, transactionRepository, eventRepository, userRepository, paymentService)

	//end

	//handler
	eventHandler := handler.NewEventHandler(eventService, tokenService)
	userHandler := handler.NewUserHandler(tokenService, userService)
	tranHandler := handler.NewTransactionHandler(tranService, tokenService, paymentService, userService, eventService, notifService)
	notifHandler := handler.NewNotificationHandler(notifService, tokenService)
	submissionHandler := handler.NewRequestEventHandler(submissionService, tokenService, eventService, paymentService, userService)
	//end

	return router.PrivateRoutes(eventHandler, userHandler, tranHandler, notifHandler, submissionHandler)
}
