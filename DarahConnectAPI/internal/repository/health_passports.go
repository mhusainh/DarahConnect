package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type HealthPassportRepository interface {
	Create(ctx context.Context, healthPassport *entity.HealthPassport) error
	GetById(ctx context.Context, id int64) (*entity.HealthPassport, error)
	GetAll(ctx context.Context) ([]entity.HealthPassport, error)
	Update(ctx context.Context, healthPassport *entity.HealthPassport) error
	Delete(ctx context.Context, healthPassport *entity.HealthPassport) error
}

type healthPassportRepository struct {
	db *gorm.DB
}

func NewHealthPassportRepository(db *gorm.DB) HealthPassportRepository {
	return &healthPassportRepository{db}
}

func (r *healthPassportRepository) Create(ctx context.Context, healthPassport *entity.HealthPassport) error {
	return r.db.WithContext(ctx).Create(healthPassport).Error
}

func (r *healthPassportRepository) GetById(ctx context.Context, id int64) (*entity.HealthPassport, error) {
	result := new(entity.HealthPassport)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *healthPassportRepository) GetAll(ctx context.Context) ([]entity.HealthPassport, error) {
	result := make([]entity.HealthPassport, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *healthPassportRepository) Update(ctx context.Context, healthPassport *entity.HealthPassport) error {
	return r.db.WithContext(ctx).Model(healthPassport).Updates(healthPassport).Error
}

func (r *healthPassportRepository) Delete(ctx context.Context, healthPassport *entity.HealthPassport) error {
	return r.db.WithContext(ctx).Delete(healthPassport).Error
}