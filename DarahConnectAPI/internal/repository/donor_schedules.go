package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type DonorScheduleRepository interface {
	Create(ctx context.Context, donorSchedule *entity.DonorSchedule) error
	GetById(ctx context.Context, id int64) (*entity.DonorSchedule, error)
	GetAll(ctx context.Context) ([]entity.DonorSchedule, error)
	Update(ctx context.Context, donorSchedule *entity.DonorSchedule) error
	Delete(ctx context.Context, donorSchedule *entity.DonorSchedule) error
}

type donorScheduleRepository struct {
	db *gorm.DB
}

func NewDonorScheduleRepository(db *gorm.DB) DonorScheduleRepository {
	return &donorScheduleRepository{db}
}

func (r *donorScheduleRepository) Create(ctx context.Context, donorSchedule *entity.DonorSchedule) error {
	return r.db.WithContext(ctx).Create(donorSchedule).Error
}

func (r *donorScheduleRepository) GetById(ctx context.Context, id int64) (*entity.DonorSchedule, error) {
	result := new(entity.DonorSchedule)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *donorScheduleRepository) GetAll(ctx context.Context) ([]entity.DonorSchedule, error) {
	result := make([]entity.DonorSchedule, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *donorScheduleRepository) Update(ctx context.Context, donorSchedule *entity.DonorSchedule) error {
	return r.db.WithContext(ctx).Model(donorSchedule).Updates(donorSchedule).Error
}

func (r *donorScheduleRepository) Delete(ctx context.Context, donorSchedule *entity.DonorSchedule) error {
	return r.db.WithContext(ctx).Delete(donorSchedule).Error
}