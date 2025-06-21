package service

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/entity"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/http/dto"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/internal/repository"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/cache"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/mailer"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/pkg/token"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/utils"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	GetAll(ctx context.Context, req dto.GetAllUserRequest) ([]entity.User, int64, error)
	GetById(ctx context.Context, id int64) (*entity.User, error)
	Login(ctx context.Context, email, password string) (string, error)
	Register(ctx context.Context, req dto.UserRegisterRequest) error
	Update(ctx context.Context, req dto.UpdateUserRequest) error
	Delete(ctx context.Context, user *entity.User) error
	VerifyEmail(ctx context.Context, req dto.VerifyEmailRequest) error
	RequestResetPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, req dto.ResetPasswordRequest) error
}

type userService struct {
	userRepository repository.UserRepository
	tokenUseCase   token.TokenUseCase
	cacheable      cache.Cacheable
	mailer         *mailer.Mailer
	cfg            *configs.Config
}

func NewUserService(
	userRepository repository.UserRepository,
	tokenUseCase token.TokenUseCase,
	cacheable cache.Cacheable,
	cfg *configs.Config,
	mailer *mailer.Mailer,
) UserService {
	return &userService{userRepository, tokenUseCase, cacheable, mailer, cfg}
}

func (s *userService) Login(ctx context.Context, email string, password string) (string, error) {
	user, err := s.userRepository.GetByEmail(ctx, email)
	if err != nil {
		return "", errors.New("Email atau password salah")
	}

	if bcryptErr := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); bcryptErr != nil {
		return "", errors.New("Email atau password salah")
	}

	if user.IsVerified == 0 {
		return "", errors.New("Silahkan verifikasi email terlebih dahulu")
	}

	expiredTime := time.Now().Add(time.Minute * 10)

	claims := token.JwtCustomClaims{
		Id:    user.Id,
		Email: user.Email,
		Name:  user.Name,
		Role:  user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "Darah Connect",
			ExpiresAt: jwt.NewNumericDate(expiredTime),
		},
	}

	token, err := s.tokenUseCase.GenerateAccessToken(claims)
	if err != nil {
		return "", errors.New("ada kesalahan di server")
	}

	return token, nil
}

func (s *userService) Register(ctx context.Context, req dto.UserRegisterRequest) error {
	exist, err := s.userRepository.GetByEmail(ctx, req.Email)
	if err == nil && exist != nil {
		return errors.New("Email sudah digunakan")
	}

	user := new(entity.User)
	user.Email = req.Email
	user.Name = req.Name
	user.Gender = req.Gender
	user.Phone = req.Phone
	user.BloodType = req.BloodType
	user.BirthDate = req.BirthDate
	user.Address = req.Address
	user.Role = "User"
	user.VerifyEmailToken = utils.RandomString(16)
	user.IsVerified = 0

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("ada kesalahan di server")
	}

	user.Password = string(hashedPassword)

	// Prepare email data
	emailData := mailer.EmailData{
		To:      user.Email,
		Subject: "Darah Connect : Verifikasi Email!",
		Template: "verify-email.html",
		Data: struct {
			Token string
		}{
			Token: user.VerifyEmailToken,
		},
	}

	// Create user in database
	if err = s.userRepository.Create(ctx, user); err != nil {
		return errors.New("gagal membuat user")
	}

	// Send verification email
	// Coba beberapa kemungkinan path untuk template
	workingDir, _ := os.Getwd()
	log.Printf("Working directory: %s", workingDir)

	// Gunakan path relatif terhadap root project
	templatePath := "templates/email/verify-email.html"
	log.Printf("Mencoba mengirim email verifikasi ke %s menggunakan template: %s", user.Email, templatePath)

	if Senderr := s.mailer.SendEmail(templatePath, emailData); Senderr != nil {
		// Log error untuk debugging
		log.Printf("Gagal mengirim email verifikasi: %v", Senderr)
		// Pengguna sudah dibuat, jadi kita tidak perlu mengembalikan error yang menggagalkan seluruh proses registrasi
		log.Printf("Pengguna berhasil dibuat tetapi email verifikasi gagal dikirim: %v", Senderr)
		return nil
	}

	log.Printf("Email verifikasi berhasil dikirim ke: %s", user.Email)

	// Create user in database
	if err = s.userRepository.Create(ctx, user); err != nil {
		return errors.New("gagal membuat user")
	}
	
	return nil
}

func (s *userService) GetAll(ctx context.Context, req dto.GetAllUserRequest) ([]entity.User, int64, error) {
	users, total, err := s.userRepository.GetAll(ctx, req)
	if err != nil {
		return nil, 0, errors.New("gagal mendapatkan data user")
	}
	return users, total, nil
}

func (s *userService) GetById(ctx context.Context, id int64) (*entity.User, error) {
	return s.userRepository.GetById(ctx, id)
}

func (s *userService) Update(ctx context.Context, req dto.UpdateUserRequest) error {
	user, err := s.userRepository.GetById(ctx, req.Id)
	if err != nil {
		return err
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	}
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Gender != "" {
		user.Gender = req.Gender
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.BloodType != "" {
		user.BloodType = req.BloodType
	}
	if req.Address != "" {
		user.Address = req.Address
	}
	if req.BirthDate != "" {
		birthDate, err := time.Parse("2006-01-02", req.BirthDate)
		if err != nil {
			return err
		}
		user.BirthDate = birthDate
	}
	return s.userRepository.Update(ctx, user)
}

func (s *userService) Delete(ctx context.Context, user *entity.User) error {
	return s.userRepository.Delete(ctx, user)
}

func (s *userService) ResetPassword(ctx context.Context, req dto.ResetPasswordRequest) error {
	user, err := s.userRepository.GetByResetPasswordToken(ctx, req.Token)
	if err != nil {
		return errors.New("Token reset password salah")
	}

	if req.Password == "" {
		return errors.New("Password tidak boleh kosong")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)
	return s.userRepository.Update(ctx, user)
}

func (s *userService) RequestResetPassword(ctx context.Context, email string) error {
	user, err := s.userRepository.GetByEmail(ctx, email)
	if err != nil {
		return errors.New("Email tersebut tidak ditemukan")
	}

	expiredTime := time.Now().Add(10 * time.Minute)

	claims := token.ResetPasswordClaims{
		Email: user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiredTime),
			Issuer:    "Reset Password",
		},
	}

	token, err := s.tokenUseCase.GenerateAccessToken(claims)
	if err != nil {
		return errors.New("ada kesalahan di server")
	}

	user.ResetPasswordToken = token
	err = s.userRepository.Update(ctx, user)
	if err != nil {
		return err
	}

	// Prepare email data
	emailData := mailer.EmailData{
		To:      user.Email,
		Subject: "Darah Connect : Reset Password!",
		Template: "reset-password.html",
		Data: struct {
			Token string
		}{
			Token: user.ResetPasswordToken,
		},
	}

	// Send reset password email
	if err := s.mailer.SendEmail("./templates/email/reset-password.html", emailData); err != nil {
		log.Printf("Gagal mengirim email reset password: %v", err)
		return errors.New("gagal mengirim reset password")
	}

	return nil
}

func (s *userService) VerifyEmail(ctx context.Context, req dto.VerifyEmailRequest) error {
	user, err := s.userRepository.GetByVerifyEmailToken(ctx, req.Token)
	if err != nil {
		return errors.New("Token verifikasi email salah")
	}
	user.IsVerified = 1
	return s.userRepository.Update(ctx, user)
}

// func (s *userService) GetAll(ctx context.Context) (result []entity.User, err error) {
// 	keyFindAll := "github.com/mhusainh/DarahConnect/DarahConnectAPI-api:users:find-all"
// 	data := s.cacheable.Get(keyFindAll)
// 	if data == "" {
// 		result, err = s.userRepository.GetAll(ctx)
// 		if err != nil {
// 			return nil, err
// 		}

// 		marshalledData, err := json.Marshal(result)
// 		if err != nil {
// 			return nil, err
// 		}

// 		err = s.cacheable.Set(keyFindAll, marshalledData, 5*time.Minute)
// 		if err != nil {
// 			return nil, err
// 		}
// 	} else {
// 		err = json.Unmarshal([]byte(data), &result)
// 		if err != nil {
// 			return nil, err
// 		}
// 	}

// 	return result, nil
// }
