package cloudinary

import (
	"context"
	"errors"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
)

// Service adalah struct untuk layanan Cloudinary
type Service struct {
	cld *cloudinary.Cloudinary
}

// NewService membuat instance baru dari Service Cloudinary
// NewService membuat instance baru dari Service Cloudinary
func NewService(config *configs.CloudinaryConfig) (*Service, error) {
    // Inisialisasi Cloudinary dari konfigurasi
    cld, err := cloudinary.NewFromParams(config.CloudName, config.APIKey, config.APISecret)
    if err != nil {
        return nil, err
    }

    // Mengatur konfigurasi untuk menggunakan HTTPS
    cld.Config.URL.Secure = true

    return &Service{cld: cld}, nil
}

// UploadFile mengunggah file ke Cloudinary
// Menerima file multipart, dan folder tujuan
// Mengembalikan URL gambar dan public ID jika berhasil
func (s *Service) UploadFile(fileHeader *multipart.FileHeader, folder string) (string, string, error) {
	// Validasi tipe file (hanya menerima gambar)
	if !isImageFile(fileHeader.Filename) {
		return "", "", errors.New("only image files are allowed")
	}

	// Buka file
	file, err := fileHeader.Open()
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	// Set folder default jika tidak disediakan
	if folder == "" {
		folder = "darahconnect"
	}

	ctx := context.Background()

	// Upload file ke Cloudinary
	result, err := s.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:         "darahconnect/" + folder,
		UniqueFilename: api.Bool(true),
		Overwrite:      api.Bool(true),
	})

	if err != nil {
		return "", "", err
	}

	return result.SecureURL, result.PublicID, nil
}

// DeleteFile menghapus file dari Cloudinary berdasarkan public ID
func (s *Service) DeleteFile(publicID string) error {
	ctx := context.Background()

	// Hapus file dari Cloudinary
	_, err := s.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	return err
}

// isImageFile memeriksa apakah file adalah gambar berdasarkan ekstensi
func isImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
		".bmp":  true,
	}

	return validExts[ext]
}