package builder

import (
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/handler"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/router"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/service"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/cache"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/cloudinary"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/mailer"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/route"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func BuildPublicRoutes(cfg *configs.Config, db *gorm.DB, rdb *redis.Client, cloudinaryService *cloudinary.Service, mailer *mailer.Mailer) []route.Route {
	cacheable := cache.NewCacheable(rdb)
	tokenUseCase := token.NewTokenUseCase(cfg.JWT.SecretKey)

	//repository
	userRepository := repository.NewUserRepository(db)
	notificationRepository := repository.NewNotificationRepository(db)
	//end

	//service
	userService := service.NewUserService(userRepository, tokenUseCase, cacheable, cfg, mailer)
	notificationService := service.NewNotificationService(notificationRepository)
	//end

	//handler
	userHandler := handler.NewUserHandler(userService, cloudinaryService)
	notificationHandler := handler.NewNotificationHandler(notificationService)
	//end

	return router.PublicRoutes(userHandler, notificationHandler)
}

func BuildPrivateRoutes(cfg *configs.Config, db *gorm.DB, rdb *redis.Client, cloudinaryService *cloudinary.Service, mailer *mailer.Mailer) []route.Route {
	cacheable := cache.NewCacheable(rdb)
	tokenUseCase := token.NewTokenUseCase(cfg.JWT.SecretKey)

	//repository
	userRepository := repository.NewUserRepository(db)
	notificationRepository := repository.NewNotificationRepository(db)
	//end

	//service
	userService := service.NewUserService(userRepository, tokenUseCase, cacheable, cfg, mailer)
	notificationService := service.NewNotificationService(notificationRepository)
	//end

	//handler
	userHandler := handler.NewUserHandler(userService, cloudinaryService)
	notificationHandler := handler.NewNotificationHandler(notificationService)
	//end

	return router.PrivateRoutes(userHandler, notificationHandler)
}
