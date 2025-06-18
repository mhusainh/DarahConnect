package config

import (
	"github.com/caarlos0/env/v6"
	"github.com/joho/godotenv"
)

type Config struct {
	ENV            string         `env:"ENV" envDefault:"dev"`
	PORT           string         `env:"PORT" envDefault:"8080"`
	JWTConfig      JWTConfig      `envPrefix:"JWT_"`
	PostgresConfig PostgresConfig `envPrefix:"POSTGRES_"` // Ubah ke PostgreSQL
	SMTPConfig     SMTPConfig     `envPrefix:"SMTP_"`
}

type SMTPConfig struct {
	Host     string `env:"HOST" envDefault:"localhost"`
	Port     int    `env:"PORT" envDefault:"587"`
	Username string `env:"USERNAME"`
	Password string `env:"PASSWORD"`
}

type JWTConfig struct {
	SecretKey string `env:"SECRET_KEY"`
}

// Ganti MySQLConfig menjadi PostgresConfig
type PostgresConfig struct {
	Host     string `env:"HOST" envDefault:"localhost"`
	Port     string `env:"PORT" envDefault:"5432"`     // Default PostgreSQL Port
	User     string `env:"USER" envDefault:"postgres"` // Default PostgreSQL User
	Password string `env:"PASSWORD"`
	Database string `env:"DATABASE"`
	SSLMode  string `env:"SSL_MODE" envDefault:"disable"` // SSL Mode default
}

func NewConfig(path string) (*Config, error) {
	// Memuat konfigurasi dari file .env
	err := godotenv.Load(path)
	if err != nil {
		return nil, err
	}

	cfg := new(Config)
	// Parsing konfigurasi dari env variables
	err = env.Parse(cfg)
	if err != nil {
		return nil, err
	}

	return cfg, nil
}