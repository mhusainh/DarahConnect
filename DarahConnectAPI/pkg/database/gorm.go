package database

import (
	"fmt"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/config"
	"gorm.io/driver/postgres" // Ganti driver MySQL dengan PostgreSQL
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase(postgresConfig config.PostgresConfig) (*gorm.DB, error) {
	// Format string DSN untuk PostgreSQL
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		postgresConfig.Host,
		postgresConfig.Port,
		postgresConfig.User,
		postgresConfig.Password,
		postgresConfig.Database,
		postgresConfig.SSLMode, // Menggunakan pengaturan SSL
	)

	// Koneksi ke database PostgreSQL menggunakan GORM
	return gorm.Open(postgres.New(postgres.Config{
		DSN: dsn, // Data Source Name
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
}
