package dto

type NotificationCreateRequest struct {
	UserId           int64  `json:"user_id" validate:"required"`
	Title            string `json:"title" validate:"required"`
	Message          string `json:"message" validate:"required"`
	NotificationType string `json:"notification_type" validate:"required"` // 'Request', 'Donation', 'Certificate', 'Reminder', 'System'
}

type NotificationUpdateRequest struct {
	Id               int64  `param:"id" validate:"required"`
	Title            string `json:"title"`
	Message          string `json:"message"`
	NotificationType string `json:"notification_type"` // 'Request', 'Donation', 'Certificate', 'Reminder', 'System'
	IsRead           bool   `json:"is_read"`           // Indicates if the notification has been read
}
