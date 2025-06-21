package dto

import (
	"time"
)

type UserLoginRequest struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UserRegisterRequest struct {
	Name      string    `json:"name" validate:"required"`
	Gender    string    `json:"gender" validate:"required"`
	Email     string    `json:"email" validate:"required"`
	Password  string    `json:"password" validate:"required"`
	Phone     string    `json:"phone" validate:"required"`
	BloodType string    `json:"blood_type" validate:"required"`
	BirthDate time.Time `json:"birth_date" validate:"required"`
	Address   string    `json:"address" validate:"required"`
}

type UpdateUserRequest struct {
	Id        int64  `param:"id"`
	Name      string `json:"name" form:"name"`
	Gender    string `json:"gender" form:"gender"`
	Email     string `json:"email" form:"email"`
	Password  string `json:"password" form:"password"`
	Phone     string `json:"phone" form:"phone"`
	BloodType string `json:"blood_type" form:"blood_type"`
	BirthDate string `json:"birth_date" form:"birth_date"`
	Address   string `json:"address" form:"address"`
	PublicId  string `json:"public_id" form:"public_id"`
	UrlFile   string `json:"url_file" form:"url_file"`
}

type UpdateImageUserRequest struct {
	// Untuk file upload, kita tidak menggunakan json tag karena file akan dikirim melalui multipart/form-data
	// Field ini hanya digunakan sebagai referensi nama field di form
	Image string `form:"image"`
}
type DeleteUserRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type GetUserByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type GetUserByIdByUserRequest struct {
	Id     int64  `param:"id" validate:"required"`
	Name   string `json:"name" validate:"required"`
	Gender string `json:"gender" validate:"required"`
	Email  string `json:"email" validate:"required"`
}

type ResetPasswordRequest struct {
	Token    string `param:"token" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RequestResetPassword struct {
	Email string `json:"email" validate:"required"`
}

type VerifyEmailRequest struct {
	Token string `param:"token" validate:"required"`
}

type GetAllUserRequest struct {
	Page      int64  `query:"page" `
	Limit     int64  `query:"limit" `
	Search    string `query:"search"`
	Sort      string `query:"sort"`
	Order     string `query:"order"`
	BloodType string `query:"blood_type"`
}