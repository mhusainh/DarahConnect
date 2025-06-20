package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type BloodRequestRepository interface {
	Create(ctx context.Context, bloodRequest *entity.BloodRequest) error
	GetById(ctx context.Context, id int64) (*entity.BloodRequest, error)
	GetAll(ctx context.Context) ([]entity.BloodRequest, error)
	Update(ctx context.Context, bloodRequest *entity.BloodRequest) error
	Delete(ctx context.Context, bloodRequest *entity.BloodRequest) error
}

type bloodRequestRepository struct {
	db *gorm.DB
}

func NewBloodRequestRepository(db *gorm.DB) BloodRequestRepository {
	return &bloodRequestRepository{db}
}

func (r *bloodRequestRepository) Create(ctx context.Context, bloodRequest *entity.BloodRequest) error {
	return r.db.WithContext(ctx).Create(bloodRequest).Error
}

func (r *bloodRequestRepository) GetById(ctx context.Context, id int64) (*entity.BloodRequest, error) {
	result := new(entity.BloodRequest)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *bloodRequestRepository) GetAll(ctx context.Context) ([]entity.BloodRequest, error) {
	result := make([]entity.BloodRequest, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *bloodRequestRepository) Update(ctx context.Context, bloodRequest *entity.BloodRequest) error {
	return r.db.WithContext(ctx).Model(bloodRequest).Updates(bloodRequest).Error
}

func (r *bloodRequestRepository) Delete(ctx context.Context, bloodRequest *entity.BloodRequest) error {
	return r.db.WithContext(ctx).Delete(bloodRequest).Error
}