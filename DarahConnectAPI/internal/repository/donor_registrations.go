package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type DonorRegistrationRepository interface {
	Create(ctx context.Context, donorRegistration *entity.DonorRegistration) error
	GetById(ctx context.Context, id int64) (*entity.DonorRegistration, error)
	GetAll(ctx context.Context) ([]entity.DonorRegistration, error)
	Update(ctx context.Context, donorRegistration *entity.DonorRegistration) error
	Delete(ctx context.Context, donorRegistration *entity.DonorRegistration) error
}

type donorRegistrationRepository struct {
	db *gorm.DB
}

func NewDonorRegistrationRepository(db *gorm.DB) DonorRegistrationRepository {
	return &donorRegistrationRepository{db}
}

func (r *donorRegistrationRepository) Create(ctx context.Context, donorRegistration *entity.DonorRegistration) error {
	return r.db.WithContext(ctx).Create(donorRegistration).Error
}

func (r *donorRegistrationRepository) GetById(ctx context.Context, id int64) (*entity.DonorRegistration, error) {
	result := new(entity.DonorRegistration)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *donorRegistrationRepository) GetAll(ctx context.Context) ([]entity.DonorRegistration, error) {
	result := make([]entity.DonorRegistration, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *donorRegistrationRepository) Update(ctx context.Context, donorRegistration *entity.DonorRegistration) error {
	return r.db.WithContext(ctx).Model(donorRegistration).Updates(donorRegistration).Error
}

func (r *donorRegistrationRepository) Delete(ctx context.Context, donorRegistration *entity.DonorRegistration) error {
	return r.db.WithContext(ctx).Delete(donorRegistration).Error
}