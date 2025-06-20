package dto

type DonorRegistrationCreateRequest struct {
	UserId       int64  `json:"user_id" validate:"required"`
	ScheduleId   int64  `json:"schedule_id" validate:"required"`
	Notes       string `json:"notes"` // Additional notes for the registration
}

type DonorRegistrationUpdateRequest struct {
	Id           int64  `param:"id" validate:"required"`
	UserId       int64  `json:"user_id"`
	ScheduleId   int64  `json:"schedule_id"`
	Status       string `json:"status"` // e.g., "pending", "approved", "rejected"
	Notes       string `json:"notes"` // Additional notes for the registration
}