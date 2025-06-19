package dto

type HospitalCreateRequest struct {
	Name      string  `json:"name" validate:"required"`
	Address   string  `json:"address" validate:"required"`
	City      string  `json:"city" validate:"required"`
	Province  string  `json:"province" validate:"required"`
	Latitude  float64 `json:"latitude" validate:"required"`
	Longitude float64 `json:"longitude" validate:"required"`
}

type HospitalUpdateRequest struct {
	Id        int64   `json:"id" validate:"required"`
	Name      string  `json:"name"`
	Address   string  `json:"address"`
	City      string  `json:"city"`
	Province  string  `json:"province"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type HospitalDeleteRequest struct {
	Id int64 `param:"id" validate:"required"`
}

type HospitalGetByIdRequest struct {
	Id int64 `param:"id" validate:"required"`
}
