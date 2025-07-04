# 🏥 Hospital Search Feature

## Overview
Fitur pencarian rumah sakit otomatis menggunakan Google Places API yang memungkinkan admin untuk mencari dan menambahkan rumah sakit dengan mudah. Data rumah sakit akan otomatis terisi berdasarkan hasil pencarian.

## 🔧 Setup Requirements

### 1. Environment Configuration
Pastikan file `.env` memiliki konfigurasi berikut:

```bash
# Google Maps API Configuration (Required)
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### 2. Google Cloud Console Setup

#### Step 1: Enable Required APIs
Di Google Cloud Console, enable APIs berikut:
- ✅ **Maps JavaScript API**
- ✅ **Places API** 
- ✅ **Geocoding API**

#### Step 2: Configure API Key
- Buat API Key di Google Cloud Console
- Set restrictions ke domain yang sesuai
- Pastikan API Key memiliki akses ke semua APIs yang diperlukan

## 🚀 How It Works

### 1. Auto-Location Detection Process

1. **Location Request**: System meminta permission akses lokasi user
2. **Coordinates**: Menggunakan browser `navigator.geolocation` API
3. **Reverse Geocoding**: Convert coordinates ke alamat menggunakan Google Maps API
4. **Location Parsing**: Extract provinsi dan kota dari alamat
5. **Auto-Filter**: Filter hasil rumah sakit berdasarkan lokasi user

### 2. Hospital Search Process

1. **User Input**: Admin mengetik nama rumah sakit (minimal 3 karakter)
2. **API Call**: System memanggil Google Places Autocomplete API dengan filter:
   - `types: ['hospital', 'health']`
   - `componentRestrictions: { country: 'id' }`
   - **Location bias**: Prioritas hasil berdasarkan lokasi user
3. **Results Display**: Menampilkan dropdown dengan hasil pencarian
4. **Auto-Fill**: Ketika user memilih hasil, semua data otomatis terisi

### 3. Data Auto-Fill Process

Ketika user memilih rumah sakit dari hasil pencarian:

```javascript
// Data yang otomatis terisi:
- name: "RS Cipto Mangunkusumo"
- address: "Jl. Diponegoro No.71, Kenari, Senen, Jakarta Pusat"
- latitude: -6.1944
- longitude: 106.8229
- province: "jakarta" (auto-parsed from address)
- city: "jak-pusat" (auto-parsed from address)

// Location context (jika auto-detection enabled):
- userLocation: { latitude: -6.2, longitude: 106.8, province: "DKI Jakarta", city: "Jakarta" }
- distance: "2.5 km dari lokasi Anda" (calculated)
```

### 4. Address Parsing Algorithm

System menggunakan algoritma parsing untuk mencocokkan alamat dengan data provinsi/kota Indonesia:

```javascript
const parseAddressToProvinceCity = (address) => {
  // 1. Convert address to lowercase
  // 2. Loop through provinsiData to find match
  // 3. Loop through kotaData to find match  
  // 4. Return matched province and city IDs
}
```

## 📱 User Experience

### Search Flow:
1. **Input**: User mengetik "rs cipto jakarta"
2. **Loading**: Spinner menunjukkan proses pencarian
3. **Results**: Dropdown menampilkan hasil relevan
4. **Selection**: User klik hasil yang diinginkan
5. **Auto-Fill**: Semua field terisi otomatis
6. **Map Update**: Peta otomatis menuju lokasi yang dipilih

### Features:
- ✅ **Auto-Location Detection** (detect user's current location)
- ✅ **Debounced Search** (300ms delay)
- ✅ **Loading States** with spinner
- ✅ **Click Outside to Close** dropdown
- ✅ **Focus to Reopen** dropdown jika ada results
- ✅ **Auto Map Update** dengan marker positioning
- ✅ **Province/City Auto-Matching** dengan data Indonesia

## 🔍 Search Examples

| Input | Results |
|-------|---------|
| `rs cipto` | RS Cipto Mangunkusumo, RS Cipto Diponegoro, dll |
| `rumah sakit jakarta` | Semua RS di Jakarta |
| `rs hasan sadikin` | RS Hasan Sadikin Bandung |
| `siloam` | Semua RS Siloam di Indonesia |

## 🛠️ Troubleshooting

### Issue: Search tidak muncul hasil
**Solution:**
- Pastikan Google Places API sudah enabled
- Check API Key permissions
- Pastikan koneksi internet stabil
- Coba dengan keyword yang lebih spesifik

### Issue: Province/City tidak terisi otomatis
**Solution:**
- Check data wilayahIndonesia.ts
- Alamat mungkin tidak sesuai format standar
- Manual input tetap tersedia sebagai fallback

### Issue: Map tidak update
**Solution:**
- Pastikan Google Maps JavaScript API enabled
- Check browser console untuk errors
- Restart development server

## 🎯 Benefits

1. **Faster Data Entry**: Tidak perlu manual input semua field
2. **Accurate Coordinates**: Langsung dari Google Places database
3. **Consistent Formatting**: Alamat menggunakan format standar Google
4. **Better UX**: Search experience yang familiar untuk user
5. **Error Reduction**: Mengurangi typo dan kesalahan input

## 🔮 Future Enhancements

- [ ] Hospital photos from Google Places
- [ ] Hospital ratings and reviews
- [ ] Operating hours information
- [ ] Contact information (phone, website)
- [ ] Specialty services information
- [ ] Nearby hospitals suggestions 