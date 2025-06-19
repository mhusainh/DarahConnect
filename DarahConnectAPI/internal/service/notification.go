package service

import (
	"context"
	"errors"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
)

type NotificationService interface {
	Create(ctx context.Context, req dto.NotificationCreateRequest) error
	GetById(ctx context.Context, id int64) (*entity.Notification, error)
	GetAll(ctx context.Context) ([]entity.Notification, error)
	Update(ctx context.Context, req dto.NotificationUpdateRequest) error
	Delete(ctx context.Context, id int64) error
	GetByUserId(ctx context.Context, userId int64) (*entity.Notification, error)
	GetUnreadCountByUserId(ctx context.Context, userId int64) (int64, error)
}

type notificationService struct {
	notificationRepository repository.NotificationRepository
}

func NewNotificationService(notificationRepository repository.NotificationRepository,
) NotificationService {
	return &notificationService{notificationRepository}
}

func (s *notificationService) GetAll(ctx context.Context) ([]entity.Notification, error) {
	notifications, err := s.notificationRepository.GetAll(ctx)
	if err != nil {
		return nil, errors.New("Gagal mendapatkan daftar notifikasi")
	}
	return notifications, nil
}

func (s *notificationService) GetById(ctx context.Context, id int64) (*entity.Notification, error) {
	notification, err := s.notificationRepository.GetById(ctx, id)
	if err != nil {
		return nil, errors.New("Notifikasi tidak ditemukan")
	}
	return notification, nil
}

func (s *notificationService) GetByUserId(ctx context.Context, userId int64) (*entity.Notification, error) {
	notification, err := s.notificationRepository.GetByUserId(ctx, userId)
	if err != nil {
		return nil, errors.New("Notifikasi tidak ditemukan untuk pengguna ini")
	}
	return notification, nil
}

func (s *notificationService) GetUnreadCountByUserId(ctx context.Context, userId int64) (int64, error) {
	count, err := s.notificationRepository.GetUnreadCountByUserId(ctx, userId)
	if err != nil {
		return 0, errors.New("Gagal mendapatkan jumlah notifikasi belum dibaca")
	}
	return count, nil
}

func (s *notificationService) Create(ctx context.Context, req dto.NotificationCreateRequest) error {
	notification := new(entity.Notification)
	notification.UserId = req.UserId
	notification.Title = req.Title
	notification.Message = req.Message
	notification.NotificationType = req.NotificationType
	notification.IsRead = false // Default to unread
	
	if err := s.notificationRepository.Create(ctx, notification); err != nil {
		return errors.New("Notifikasi gagal dibuat")
	}
	return nil
}

func (s *notificationService) Update(ctx context.Context, req dto.NotificationUpdateRequest) error {
	_, err := s.notificationRepository.GetById(ctx, req.Id)
	if err != nil {
		return errors.New("Notifikasi tidak ditemukan")
	}

	if err := s.notificationRepository.Update(ctx, &entity.Notification{
		Id:               req.Id,
		UserId:           req.UserId,
		Title:            req.Title,
		Message:          req.Message,
		NotificationType: req.NotificationType,
		IsRead:           req.IsRead,
	}); err != nil {
		return errors.New("Notifikasi gagal diperbarui")
	}
	return nil
}

func (s *notificationService) Delete(ctx context.Context, id int64) error {
	notification, err := s.notificationRepository.GetById(ctx, id)
	if err != nil {
		return errors.New("Notifikasi tidak ditemukan")
	}

	if err := s.notificationRepository.Delete(ctx, notification); err != nil {
		return errors.New("Notifikasi gagal dihapus")
	}
	return nil
}