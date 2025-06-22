package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"os"
	"errors"	
	mailjet "github.com/mailjet/mailjet-apiv3-go"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
)

// Mailer adalah struct untuk mengelola pengiriman email menggunakan Mailjet
type Mailer struct {
	client  *mailjet.Client
	smtpCfg configs.SMTPConfig
}

// EmailData berisi data yang diperlukan untuk mengirim email
type EmailData struct {
	To       string
	Subject  string
	Data     interface{}
	Template string // Nama template yang akan digunakan
}
func NewMailer(smtpCfg *configs.SMTPConfig) (*Mailer, error) {
	// Inisialisasi client Mailjet
	mailjetClient := mailjet.NewMailjetClient("08775d2600b7cb1496cd3008660a13e2", "58f9ed2703a140053f6018fb5606cae9")
	log.Printf("key : %v", smtpCfg.APIKey)
	log.Printf("key : %v", smtpCfg.SecretKey)
	return &Mailer{
		client:  mailjetClient,
		smtpCfg: *smtpCfg,
	}, nil
}
func (m *Mailer) SendEmail(templatePath string, emailData EmailData) error {
	// Dapatkan direktori kerja saat ini untuk logging
	cwd, err := os.Getwd()
	if err != nil {
		return err
	} 

	// Coba beberapa path alternatif untuk template
	templatePaths := []string{
		templatePath,
		fmt.Sprintf("templates/email/%s", emailData.Template),
		fmt.Sprintf("../templates/email/%s", emailData.Template),
		fmt.Sprintf("%s/templates/email/%s", cwd, emailData.Template),
	}

	var tmpl *template.Template
	var templateFound bool = false

	// Coba setiap path sampai template ditemukan
	for _, path := range templatePaths {
		log.Printf("Mencoba membaca template dari: %s", path)
		if _, errPath := os.Stat(path); errPath == nil {
			var errParse error
			tmpl, errParse = template.ParseFiles(path)
			if errParse == nil {
				_, errRead := os.ReadFile(path)
				if errRead != nil {
					return errors.New(fmt.Sprintf("Peringatan: Gagal membaca konten template untuk logging: %v", errRead))
				} 
				templateFound = true
				break
			} 
		}
	}

	if !templateFound {
		return errors.New("template tidak ditemukan di path manapun")
	}

	// Eksekusi template dengan data
	var emailBody bytes.Buffer
	if errExecute := tmpl.Execute(&emailBody, emailData.Data); errExecute != nil {
		return errors.New(fmt.Sprintf("gagal mengeksekusi template: %v", errExecute))
	}

	// Siapkan pesan Mailjet menggunakan struktur MessagesV31 dan InfoMessagesV31
	messagesInfo := []mailjet.InfoMessagesV31{
		{
			From: &mailjet.RecipientV31{
				Email: m.smtpCfg.Username,
				Name:  "Darah Connect",
			},
			To: &mailjet.RecipientsV31{
				mailjet.RecipientV31{
					Email: emailData.To,
				},
			},
			Subject:  "Reset Password",
			TextPart: "Silakan gunakan email client yang mendukung HTML untuk melihat pesan ini.",
			HTMLPart: emailBody.String(),
		},
	}

	messages := mailjet.MessagesV31{Info: messagesInfo}
	// Kirim email menggunakan SendMailV31
	res, err := m.client.SendMailV31(&messages)
	if err != nil {
		return err
	}
	fmt.Printf("Data: %+v\n", res)

	return nil
}