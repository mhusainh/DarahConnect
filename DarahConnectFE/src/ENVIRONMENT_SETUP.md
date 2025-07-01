# Environment Setup untuk DarahConnect

## File .env

Buat file `.env` di root project (sejajar dengan `package.json`) dengan konfigurasi berikut:

```env
# ChatBot Configuration
REACT_APP_CHATBOT_WEBHOOK_URL=https://vertically-possible-amoeba.ngrok-free.app/webhook-test/0f8b8e46-3150-4d54-9ed4-5bf0d7952d17

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# Debug Configuration
REACT_APP_DEBUG_API=true
REACT_APP_DEBUG_VERBOSE=false

# Environment
REACT_APP_ENV=development

# Google Maps (optional)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Perubahan yang Telah Dibuat

### 1. Webhook URL di Environment Variable
- Webhook URL sekarang disimpan di `REACT_APP_CHATBOT_WEBHOOK_URL`
- Default fallback URL tetap tersedia jika environment variable tidak diset
- Komponen ChatBot dan ChatBotConfig menggunakan environment variable

### 2. Session ID Generation
- Session ID sekarang di-generate setiap kali halaman di-reload
- Format: `session_{timestamp}_{randomString}`
- Menggunakan utility function `generateSessionId()` dari `utils/envSetup.ts`

### 3. File yang Diupdate
- `config/api.ts` - Menambahkan `CHATBOT_WEBHOOK_URL`
- `components/ChatBot.tsx` - Menggunakan environment variable dan session ID generation
- `components/ChatBotConfig.tsx` - Menggunakan environment variable
- `App.tsx` - Menghapus hardcoded webhook URL
- `utils/envSetup.ts` - Utility baru untuk environment management

## Cara Penggunaan

### Development
1. Buat file `.env` di root project
2. Set `REACT_APP_CHATBOT_WEBHOOK_URL` dengan URL webhook n8n Anda
3. Restart development server: `npm start`

### Production
1. Set environment variable di hosting platform Anda
2. Pastikan variable dimulai dengan `REACT_APP_` untuk React app

## Validasi Environment

Sistem akan memvalidasi environment variables saat startup dan menampilkan warning jika ada yang missing:

```javascript
import { validateEnvironment } from './utils/envSetup';

// Call di App.tsx atau index.tsx
validateEnvironment();
```

## Session ID Behavior

- **Sebelum**: Session ID di-generate setiap kali ada pesan baru
- **Sekarang**: Session ID di-generate sekali saat komponen mount (page reload)
- Format: `session_1703123456789_abc123def`

## Troubleshooting

### Webhook tidak berfungsi
1. Pastikan URL webhook benar di `.env`
2. Cek console browser untuk error
3. Test webhook menggunakan fitur "Test" di ChatBotConfig

### Environment variable tidak terbaca
1. Pastikan file `.env` ada di root project
2. Restart development server
3. Pastikan variable dimulai dengan `REACT_APP_`

### Session ID tidak berubah
1. Refresh halaman (F5 atau Ctrl+R)
2. Session ID hanya berubah saat page reload, bukan saat chat dibuka/tutup 