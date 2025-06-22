package entity

import "time"

type DonorRegistration struct {
	Id         int64         `json:"id"`
	UserId     int64         `json:"user_id"`
	User       User          `json:"user" gorm:"foreignKey:UserId;references:Id"`
	ScheduleId int64         `json:"schedule_id"`
	Schedule   DonorSchedule `json:"schedule" gorm:"foreignKey:ScheduleId;references:Id"`
	Status     string        `json:"status"` // e.g., "pending", "approved", "rejected"
	Notes      string        `json:"notes"`  // Additional notes for the registration
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
}

func (DonorRegistration) TableName() string {
	return "public.donor_registrations"
}
