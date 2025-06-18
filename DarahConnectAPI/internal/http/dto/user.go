package dto

import "time"

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
	Id        int64  `param:"id" validate:"required"`
	Name      string `json:"name" validate:"required"`
	Gender    string `json:"gender" validate:"required"`
	Email     string `json:"email" validate:"required"`
	Password  string `json:"password" validate:"required"`
	Phone     string `json:"phone" validate:"required"`
	BloodType string `json:"blood_type" validate:"required"`
	BirthDate string `json:"birth_date" validate:"required"`
	Address   string `json:"address" validate:"required"`
	Image     string `json:"image" validate:"required"`
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
