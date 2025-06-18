package mailer

import (
	"bytes"
	"html/template"

	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
	"gopkg.in/gomail.v2"
)

type EmailData struct {
	To      string
	Subject string
	Data    interface{}
}

type Mailer struct {
	config configs.SMTPConfig
}

func NewMailer(config configs.SMTPConfig) *Mailer {
	return &Mailer{config: config}
}

func (m *Mailer) SendEmail(templatePath string, emailData EmailData) error {
	// Parse template
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return err
	}

	// Execute template
	var body bytes.Buffer
	if err := tmpl.Execute(&body, emailData.Data); err != nil {
		return err
	}

	// Setup email message
	msg := gomail.NewMessage()
	msg.SetHeader("From", m.config.Username)
	msg.SetHeader("To", emailData.To)
	msg.SetHeader("Subject", emailData.Subject)
	msg.SetBody("text/html", body.String())

	// Setup dialer
	dialer := gomail.NewDialer(
		m.config.Host,
		m.config.Port,
		m.config.Username,
		m.config.Password,
	)

	// Send email
	return dialer.DialAndSend(msg)
}
