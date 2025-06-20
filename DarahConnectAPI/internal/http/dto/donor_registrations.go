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
