package dto

import "time"

type DonorScheduleCreateRequest struct {
	HospitalId     int64     `json:"hospital_id" validate:"required"`
	EventName      string    `json:"event_name" validate:"required"`
	EventDate      time.Time `json:"event_date" validate:"required"`
	StartTime      time.Time `json:"start_time" validate:"required"`
	EndTime        time.Time `json:"end_time" validate:"required"`
	SlotsAvailable int       `json:"slots_available" validate:"required"`
	SlotsBooked    int       `json:"slots_booked" validate:"required"`
	Description    string    `json:"description" validate:"required"`
}

type DonorScheduleUpdateRequest struct {
	Id             int64     `param:"id" validate:"required"`
	EventName      string    `json:"event_name"`
	EventDate      time.Time `json:"event_date"`
	StartTime      time.Time `json:"start_time"`
	EndTime        time.Time `json:"end_time"`
	SlotsAvailable int       `json:"slots_available"`
	SlotsBooked    int       `json:"slots_booked"`
	Description    string    `json:"description"`
	Status         string    `json:"status"`
}

type DonorScheduleByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type DonorScheduleByHospitalIdRequest struct {
	HospitalId int64 `param:"hospital_id" validate:"required"`
}

type GetAllDonorScheduleRequest struct {
	Page           int64  `query:"page"`
	Limit          int64  `query:"limit"`
	Search         string `query:"search"`
	Sort           string `query:"sort"`
	Order          string `query:"order"`
	EventDate      string `query:"event_date"`
	StartTime      string `query:"start_time"`
	EndTime        string `query:"end_time"`
	SlotsAvailable *bool  `query:"slots_available"`
	Status         string `query:"status"`
}
