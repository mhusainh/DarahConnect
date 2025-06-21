package repository

import (
	"context"
	"strings"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"

	"gorm.io/gorm"
)

type DonorScheduleRepository interface {
	Create(ctx context.Context, donorSchedule *entity.DonorSchedule) error
	GetById(ctx context.Context, id int64) (*entity.DonorSchedule, error)
	GetAll(ctx context.Context, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error)
	GetByHospitalId(ctx context.Context, hospitalId int64, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error)
	Update(ctx context.Context, donorSchedule *entity.DonorSchedule) error
	Delete(ctx context.Context, donorSchedule *entity.DonorSchedule) error
}

type donorScheduleRepository struct {
	db *gorm.DB
}

func NewDonorScheduleRepository(db *gorm.DB) DonorScheduleRepository {
	return &donorScheduleRepository{db}
}

func (r *donorScheduleRepository) applyFilters(query *gorm.DB, req dto.GetAllDonorScheduleRequest) (*gorm.DB, dto.GetAllDonorScheduleRequest) {
	// Filter berdasarkan EventDate
	if req.EventDate != "" {
		query = query.Where("event_date = ?", req.EventDate)
	}
	if req.StartTime != "" && req.EndTime != "" {
		query = query.Where("start_time BETWEEN ? AND ?", req.StartTime, req.EndTime)
	}
	if req.SlotsAvailable != nil {
		if *req.SlotsAvailable {
			query = query.Where("slots_available > ?", 0)
		} else {
			query = query.Where("slots_available = ?", 0)
		}
	}
	if req.Status != "" {
		query = query.Where("LOWER(status) = ?", req.Status)
	}

	// Filter berdasarkan Search (pada judul atau pesan)
	if req.Search != "" {
		search := strings.ToLower(req.Search)
		query = query.Where("LOWER(event_name) LIKE ?", "%"+search+"%").
			Or("LOWER(description) LIKE ?", "%"+search+"%")
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

func (r *donorScheduleRepository) GetAll(ctx context.Context, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error) {
	var donorSchedule []entity.DonorSchedule
	var total int64

	// Hitung total item sebelum pagination
	dataQuery := r.db.WithContext(ctx).Model(&entity.DonorSchedule{})
	dataQuery, req = r.applyFilters(dataQuery, req)
	if err := dataQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (req.Page - 1) * req.Limit
	dataQuery = dataQuery.Limit(int(req.Limit)).Offset(int(offset))

	if err := dataQuery.Find(&donorSchedule).Error; err != nil {
		return nil, 0, err
	}

	return donorSchedule, total, nil
}

func (r *donorScheduleRepository) GetByHospitalId(ctx context.Context, hospitalId int64, req dto.GetAllDonorScheduleRequest) ([]entity.DonorSchedule, int64, error) {
	var donorSchedule []entity.DonorSchedule
	var total int64

	// Hitung total item sebelum pagination
	dataQuery := r.db.WithContext(ctx).Model(&entity.DonorSchedule{}).Where("hospital_id = ?", hospitalId)
	dataQuery, req = r.applyFilters(dataQuery, req)
	if err := dataQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Pagination
	offset := (req.Page - 1) * req.Limit
	dataQuery = dataQuery.Limit(int(req.Limit)).Offset(int(offset))

	if err := dataQuery.Find(&donorSchedule).Error; err != nil {
		return nil, 0, err
	}

	return donorSchedule, total, nil
}

func (r *donorScheduleRepository) Update(ctx context.Context, donorSchedule *entity.DonorSchedule) error {
	return r.db.WithContext(ctx).Model(donorSchedule).Updates(donorSchedule).Error
}

func (r *donorScheduleRepository) Delete(ctx context.Context, donorSchedule *entity.DonorSchedule) error {
	return r.db.WithContext(ctx).Delete(donorSchedule).Error
}
