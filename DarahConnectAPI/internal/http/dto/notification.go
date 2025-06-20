package dto

type NotificationCreateRequest struct {
	UserId           int64  `json:"user_id" validate:"required"`
	Title            string `json:"title" validate:"required"`
	Message          string `json:"message" validate:"required"`
	NotificationType string `json:"notification_type" validate:"required"` // e.g., "alert", "reminder", "info"
}

type NotificationUpdateRequest struct {
	Id               int64  `param:"id" validate:"required"`
	Title            string `json:"title"`
	Message          string `json:"message"`
	NotificationType string `json:"notification_type"` // e.g., "alert", "reminder", "info"
	IsRead           bool   `json:"is_read"` // Indicates if the notification has been read
}