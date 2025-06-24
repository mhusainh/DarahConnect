# Setup ChatBot dengan n8n Webhook

## Overview
Dokumentasi ini menjelaskan cara setup ChatBot customer service DarahConnect menggunakan n8n workflow dengan webhook.

## Fitur ChatBot
- ✅ Real-time messaging dengan animasi yang smooth
- ✅ Integrasi webhook n8n
- ✅ Responsive design untuk mobile dan desktop
- ✅ Typing indicator dan loading states
- ✅ Auto-scroll dan focus management
- ✅ Customizable appearance dan positioning
- ✅ Error handling dan fallback messages
- ✅ Admin panel untuk konfigurasi

## Setup n8n Workflow

### 1. Buat Workflow Baru di n8n

1. Login ke n8n instance Anda
2. Buat workflow baru
3. Tambahkan node berikut:

### 2. Node Webhook (Trigger)
```json
{
  "httpMethod": "POST",
  "path": "webhook/chat",
  "responseMode": "responseNode",
  "options": {}
}
```

### 3. Node IF untuk Filter Test Messages
```json
{
  "conditions": {
    "boolean": [],
    "dateTime": [],
    "number": [],
    "string": [
      {
        "value1": "={{$json.test}}",
        "operation": "notEqual",
        "value2": "true"
      }
    ]
  }
}
```

### 4. Node Function untuk Process Message
```javascript
// Process incoming message
const message = $json.message;
const sessionId = $json.sessionId;
const timestamp = $json.timestamp;

// Simple response logic (replace with your AI/NLP service)
let response = '';

// Keywords untuk donor darah
if (message.toLowerCase().includes('donor') || message.toLowerCase().includes('donasi')) {
  response = 'Terima kasih atas minat Anda untuk menjadi donor darah! 🩸\n\nUntuk mendaftar sebagai donor, Anda bisa:\n1. Klik menu "Donor" di website\n2. Isi formulir pendaftaran\n3. Pilih lokasi dan jadwal yang tersedia\n\nApakah ada hal lain yang ingin Anda tanyakan?';
} else if (message.toLowerCase().includes('syarat') || message.toLowerCase().includes('persyaratan')) {
  response = 'Syarat menjadi donor darah:\n\n✅ Usia 17-65 tahun\n✅ Berat badan minimal 45kg\n✅ Kondisi sehat\n✅ Tidak sedang hamil/menyusui\n✅ Tidak mengonsumsi obat tertentu\n✅ Tidak memiliki riwayat penyakit tertentu\n\nIngin tahu lebih detail? Silakan hubungi tim medis kami!';
} else if (message.toLowerCase().includes('jadwal') || message.toLowerCase().includes('waktu')) {
  response = 'Jadwal donor darah tersedia:\n\n🕐 Senin-Jumat: 08:00-16:00\n🕐 Sabtu: 08:00-14:00\n🕐 Minggu: Libur\n\nUntuk melihat jadwal campaign terdekat, silakan kunjungi halaman "Campaign" di website kami.';
} else if (message.toLowerCase().includes('lokasi') || message.toLowerCase().includes('tempat')) {
  response = 'Kami memiliki lokasi donor darah di seluruh Indonesia! 📍\n\nUntuk melihat lokasi terdekat dari Anda, silakan gunakan fitur "Location Picker" di halaman donor atau campaign.\n\nApakah Anda ingin saya bantu mencari lokasi di kota tertentu?';
} else if (message.toLowerCase().includes('bantuan') || message.toLowerCase().includes('help')) {
  response = 'Saya di sini untuk membantu Anda! 😊\n\nBeberapa hal yang bisa saya bantu:\n• Informasi tentang donor darah\n• Syarat dan persyaratan donor\n• Jadwal dan lokasi donor\n• Cara mendaftar sebagai donor\n• Informasi campaign yang sedang berjalan\n\nSilakan tanyakan apa yang ingin Anda ketahui!';
} else if (message.toLowerCase().includes('terima kasih') || message.toLowerCase().includes('thanks')) {
  response = 'Sama-sama! 😊 Terima kasih sudah peduli dengan kegiatan donor darah. Jika ada pertanyaan lain, jangan ragu untuk bertanya ya!';
} else {
  response = 'Terima kasih atas pertanyaan Anda! 😊\n\nUntuk informasi lebih detail atau pertanyaan yang lebih spesifik, Anda bisa:\n• Menghubungi tim support di support@darahconnect.com\n• Telepon hotline: 021-1234-5678\n• Atau kunjungi halaman FAQ di website kami\n\nAda hal lain yang bisa saya bantu?';
}

return {
  response: response,
  sessionId: sessionId,
  timestamp: new Date().toISOString(),
  originalMessage: message
};
```

### 5. Node HTTP Response
```json
{
  "responseCode": 200,
  "responseHeaders": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning"
  }
}
```

**IMPORTANT:** Pastikan response body dari n8n dalam format berikut:
```json
{
  "response": "Text response from bot"
}
```

Atau bisa juga:
```json
{
  "message": "Text response from bot"
}
```

### 6. Node untuk Test Response
```javascript
// Response untuk test connection
return {
  response: "Webhook n8n berhasil terhubung dengan DarahConnect! ✅",
  status: "success",
  timestamp: new Date().toISOString()
};
```

## Integrasi dengan AI/NLP (Opsional)

Untuk response yang lebih pintar, Anda bisa menambahkan:

### Option 1: OpenAI GPT
```javascript
// Node HTTP Request ke OpenAI
{
  "method": "POST",
  "url": "https://api.openai.com/v1/chat/completions",
  "headers": {
    "Authorization": "Bearer YOUR_OPENAI_API_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "Anda adalah customer service DarahConnect, platform donor darah di Indonesia. Berikan jawaban yang helpful, akurat, dan ramah dalam bahasa Indonesia."
      },
      {
        "role": "user",
        "content": "={{$json.message}}"
      }
    ],
    "max_tokens": 200,
    "temperature": 0.7
  }
}
```

### Option 2: Dialogflow
```javascript
// Integration dengan Google Dialogflow
{
  "method": "POST",
  "url": "https://dialogflow.googleapis.com/v2/projects/YOUR_PROJECT_ID/agent/sessions/{{$json.sessionId}}:detectIntent",
  "headers": {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  },
  "body": {
    "queryInput": {
      "text": {
        "text": "={{$json.message}}",
        "languageCode": "id"
      }
    }
  }
}
```

## Konfigurasi Chatbot di Admin Panel

1. Login sebagai admin
2. Navigasi ke halaman Admin Settings
3. Scroll ke section "Konfigurasi ChatBot"
4. Masukkan URL webhook n8n Anda
5. Test koneksi untuk memastikan webhook berfungsi
6. Customize nama bot, pesan welcome, warna, dll.
7. Simpan konfigurasi

## Testing

### Test Manual
1. Buka website DarahConnect
2. Klik icon chat di pojok kanan bawah
3. Ketik pesan test
4. Pastikan response dari n8n diterima

### Test Webhook Langsung
```bash
curl -X POST "https://your-n8n-webhook-url.com/webhook/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Halo, saya ingin donor darah",
    "sessionId": "test_session",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }'
```

## Monitoring & Analytics

Tambahkan node untuk logging di n8n:

```javascript
// Node Function untuk Analytics
const analytics = {
  timestamp: new Date().toISOString(),
  sessionId: $json.sessionId,
  message: $json.message,
  response: $json.response,
  userAgent: $json.userAgent,
  responseTime: Date.now() - new Date($json.timestamp).getTime()
};

// Send to database or analytics service
return analytics;
```

## Security Best Practices

1. **HTTPS Only**: Pastikan webhook menggunakan HTTPS
2. **Rate Limiting**: Implementasi rate limiting di n8n
3. **Input Validation**: Validasi input di n8n workflow
4. **API Keys**: Simpan API keys dengan aman di n8n credentials
5. **CORS**: Configure CORS headers dengan benar

## Troubleshooting

### Common Issues

1. **Webhook tidak response**
   - Check URL webhook di admin panel
   - Pastikan n8n workflow aktif
   - Check network connectivity

2. **CORS Errors**
   - Tambahkan CORS headers di HTTP Response node
   - Pastikan origin domain diizinkan

3. **Timeout Errors**
   - Increase response timeout di chatbot config
   - Optimize n8n workflow performance

4. **Response tidak sesuai**
   - Check format response dari n8n
   - Validate JSON structure
   - Check error handling di workflow

## Deployment Checklist

- [ ] n8n workflow dibuat dan ditest
- [ ] Webhook URL dikonfigurasi di admin panel
- [ ] Test koneksi berhasil
- [ ] Error handling implemented
- [ ] Analytics/logging setup
- [ ] Security measures implemented
- [ ] Performance testing completed
- [ ] Documentation updated

## Support

Untuk pertanyaan teknis atau bantuan setup:
- Email: tech-support@darahconnect.com
- Dokumentasi: [Link to docs]
- GitHub Issues: [Link to issues] 