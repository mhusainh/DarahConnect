package entity

import (
	"time"
)

type Donation struct {
	Id        int64     `gorm:"primaryKey" json:"id"`
	UserId    int64     `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserId;references:Id"`
	OrderId   int64     `json:"order_id"`
	Amount    int64     `json:"amount"`
	Status    string    `json:"status"`
	TransactionTime time.Time `json:"transaction_time"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Donation) TableName() string {
	return "public.donations"
}
