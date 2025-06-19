package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type HospitalRepository interface {
	Create(ctx context.Context, hospital *entity.Hospital) error
	GetById(ctx context.Context, id int64) (*entity.Hospital, error)
	GetAll(ctx context.Context) ([]entity.Hospital, error)
	Update(ctx context.Context, hospital *entity.Hospital) error
	Delete(ctx context.Context, hospital *entity.Hospital) error
}

type hospitalRepository struct {
	db *gorm.DB
}

func NewHospitalRepository(db *gorm.DB) HospitalRepository {
	return &hospitalRepository{db}
}

func (r *hospitalRepository) Create(ctx context.Context, hospital *entity.Hospital) error {
	return r.db.WithContext(ctx).Create(&hospital).Error
}

func (r *hospitalRepository) GetById(ctx context.Context, id int64) (*entity.Hospital, error) {
	result := new(entity.Hospital)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *hospitalRepository) GetAll(ctx context.Context) ([]entity.Hospital, error) {
	result := make([]entity.Hospital, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *hospitalRepository) Update(ctx context.Context, hospital *entity.Hospital) error {
	return r.db.WithContext(ctx).Model(hospital).Updates(hospital).Error
}

func (r *hospitalRepository) Delete(ctx context.Context, hospital *entity.Hospital) error {
	return r.db.WithContext(ctx).Delete(hospital).Error
}