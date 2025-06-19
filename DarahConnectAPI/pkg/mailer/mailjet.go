package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"strings"

	"github.com/mailjet/mailjet-apiv3-go/v4"
	"github.com/mhusainh/DarahConnect/DarahConnectAPI/configs"
)

// Mailer menangani pengiriman email menggunakan Mailjet API
type Mailer struct {
	config configs.SMTPConfig
	client *mailjet.Client
}

// EmailData contains information needed to send an email
type EmailData struct {
	To      string
	Subject string
	Data    interface{}
}

// maskString menyembunyikan sebagian dari string sensitif
func maskString(s string) string {
	if s == "" {
		return "<tidak dikonfigurasi>"
	}

	// Tampilkan hanya 4 karakter pertama dan ganti sisanya dengan '*'
	if len(s) <= 8 {
		return strings.Repeat("*", len(s))
	}

	visible := 4
	if len(s) < visible {
		visible = len(s)
	}

	return s[:visible] + strings.Repeat("*", len(s)-visible)
}

// setupProxy mengatur HTTP client dengan proxy jika URL proxy disediakan
func setupProxy(proxyURLStr string) (*http.Client, error) {
	if proxyURLStr == "" {
		return nil, nil // Tidak ada proxy yang dikonfigurasi
	}

	proxyURL, err := url.Parse(proxyURLStr)
	if err != nil {
		return nil, fmt.Errorf("gagal parsing URL proxy: %w", err)
	}

	tr := &http.Transport{Proxy: http.ProxyURL(proxyURL)}
	client := &http.Client{Transport: tr}

	return client, nil
}

// NewMailer creates a new Mailer instance
func NewMailer(config *configs.SMTPConfig) (*Mailer, error) {
	// Log konfigurasi untuk debugging
	fmt.Printf("Inisialisasi Mailjet dengan konfigurasi:\n")
	fmt.Printf("  - Host: %s\n", config.Host)
	fmt.Printf("  - Port: %d\n", config.Port)
	fmt.Printf("  - Username/Sender: %s\n", config.Username)
	fmt.Printf("  - API Key: %s...\n", maskString(config.APIKey))
	fmt.Printf("  - Secret Key: %s...\n", maskString(config.SecretKey))
	fmt.Printf("  - Proxy URL: %s\n", maskString(config.ProxyURL))

	// Inisialisasi client Mailjet dengan API Key dan Secret Key
	client := mailjet.NewMailjetClient(config.APIKey, config.SecretKey)

	// Jika proxy dikonfigurasi, gunakan proxy
	if config.ProxyURL != "" {
		fmt.Printf("Menggunakan proxy: %s\n", maskString(config.ProxyURL))
		httpClient, err := setupProxy(config.ProxyURL)
		if err == nil && httpClient != nil {
			client.SetClient(httpClient)
			fmt.Printf("HTTP client dengan proxy berhasil dikonfigurasi\n")
		} else {
			return nil, err
		}
	}

	return &Mailer{
		config: *config,
		client: client,
	}, nil
}

// SendEmail sends an email using Mailjet API
func (m *Mailer) SendEmail(templatePath string, emailData EmailData) error {
	// Parse template - coba beberapa path alternatif jika diperlukan
	fmt.Printf("Mencoba membaca template dari: %s\n", templatePath)

	// Daftar path alternatif yang akan dicoba
	pathsToTry := []string{
		templatePath,
		"./" + templatePath,
		"../" + templatePath,
		"../../" + templatePath,
	}

	var tmpl *template.Template
	var err error
	var lastErr error

	// Coba setiap path sampai berhasil
	for _, path := range pathsToTry {
		fmt.Printf("Mencoba path: %s\n", path)
		tmpl, err = template.ParseFiles(path)
		if err == nil {
			// Template ditemukan
			fmt.Printf("Berhasil membaca template dari: %s\n", path)
			break
		}
		lastErr = err
	}

	// Jika semua path gagal
	if err != nil {
		return fmt.Errorf("gagal membaca template email dari semua path yang dicoba: %w", lastErr)
	}

	// Execute template
	var body bytes.Buffer
	if executeErr := tmpl.Execute(&body, emailData.Data); executeErr != nil {
		return fmt.Errorf("gagal mengeksekusi template email: %w", executeErr)
	}

	// Setup Mailjet message
	// Log informasi email untuk debugging
	fmt.Printf("Menyiapkan email dengan data berikut:\n")
	fmt.Printf("  - Dari: %s (%s)\n", m.config.Username, "Darah Connect")
	fmt.Printf("  - Ke: %s\n", emailData.To)
	fmt.Printf("  - Subjek: %s\n", emailData.Subject)
	fmt.Printf("  - Konfigurasi SMTP: Host=%s, Port=%d\n", m.config.Host, m.config.Port)
	fmt.Printf("  - Ukuran konten HTML: %d bytes\n", body.Len())

	messagesInfo := []mailjet.InfoMessagesV31{
		{
			From: &mailjet.RecipientV31{
				Email: m.config.Username, // Menggunakan email pengirim dari konfigurasi
				Name:  "Darah Connect",
			},
			To: &mailjet.RecipientsV31{
				mailjet.RecipientV31{
					Email: emailData.To,
				},
			},
			Subject:  emailData.Subject,
			HTMLPart: body.String(),
		},
	}

	messages := mailjet.MessagesV31{Info: messagesInfo}

	// Kirim email menggunakan Mailjet API
	fmt.Printf("Mengirim email ke: %s dengan subjek: %s\n", emailData.To, emailData.Subject)
	res, err := m.client.SendMailV31(&messages)
	if err != nil {
		// Jika terjadi error, tambahkan informasi error untuk debugging
		return fmt.Errorf("gagal mengirim email: %w", err)
	}

	// Log respons untuk debugging
	fmt.Printf("Email berhasil dikirim ke %s, status: %d\n", emailData.To, res.ResultsV31[0].Status)

	// Periksa status respons
	if res.ResultsV31[0].Status != "200" && res.ResultsV31[0].Status != "201" {
		// Log the full response for debugging if the status is not successful
		return fmt.Errorf("email dikirim tetapi dengan status tidak sukses: %s. Full response: %+v",
			res.ResultsV31[0].Status, res.ResultsV31[0])
	}

	// Jika berhasil, kembalikan nil
	return nil
}
