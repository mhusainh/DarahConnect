package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type BloodDonationRepository interface {
	Create(ctx context.Context, bloodDonation *entity.BloodDonation) error
	GetById(ctx context.Context, id int64) (*entity.BloodDonation, error)
	GetAll(ctx context.Context) ([]entity.BloodDonation, error)
	Update(ctx context.Context, bloodDonation *entity.BloodDonation) error
	Delete(ctx context.Context, bloodDonation *entity.BloodDonation) error
}

type bloodDonationRepository struct {
	db *gorm.DB
}

func NewBloodDonationRepository(db *gorm.DB) BloodDonationRepository {
	return &bloodDonationRepository{db}
}

func (r *bloodDonationRepository) Create(ctx context.Context, bloodDonation *entity.BloodDonation) error {
	return r.db.WithContext(ctx).Create(bloodDonation).Error
}

func (r *bloodDonationRepository) GetById(ctx context.Context, id int64) (*entity.BloodDonation, error) {
	result := new(entity.BloodDonation)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *bloodDonationRepository) GetAll(ctx context.Context) ([]entity.BloodDonation, error) {
	result := make([]entity.BloodDonation, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *bloodDonationRepository) Update(ctx context.Context, bloodDonation *entity.BloodDonation) error {
	return r.db.WithContext(ctx).Model(bloodDonation).Updates(bloodDonation).Error
}

func (r *bloodDonationRepository) Delete(ctx context.Context, bloodDonation *entity.BloodDonation) error {
	return r.db.WithContext(ctx).Delete(bloodDonation).Error
}