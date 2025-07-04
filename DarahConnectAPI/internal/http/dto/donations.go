package dto

type DonationsCreate struct {
	OrderID  string `json:"order_id" form:"order_id"`
	Transaction_time string `json:"transaction_time" form:"transaction_time" validate:"required"`
	Transaction_status string `json:"transaction_status" form:"transaction_status" validate:"required"`
}

type PaymentRequest struct {
	OrderID  string `json:"order_id" form:"order_id"`
	UserId 	int64 `json:"user_id" form:"user_id"`
	Amount   int64 `json:"amount" form:"amount" validate:"required"`
	Fullname string `json:"fullname" form:"fullname"`
	Email    string `json:"email" form:"email"`
	Phone    string `json:"phone" form:"phone"`
}

type GetAllDonation struct {
	Page   int64  `query:"page"`
	Limit  int64  `query:"limit"`
	Search string `query:"search"`
	Sort   string `query:"sort"`
	OrderId  string `query:"order_id"`
	Order string `query:"order"`
	Status string `query:"status"`
}

type GetByDonationId struct{
	Id int64 `param:"Id" validate:"required"`
}