package entity

import "time"

type DonorSchedule struct {
	Id             int64     `json:"id"`
	HospitalId     int64     `json:"hospital_id"`
	EventName      string    `json:"event_name"`
	EventDate      time.Time `json:"event_date"`
	StartTime      time.Time `json:"start_time"`
	EndTime        time.Time `json:"end_time"`
	SlotsAvailable int       `json:"slots_available"`
	SlotsBooked    int       `json:"slots_booked"`
	Description    string    `json:"description"`
	Status         string    `json:"status"`	//'Upcoming', 'Ongoing', 'Completed', 'Cancelled'
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (DonorSchedule) TableName() string {
	return "public.donor_schedules"
}
