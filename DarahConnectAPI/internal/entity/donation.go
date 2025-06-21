package entity

import (
	"time"
)

type Donation struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	UserID    int64     `gorm:"not null" json:"user_id"`
	Amount    int64     `gorm:"not null" json:"amount"`
	Status    string    `gorm:"not null" json:"status"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}
