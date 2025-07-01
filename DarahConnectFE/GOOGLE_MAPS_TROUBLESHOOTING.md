# 🔧 Google Maps API Troubleshooting Guide

## Error: "This API project is not authorized to use this API"

### Penyebab Error
Error ini muncul karena:
1. API key tidak valid atau tidak dikonfigurasi
2. API yang diperlukan belum di-enable
3. API key tidak memiliki izin untuk menggunakan service tertentu
4. Environment variable tidak terbaca dengan benar

### Solusi Lengkap

#### 1. **Buat File .env**
Buat file `.env` di root directory project:

```bash
# Google Maps API Configuration
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

#### 2. **Dapatkan API Key yang Benar**

**Langkah 1: Buka Google Cloud Console**
- Kunjungi [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Login dengan akun Google Anda

**Langkah 2: Buat atau Pilih Project**
- Klik dropdown project di atas
- Pilih "New Project" atau project yang sudah ada
- Pastikan project aktif

**Langkah 3: Enable APIs yang Diperlukan**
- Buka "APIs & Services" → "Library"
- Cari dan enable API berikut:
  - ✅ **Maps JavaScript API**
  - ✅ **Places API** 
  - ✅ **Geocoding API**

**Langkah 4: Buat API Key**
- Buka "APIs & Services" → "Credentials"
- Klik "Create Credentials" → "API Key"
- Copy API key yang dihasilkan

#### 3. **Konfigurasi Keamanan API Key**

**Application Restrictions:**
- Klik nama API key yang baru dibuat
- Di bagian "Application restrictions":
  - Pilih "HTTP referrers (web sites)"
  - Tambahkan domain Anda:
    ```
    localhost:3000/*
    http://localhost:3000/*
    https://yourdomain.com/*
    ```

**API Restrictions:**
- Di bagian "API restrictions":
  - Pilih "Restrict key"
  - Pilih hanya API yang diperlukan:
    - Maps JavaScript API
    - Places API
    - Geocoding API

#### 4. **Update Environment Variable**
- Ganti `your_actual_api_key_here` dengan API key yang sebenarnya
- Restart development server:
  ```bash
  npm start
  # atau
  yarn start
  ```

### Verifikasi Konfigurasi

#### 1. **Cek Environment Variable**
Buka browser console dan ketik:
```javascript
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
```

#### 2. **Cek API Key di Google Cloud Console**
- Buka "APIs & Services" → "Credentials"
- Pastikan API key ada dan tidak expired
- Cek "Quotas" untuk memastikan tidak melebihi limit

#### 3. **Test API Key**
Buka browser dan akses:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
```

Jika berhasil, akan muncul JavaScript code. Jika gagal, akan muncul error message.

### Common Issues & Solutions

#### Issue 1: "API key not valid"
**Solution:**
- Pastikan API key sudah benar di-copy
- Cek apakah ada spasi atau karakter tambahan
- Pastikan API key tidak expired

#### Issue 2: "This API project is not authorized"
**Solution:**
- Enable semua API yang diperlukan
- Pastikan billing account aktif
- Cek apakah project sudah benar

#### Issue 3: "RefererNotAllowedMapError"
**Solution:**
- Tambahkan domain ke whitelist di API key restrictions
- Pastikan format domain benar (termasuk protocol)

#### Issue 4: "QuotaExceededError"
**Solution:**
- Cek usage di Google Cloud Console
- Upgrade billing plan jika diperlukan
- Implement caching untuk mengurangi API calls

### Testing Checklist

- [ ] File `.env` ada di root directory
- [ ] API key sudah benar (bukan placeholder)
- [ ] Semua API sudah di-enable
- [ ] API key restrictions sudah dikonfigurasi
- [ ] Development server sudah di-restart
- [ ] Browser console tidak ada error
- [ ] Google Maps muncul di modal

### Debug Mode

Untuk debugging lebih lanjut, tambahkan ini ke komponen:

```javascript
useEffect(() => {
  console.log('API Key:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
  console.log('Google Maps Status:', window.google ? 'Loaded' : 'Not Loaded');
}, []);
```

### Alternative Solutions

#### 1. **Gunakan API Key Sementara**
Untuk testing, bisa menggunakan API key tanpa restrictions (tidak recommended untuk production).

#### 2. **Fallback Mode**
Jika Google Maps gagal, tampilkan form manual tanpa map:

```javascript
const [useFallbackMode, setUseFallbackMode] = useState(false);

// Jika Google Maps error, gunakan fallback
if (mapsStatus === 'error') {
  setUseFallbackMode(true);
}
```

#### 3. **Manual Coordinate Input**
Tambahkan input manual untuk latitude/longitude jika map tidak tersedia.

### Support

Jika masih mengalami masalah:
1. Cek [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/overview)
2. Cek [Google Cloud Console](https://console.cloud.google.com/) untuk error logs
3. Pastikan billing account aktif dan tidak ada outstanding charges

### Security Best Practices

1. **Restrict API Key** - Selalu restrict API key ke domain yang diperlukan
2. **Monitor Usage** - Cek usage secara berkala di Google Cloud Console
3. **Use Environment Variables** - Jangan hardcode API key di source code
4. **Implement Caching** - Cache hasil geocoding untuk mengurangi API calls
5. **Error Handling** - Implement proper error handling untuk API failures 