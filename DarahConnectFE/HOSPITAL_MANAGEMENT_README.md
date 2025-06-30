# Hospital Management dengan Google Maps Integration

## Overview
Fitur ini memungkinkan pengguna untuk menambah rumah sakit baru ketika membuat blood request atau campaign. Fitur ini mengintegrasikan Google Maps untuk memilih lokasi yang tepat dan menggunakan data wilayah Indonesia untuk dropdown provinsi dan kota.

## Features
- ✅ Modal untuk menambah rumah sakit baru
- ✅ Integrasi Google Maps untuk pemilihan lokasi
- ✅ Dropdown provinsi dan kota menggunakan data wilayah Indonesia
- ✅ Reverse geocoding untuk mendapatkan alamat berdasarkan koordinat
- ✅ Search lokasi berdasarkan nama dan alamat rumah sakit
- ✅ Auto-update dropdown rumah sakit setelah menambah rumah sakit baru
- ✅ Implementasi di CreateBloodRequestPage dan CreateCampaignPage

## Setup Google Maps API

### 1. Dapatkan Google Maps API Key
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable APIs berikut:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### 2. Setup Environment Variable
Tambahkan variabel berikut ke file `.env` Anda:

```bash
# Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Restrict API Key (Recommended)
Untuk keamanan, restrict API key Anda:
1. Di Google Cloud Console → Credentials
2. Edit API key
3. Set "Application restrictions" ke "HTTP referrers"
4. Tambahkan domain aplikasi Anda

## API Endpoint

### POST /hospital
Endpoint untuk menambah rumah sakit baru.

**Request Body:**
```json
{
  "name": "Dummy Hospital Name",
  "address": "123 Main Street",
  "city": "Dummy City",
  "province": "Dummy Province",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Dummy Hospital Name",
    "address": "123 Main Street",
    "city": "Dummy City",
    "province": "Dummy Province",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Components

### AddHospitalModal
Modal component untuk menambah rumah sakit baru dengan fitur:
- Form input nama rumah sakit
- Dropdown provinsi dan kota (data wilayah Indonesia)
- Input alamat lengkap
- Google Maps integration dengan marker yang bisa di-drag
- Search lokasi berdasarkan nama dan alamat
- Display koordinat real-time

**Props:**
```typescript
interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHospitalAdded: (hospital: HospitalData) => void;
}
```

## Usage

### Di CreateBloodRequestPage
1. User memilih rumah sakit dari dropdown
2. Jika tidak ada rumah sakit yang sesuai, pilih "+ Tambah Rumah Sakit Baru"
3. Modal akan terbuka dengan form dan Google Maps
4. Setelah submit, rumah sakit baru otomatis terpilih

### Di CreateCampaignPage
1. Sama seperti di CreateBloodRequestPage
2. Dropdown rumah sakit menggantikan input text yang lama
3. Integrasi yang seamless dengan flow create campaign

## Alur Penggunaan

### 1. Pilih Rumah Sakit
```jsx
<select onChange={handleHospitalChange}>
  <option value="">Pilih Rumah Sakit</option>
  {hospitals.map((hospital) => (
    <option key={hospital.id} value={hospital.id}>
      {hospital.name} - {hospital.city}, {hospital.province}
    </option>
  ))}
  <option value="add-new">+ Tambah Rumah Sakit Baru</option>
</select>
```

### 2. Modal Tambah Rumah Sakit
- Isi nama rumah sakit
- Pilih provinsi → otomatis update dropdown kota
- Pilih kota
- Isi alamat lengkap
- Klik "Cari Lokasi di Maps" atau klik langsung di map
- Drag marker untuk menyesuaikan lokasi
- Submit form

### 3. Integration dengan Forms
```jsx
const handleHospitalAdded = (newHospital: Hospital) => {
  setHospitals(prev => [...prev, newHospital]);
  setFormData(prev => ({ ...prev, hospital_id: newHospital.id }));
  setIsAddHospitalModalOpen(false);
  notifications.success('Berhasil!', 'Rumah sakit baru telah ditambahkan');
};
```

## Data Wilayah Indonesia
Menggunakan data dari `src/data/wilayahIndonesia.ts`:
- 34 provinsi
- Ratusan kota/kabupaten
- Relasi provinsi-kota yang tepat
- Format yang consistent

## Error Handling
- Validasi form yang komprehensif
- Loading states untuk API calls
- Error messages yang informatif
- Fallback jika Google Maps gagal load

## Performance Considerations
- Lazy loading Google Maps script
- Efficient re-rendering dengan useCallback
- Memory cleanup saat modal close
- Optimized API calls

## Browser Support
- Modern browsers yang mendukung ES6+
- Google Maps JavaScript API
- Geolocation API (optional)

## Troubleshooting

### Google Maps tidak muncul
1. Pastikan API key valid dan ter-enable
2. Check console untuk error messages
3. Pastikan domain ter-whitelist di Google Cloud Console

### API calls gagal
1. Check network connectivity
2. Verify API endpoint availability
3. Check API key permissions

### Dropdown provinsi/kota kosong
1. Pastikan file `wilayahIndonesia.ts` ter-import dengan benar
2. Check data structure di file tersebut

## Future Enhancements
- [ ] Auto-complete untuk nama rumah sakit
- [ ] Validasi duplikasi rumah sakit
- [ ] Bulk import rumah sakit dari file
- [ ] Rating dan review rumah sakit
- [ ] Integration dengan sistem mapping yang lebih advanced 