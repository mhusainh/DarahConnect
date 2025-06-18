package cloudinary

import (
	"context"
	"mime/multipart"

	"github.com/DarahConnect/DarahConnectAPI/configs"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type Service struct {
	cld *cloudinary.Cloudinary
	ctx context.Context
}

func NewService(cfg *configs.CloudinaryConfig) (*Service, error) {
	cld, err := cloudinary.NewFromParams(cfg.CloudName, cfg.APIKey, cfg.APISecret)
	if err != nil {
		return nil, err
	}

	ctx := context.Background()

	return &Service{
		cld: cld,
		ctx: ctx,
	}, nil
}

func (s *Service) UploadFile(fileHeader *multipart.FileHeader) (*uploader.UploadResult, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	uploadResult, err := s.cld.Upload.Upload(
		s.ctx,
		file,
		uploader.UploadParams{})
	if err != nil {
		return nil, err
	}

	return uploadResult, nil
}
