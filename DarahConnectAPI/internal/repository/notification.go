package repository

import (
	"context"
	

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type NotificationRepository interface {
	Create(ctx context.Context, notification *entity.Notification) error
	GetById(ctx context.Context, id int64) (*entity.Notification, error)
	GetAll(ctx context.Context) ([]entity.Notification, error)
	Update(ctx context.Context, notification *entity.Notification) error
	Delete(ctx context.Context, notification *entity.Notification) error
	GetByUserId(ctx context.Context, userId int64) (*entity.Notification, error)
	GetUnreadCountByUserId(ctx context.Context, userId int64) (int64, error)
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db}
}

func (r *notificationRepository) Create(ctx context.Context, notification *entity.Notification) error {
	return r.db.WithContext(ctx).Create(notification).Error
}

func (r *notificationRepository) GetAll(ctx context.Context) ([]entity.Notification, error) {
	result := make([]entity.Notification, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *notificationRepository) GetById(ctx context.Context, id int64) (*entity.Notification, error) {
	result := new(entity.Notification)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *notificationRepository) Update(ctx context.Context, notification *entity.Notification) error {
	return r.db.WithContext(ctx).Model(notification).Updates(notification).Error
}

func (r *notificationRepository) Delete(ctx context.Context, notification *entity.Notification) error {
	return r.db.WithContext(ctx).Delete(notification).Error
}

func (r *notificationRepository) GetByUserId(ctx context.Context, userId int64) (*entity.Notification, error) {
	result := new(entity.Notification)
	if err := r.db.WithContext(ctx).Where("user_id = ?", userId).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *notificationRepository) GetUnreadCountByUserId(ctx context.Context, userId int64) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&entity.Notification{}).Where("user_id = ? AND is_read = ?", userId, false).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}