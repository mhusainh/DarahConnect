# ChatBot Customer Service DarahConnect

## 🤖 Overview

ChatBot customer service yang telah ditambahkan ke aplikasi DarahConnect dengan fitur-fitur modern dan integrasi n8n webhook untuk automasi yang powerful.

## ✨ Fitur Utama

### 🎨 UI/UX Features
- **Modern Design**: Interface yang clean dan user-friendly
- **Responsive**: Otomatis menyesuaikan untuk mobile dan desktop
- **Smooth Animations**: Menggunakan Framer Motion untuk animasi yang halus
- **Real-time Typing Indicator**: Simulasi typing seperti aplikasi chat modern
- **Auto-scroll**: Otomatis scroll ke pesan terbaru
- **Focus Management**: Auto-focus pada input ketika chat dibuka

### 🔧 Technical Features
- **n8n Webhook Integration**: Integrasi langsung dengan n8n untuk processing pesan
- **Error Handling**: Penanganan error yang robust dengan fallback messages
- **Session Management**: Simple session tracking untuk analisis
- **Customizable**: Bisa dikustomisasi warna, posisi, nama bot, dll.
- **Demo Mode**: Mode demo untuk testing tanpa perlu n8n setup

### 🛠️ Admin Features
- **Configuration Panel**: Panel admin untuk mengatur chatbot
- **Webhook Testing**: Test koneksi webhook langsung dari admin panel
- **Real-time Settings**: Ubah pengaturan chatbot secara real-time
- **Analytics Ready**: Struktur data siap untuk implementasi analytics

## 📁 Struktur File

```
src/
├── components/
│   ├── ChatBot.tsx           # Komponen utama chatbot dengan n8n integration
│   ├── ChatBotDemo.tsx       # Demo chatbot untuk testing
│   └── ChatBotConfig.tsx     # Panel konfigurasi admin
├── pages/
│   └── AdminSettingsPage.tsx # Halaman admin dengan tab chatbot
└── App.tsx                   # Integrasi chatbot ke aplikasi
```

## 🚀 Quick Start

### 1. Demo Mode (Tanpa n8n)

Chatbot sudah aktif dalam mode demo dan siap digunakan:

```tsx
// Di App.tsx sudah ada:
<ChatBotDemo 
  position="bottom-right"
  primaryColor="#ef4444"
  botName="DarahConnect Assistant"
  welcomeMessage="Halo! Saya assistant DarahConnect. Ada yang bisa saya bantu hari ini? 🩸"
/>
```

### 2. Production Mode (Dengan n8n)

1. Setup n8n workflow (lihat `N8N_CHATBOT_SETUP.md`)
2. Uncomment ChatBot component di `App.tsx`:

```tsx
<ChatBot 
  webhookUrl="https://your-n8n-webhook-url.com/webhook/chat"
  position="bottom-right"
  primaryColor="#ef4444"
  botName="DarahConnect Assistant"
  welcomeMessage="Halo! Saya assistant DarahConnect. Ada yang bisa saya bantu hari ini? 🩸"
/>
```

3. Comment atau hapus `<ChatBotDemo />`

## ⚙️ Konfigurasi

### Props ChatBot/ChatBotDemo

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `webhookUrl` | string | - | URL webhook n8n (hanya ChatBot) |
| `position` | 'bottom-right' \| 'bottom-left' | 'bottom-right' | Posisi chatbot |
| `primaryColor` | string | '#ef4444' | Warna utama chatbot |
| `botName` | string | 'DarahConnect Assistant' | Nama bot |
| `welcomeMessage` | string | - | Pesan welcome |

### Contoh Kustomisasi

```tsx
<ChatBot
  webhookUrl="https://my-n8n.com/webhook/chat"
  position="bottom-left"
  primaryColor="#10b981" // Green
  botName="DarahBot"
  welcomeMessage="Selamat datang! 👋"
/>
```

## 🔧 Admin Configuration

1. Login sebagai admin
2. Pergi ke **Admin Settings**
3. Klik tab **ChatBot**
4. Konfigurasi:
   - URL webhook n8n
   - Test koneksi
   - Nama bot
   - Pesan welcome
   - Warna dan posisi
   - Timeout settings

## 💬 Demo Responses

ChatBot demo dapat merespons berbagai pertanyaan:

### Keyword Triggers
- **"donor", "donasi"** → Info pendaftaran donor
- **"syarat", "persyaratan"** → Syarat donor darah
- **"jadwal", "waktu"** → Jadwal operasional
- **"lokasi", "tempat"** → Info lokasi donor
- **"bantuan", "help"** → Menu bantuan
- **"covid", "vaksin"** → Info terkait COVID-19
- **"demo", "test"** → Info mode demo

### Contoh Percakapan

```
User: "Halo, saya ingin donor darah"
Bot: "Terima kasih atas minat Anda untuk menjadi donor darah! 🩸

Untuk mendaftar sebagai donor, Anda bisa:
1. Klik menu "Donor" di website
2. Isi formulir pendaftaran
3. Pilih lokasi dan jadwal yang tersedia

Apakah ada hal lain yang ingin Anda tanyakan?"
```

## 🔗 n8n Integration

### Webhook Payload

```json
{
  "message": "User message",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "sessionId": "session_1234567890",
  "userAgent": "Mozilla/5.0..."
}
```

### Expected Response

```json
{
  "response": "Bot response message",
  "sessionId": "session_1234567890",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 🎨 Styling & Customization

### CSS Classes Yang Bisa Di-override

```css
/* Chat container */
.chatbot-container {
  /* Custom styles */
}

/* Message bubbles */
.chatbot-message-user {
  /* User message styles */
}

.chatbot-message-bot {
  /* Bot message styles */
}
```

### Warna Dinamis

Chatbot menggunakan prop `primaryColor` untuk:
- Header background
- Send button background
- Chat button background
- Focus rings

## 📱 Responsive Design

- **Desktop**: Width 384px (24rem)
- **Mobile**: Width 320px (20rem)
- **Height**: Fixed 384px (24rem)
- **Z-index**: 50 (above most elements)

## 🔒 Security Considerations

1. **CORS**: Pastikan n8n webhook mengizinkan domain Anda
2. **Rate Limiting**: Implementasi rate limiting di n8n
3. **Input Validation**: Validasi input di n8n workflow
4. **Error Messages**: Jangan expose sensitive information di error messages

## 📊 Analytics & Monitoring

### Data Yang Bisa Dikumpulkan

```javascript
{
  timestamp: '2023-01-01T00:00:00.000Z',
  sessionId: 'session_123',
  userMessage: 'User input',
  botResponse: 'Bot response',
  responseTime: 1234, // milliseconds
  userAgent: 'Mozilla/5.0...',
  errorOccurred: false
}
```

### Implementasi Analytics

Tambahkan ke n8n workflow atau modify ChatBot component untuk mengirim data analytics ke service pilihan Anda.

## 🐛 Troubleshooting

### Common Issues

1. **Chatbot tidak muncul**
   - Check console untuk error
   - Pastikan component di-import dengan benar
   - Verify z-index tidak tertutup element lain

2. **Webhook tidak response**
   - Check URL webhook di konfigurasi
   - Test webhook dengan curl
   - Check CORS settings di n8n

3. **Styling tidak sesuai**
   - Check CSS conflicts
   - Verify Tailwind CSS classes
   - Check custom CSS overrides

### Debug Mode

```tsx
// Tambahkan untuk debugging
<ChatBot
  // ... props lain
  onError={(error) => console.log('ChatBot Error:', error)}
  onMessage={(message) => console.log('New Message:', message)}
/>
```

## 🚀 Future Enhancements

### Planned Features
- [ ] **Voice Input**: Integrasi Web Speech API
- [ ] **File Upload**: Upload gambar/dokumen
- [ ] **Rich Messages**: Cards, buttons, quick replies
- [ ] **Multi-language**: Support bahasa lain
- [ ] **Sentiment Analysis**: Analisis mood user
- [ ] **Live Chat Handover**: Transfer ke human agent
- [ ] **Chat History**: Simpan history chat user
- [ ] **Push Notifications**: Notifikasi pesan baru

### AI Enhancements
- [ ] **NLP Integration**: Dialogflow, Rasa, atau Claude
- [ ] **Intent Recognition**: Deteksi intent otomatis
- [ ] **Entity Extraction**: Extract data dari pesan user
- [ ] **Context Awareness**: Remember conversation context
- [ ] **Personalization**: Personalized responses

## 📞 Support

Untuk bantuan teknis atau feature request:

- **Email**: tech@darahconnect.com
- **Documentation**: [Link to docs]
- **GitHub Issues**: [Link to issues]
- **Slack**: #chatbot-support

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Basic chatbot implementation
- ✅ n8n webhook integration
- ✅ Demo mode
- ✅ Admin configuration panel
- ✅ Responsive design
- ✅ Smooth animations

### Upcoming v1.1.0
- 🔄 Voice input support
- 🔄 File upload capability
- 🔄 Rich message format
- 🔄 Chat history persistence

---

Made with ❤️ for DarahConnect Community 