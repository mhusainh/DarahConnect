package repository

import (
	"context"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"

	"gorm.io/gorm"
)

type CertificateRepository interface {
	Create(ctx context.Context, certificate *entity.Certificate) error
	GetById(ctx context.Context, id int64) (*entity.Certificate, error)
	GetAll(ctx context.Context) ([]entity.Certificate, error)
	Update(ctx context.Context, certificate *entity.Certificate) error
	Delete(ctx context.Context, certificate *entity.Certificate) error
}

type certificateRepository struct {
	db *gorm.DB
}

func NewCertificateRepository(db *gorm.DB) CertificateRepository {
	return &certificateRepository{db}
}

func (r *certificateRepository) Create(ctx context.Context, certificate *entity.Certificate) error {
	return r.db.WithContext(ctx).Create(certificate).Error
}

func (r *certificateRepository) GetById(ctx context.Context, id int64) (*entity.Certificate, error) {
	result := new(entity.Certificate)
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *certificateRepository) GetAll(ctx context.Context) ([]entity.Certificate, error) {
	result := make([]entity.Certificate, 0)
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (r *certificateRepository) Update(ctx context.Context, certificate *entity.Certificate) error {
	return r.db.WithContext(ctx).Model(certificate).Updates(certificate).Error
}

func (r *certificateRepository) Delete(ctx context.Context, certificate *entity.Certificate) error {
	return r.db.WithContext(ctx).Delete(certificate).Error
}