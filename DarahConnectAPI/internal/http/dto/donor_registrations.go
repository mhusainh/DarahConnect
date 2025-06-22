package dto

type DonorRegistrationCreateRequest struct {
	UserId     int64  `json:"user_id" validate:"required"`
	ScheduleId int64  `json:"schedule_id" validate:"required"`
	Notes      string `json:"notes"` // Additional notes for the registration
}

type DonorRegistrationUpdateRequest struct {
	Id     int64  `param:"id" validate:"required"`
	Status string `json:"status"` //'Registered', 'Completed', 'Cancelled', 'No-show'
	Notes  string `json:"notes"`  // Additional notes for the registration
}

type DonorRegistrationByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type DonorRegistrationByUserIdRequest struct {
	UserId int64 `param:"user_id" validate:"required"`
}

type DonorRegistrationByScheduleIdRequest struct {
	ScheduleId int64 `param:"schedule_id" validate:"required"`
}

type GetAllDonorRegistrationRequest struct {
	Page           int64  `query:"page"`
	Limit          int64  `query:"limit"`
	Search         string `query:"search"`
	Sort           string `query:"sort"`
	Order          string `query:"order"`
	Status         string `query:"status"`
	StartDate      string `query:"start_date"`
	EndDate        string `query:"end_date"`
}