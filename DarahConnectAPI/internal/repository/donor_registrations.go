package repository

import (
	"context"
	"strings"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"

	"gorm.io/gorm"
)

type DonorRegistrationRepository interface {
	Create(ctx context.Context, donorRegistration *entity.DonorRegistration) error
	GetById(ctx context.Context, id int64) (*entity.DonorRegistration, error)
	GetAll(ctx context.Context, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, int64, error)
	GetAllByUserId(ctx context.Context, userId int64, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, int64, error)
	GetAllByScheduleId(ctx context.Context, scheduleId int64, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, int64, error)
	Update(ctx context.Context, donorRegistration *entity.DonorRegistration) error
	Delete(ctx context.Context, donorRegistration *entity.DonorRegistration) error
}

type donorRegistrationRepository struct {
	db *gorm.DB
}

func NewDonorRegistrationRepository(db *gorm.DB) DonorRegistrationRepository {
	return &donorRegistrationRepository{db}
}

func (r *donorRegistrationRepository) applyFilters(query *gorm.DB, req dto.GetAllDonorRegistrationRequest) (*gorm.DB, dto.GetAllDonorRegistrationRequest) {
	if req.Status != "" {
		query = query.Where("LOWER(status) = ?", req.Status)
	}

	// Filter berdasarkan tanggal event
	if req.StartDate != "" && req.EndDate != "" {
		query = query.Joins("LEFT JOIN donor_schedules ON donor_schedules.id = donor_registrations.schedule_id").
			Where("donor_schedules.event_date BETWEEN ? AND ?", req.StartDate, req.EndDate)
	}

	// Filter berdasarkan Search (pada nama user, catatan registrasi, atau nama event)
	if req.Search != "" {
		search := strings.ToLower(req.Search)
		query = query.Joins("LEFT JOIN users ON users.id = donor_registrations.user_id")
		
		// Jika belum ada JOIN dengan donor_schedules (karena tidak ada filter tanggal)
		if req.StartDate == "" && req.EndDate == "" {
			query = query.Joins("LEFT JOIN donor_schedules ON donor_schedules.id = donor_registrations.schedule_id")
		}
		
		query = query.Where("LOWER(users.name) LIKE ? OR LOWER(donor_registrations.notes) LIKE ? OR LOWER(donor_schedules.event_name) LIKE ?",
				"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Set default values jika tidak ada
	if req.Page <= 0 {
		req.Page = 1
	}

	if req.Limit <= 0 {
		req.Limit = 10
	}

	// Sorting
	sortBy := "created_at"
	if req.Sort != "" {
		sortBy = req.Sort
	}

	orderBy := "desc"
	if req.Order != "" {
		orderBy = req.Order
	}

	query = query.Order(sortBy + " " + orderBy)

	return query, req
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

func (r *donorRegistrationRepository) GetAll(ctx context.Context, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, int64, error) {
	var donorRegistration []entity.DonorRegistration
	var total int64

	// Hitung total item sebelum pagination
	dataQuery := r.db.WithContext(ctx).Model(&entity.DonorRegistration{}).Preload("User").Preload("Schedule")
	dataQuery, req = r.applyFilters(dataQuery, req)
	if err := dataQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (req.Page - 1) * req.Limit
	dataQuery = dataQuery.Limit(int(req.Limit)).Offset(int(offset))

	if err := dataQuery.Find(&donorRegistration).Error; err != nil {
		return nil, 0, err
	}

	return donorRegistration, total, nil
}

func (r *donorRegistrationRepository) GetAllByUserId(ctx context.Context, userId int64, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, int64, error) {
	var donorRegistration []entity.DonorRegistration
	var total int64

	dataQuery := r.db.WithContext(ctx).Model(&entity.DonorRegistration{}).Where("user_id = ?", userId).Preload("User").Preload("Schedule")
	dataQuery, req = r.applyFilters(dataQuery, req)
	if err := dataQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (req.Page - 1) * req.Limit
	dataQuery = dataQuery.Limit(int(req.Limit)).Offset(int(offset))

	if err := dataQuery.Find(&donorRegistration).Error; err != nil {
		return nil, 0, err
	}

	return donorRegistration, total, nil
}

func (r *donorRegistrationRepository) GetAllByScheduleId(ctx context.Context, scheduleId int64, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, int64, error) {
	var donorRegistration []entity.DonorRegistration
	var total int64

	dataQuery := r.db.WithContext(ctx).Model(&entity.DonorRegistration{}).Where("schedule_id = ?", scheduleId).Preload("User").Preload("Schedule")
	dataQuery, req = r.applyFilters(dataQuery, req)
	if err := dataQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (req.Page - 1) * req.Limit
	dataQuery = dataQuery.Limit(int(req.Limit)).Offset(int(offset))

	if err := dataQuery.Find(&donorRegistration).Error; err != nil {
		return nil, 0, err
	}

	return donorRegistration, total, nil
}

func (r *donorRegistrationRepository) GetByUserId(ctx context.Context, userId int64, req dto.GetAllDonorRegistrationRequest) ([]entity.DonorRegistration, error) {
	var donorRegistration []entity.DonorRegistration
	if err := r.db.WithContext(ctx).Where("user_id = ?", userId).Find(&donorRegistration).Error; err != nil {
		return nil, err
	}
	return donorRegistration, nil
}

func (r *donorRegistrationRepository) Update(ctx context.Context, donorRegistration *entity.DonorRegistration) error {
	return r.db.WithContext(ctx).Model(donorRegistration).Updates(donorRegistration).Error
}

func (r *donorRegistrationRepository) Delete(ctx context.Context, donorRegistration *entity.DonorRegistration) error {
	return r.db.WithContext(ctx).Delete(donorRegistration).Error
}
