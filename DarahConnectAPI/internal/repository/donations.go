package repository

import (
	"context"
	"strings"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"

	"gorm.io/gorm"
)

type DonationsRepository interface {
	Create(ctx context.Context, donation *entity.Donation) error
	Update(ctx context.Context, orderId int64, donation *entity.Donation) error		
	GetById(ctx context.Context, id int64) (*entity.Donation, error)
	GetAllDonation(ctx context.Context, req dto.GetAllDonation) ([]entity.Donation, int64, error)
}

type donationsRepository struct {
	db *gorm.DB
}

func NewDonationsRepository(db *gorm.DB) DonationsRepository {
	return &donationsRepository{db}
}

func (r *donationsRepository) applyFilters(query *gorm.DB, req dto.GetAllDonation) (*gorm.DB, dto.GetAllDonation) {
	// Filter berdasarkan OrderId
	if req.OrderId != "" {
		query = query.Where("order_id = ?", req.OrderId)
	}
	// Filter berdasarkan Status
	if req.Status != "" {
		query = query.Where("LOWER(status) = ?", req.Status)
	}
	if req.Search != "" {
		search := strings.ToLower(req.Search)
		query = query.Joins("LEFT JOIN users ON users.id = donations.user_id").
			Where("LOWER(users.name) LIKE ?",
				"%"+search+"%")
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

func (r *donationsRepository) Create(ctx context.Context, donation *entity.Donation) error {
	return r.db.WithContext(ctx).Create(donation).Error
}

func (r *donationsRepository) GetById(ctx context.Context, id int64) (*entity.Donation, error) {
	result := new(entity.Donation)
	if err := r.db.WithContext(ctx).Where("id = ?", id).Preload("User").First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *donationsRepository) GetAllDonation(ctx context.Context, req dto.GetAllDonation) ([]entity.Donation, int64, error) {
	donations := make([]entity.Donation, 0)
	var total int64

	dataQuery := r.db.WithContext(ctx).Model(&entity.Donation{}).Preload("User")
	dataQuery, req = r.applyFilters(dataQuery, req)
	if err := dataQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	offset := (req.Page - 1) * req.Limit
	dataQuery = dataQuery.Limit(int(req.Limit)).Offset(int(offset))

	if err := dataQuery.Find(&donations).Error; err != nil {
		return nil, 0, err
	}

	return donations, total, nil
}


func (r *donationsRepository) Update(ctx context.Context, orderId int64, donation *entity.Donation) error {
	return r.db.WithContext(ctx).Where("order_id = ?", orderId).Model(donation).Updates(donation).Error
}
