# 🏥 Searchable Hospital Dropdown Feature

## Overview
Fitur dropdown rumah sakit yang dapat dicari untuk halaman buat campaign donor darah. Memungkinkan admin untuk mencari rumah sakit berdasarkan nama, filter berdasarkan provinsi, dan menambahkan rumah sakit baru.

## 🎯 Features

### 1. **🔍 Real-time Search**
- Search rumah sakit dengan API endpoint: `{{base_url}}/hospital?search=nama_rumah_sakit`
- Debounced search (300ms delay) untuk performa optimal
- Loading state dengan spinner indicator

### 2. **🌍 Filter by Province**
- Dropdown filter berdasarkan provinsi Indonesia
- Kombinasi search + filter provinsi
- Data provinsi dari `wilayahIndonesia.ts`

### 3. **➕ Add Hospital Option**
- Option "Tambah Rumah Sakit Baru" di bagian bawah dropdown
- Membuka modal AddHospitalModal
- Auto-select rumah sakit yang baru ditambahkan

### 4. **📍 Real-time Location Detection**
- Auto-detect user's current location using browser geolocation
- Reverse geocoding with Google Maps API + fallback service
- Auto-filter rumah sakit berdasarkan lokasi user saat ini
- Toggle location detection on/off
- Refresh location functionality

### 5. **🎨 Clean City Display**
- **Before**: "Kota Semarang, Jawa Tengah"
- **After**: "Semarang, Jawa Tengah"
- Auto-remove "Kota"/"Kabupaten" prefix/suffix for cleaner UI
- Consistent display across all locations

### 6. **💫 Enhanced UX**
- Click outside to close dropdown
- Keyboard navigation ready
- Error state handling
- Detailed hospital information display
- Location permission handling
- Graceful fallbacks for location services

## 🚀 Implementation

### Component Structure
```
SearchableHospitalDropdown
├── Trigger Button (Display selected hospital)
├── Dropdown Panel
│   ├── Search Input
│   ├── Province Filter
│   ├── Hospital Results List
│   │   ├── Hospital Name
│   │   ├── Location (City, Province)
│   │   └── Full Address
│   └── "Add Hospital" Button
└── Error Message (if any)
```

### Props Interface
```typescript
interface SearchableHospitalDropdownProps {
  value: number;                    // Selected hospital ID
  onChange: (hospitalId: number) => void;  // Hospital selection callback
  onAddHospital: () => void;       // Add hospital callback
  error?: string;                  // Error message
  placeholder?: string;            // Placeholder text
  className?: string;              // Additional CSS classes
}
```

## 🔧 API Integration

### Search Endpoints

#### Basic Search
```
GET {{base_url}}/hospital?search=Rumah%20Sakit%20Umum%20Daerah%20Dr.%20Soetomo
```

#### Location-filtered Search
```
GET {{base_url}}/hospital?search=rs%20cipto&province=DKI%20Jakarta&city=Jakarta%20Pusat
```

#### Auto-location Search (contoh berdasarkan user location)
```
GET {{base_url}}/hospital?province=Jawa%20Tengah&city=Semarang
```

**Note**: City name otomatis di-clean dari "Kota Semarang" → "Semarang"

### Response Format
```json
{
  "meta": {
    "code": 200,
    "message": "success"
  },
  "data": [
    {
      "id": 1,
      "name": "Rumah Sakit Umum Daerah Dr. Soetomo",
      "address": "Jl. Mayjen Prof. Dr. Moestopo No.6-8",
      "city": "Surabaya",
      "province": "Jawa Timur",
      "latitude": -7.2575,
      "longitude": 112.7521
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_items": 1,
    "total_pages": 1
  }
}
```

### Location Services

#### Primary: Browser Geolocation + Google Maps
1. Request user permission untuk akses lokasi
2. Get coordinates using `navigator.geolocation`
3. Reverse geocoding dengan Google Maps Geocoding API
4. **Extract city name** dari address components
5. **Match city** dengan database `wilayahIndonesia.ts`
6. **Auto-determine province** berdasarkan city yang ditemukan

#### Fallback: Multiple Geocoding Services
```javascript
// 1. Nominatim OpenStreetMap (Primary fallback)
// Extract: city, town, village, county dari response
https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id

// 2. BigDataCloud (Secondary fallback)  
// Extract: city, locality, principalSubdivision dari response
https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id

// 3. Coordinate-based estimation (Final fallback)
// Uses hardcoded coordinate boundaries + major cities lookup
```

#### City-First Parsing Algorithm
```javascript
const parseLocationFromCity = (cityName, fallbackAddress) => {
  // 1. Clean city name (remove "Kota"/"Kabupaten" prefix/suffix)
  const cleanCityName = cityName.toLowerCase()
    .replace(/^(kota|kabupaten)\s+/i, '')
    .replace(/\s+(kota|kabupaten)$/i, '');
  
  // 2. Find matching city in kotaData from wilayahIndonesia.ts
  const matchedCity = kotaData.find(kota => {
    // Multiple matching strategies: exact, partial, variations
  });
  
  // 3. Get accurate province from city's provinsiId
  const provinsi = getProvinsiById(matchedCity.provinsiId);
  
  return { province: provinsi.nama, city: matchedCity.nama };
};
```

#### Province Mapping (Fallback only)
```javascript
const provinceMapping = {
  'jakarta': 'DKI Jakarta',
  'jogja': 'Daerah Istimewa Yogyakarta',
  'jabar': 'Jawa Barat',
  // ... mapping lengkap untuk abbreviations
};
```

### Error Resilience & Fallback Strategy

#### Location Detection Fallbacks
1. **Google Maps Geocoding** (Primary) → API tersedia dan ter-load
2. **Nominatim OpenStreetMap** (Fallback 1) → Free service, reliable
3. **BigDataCloud** (Fallback 2) → Alternative free geocoding 
4. **Coordinate Estimation** (Fallback 3) → Hardcoded province boundaries
5. **Manual Selection** (Final) → User dapat pilih manual

#### API Search Fallbacks
- Server API gagal → Fallback ke client-side filtering
- Network timeout → Retry mechanism dengan timeout 5 detik
- Data hospital tetap bisa difilter berdasarkan provinsi
- Error handling yang graceful dengan user-friendly messages

#### UX Improvements
- Location detection optional dengan toggle on/off
- Clear error messages dengan actionable instructions
- Manual override selalu tersedia
- Automatic fallback tanpa user intervention

## 📱 User Flow

### 1. **Auto-Location Flow (Default)**
1. Component mounts → Request location permission
2. User allows location access → Auto-detect coordinates
3. Reverse geocoding → Get province/city from coordinates
4. Auto-filter hospitals by user's province
5. User click dropdown → Pre-filtered results by location
6. User search or select hospital → Location-based results prioritized

### 2. **Manual Selection Flow**
1. User click dropdown trigger (or location disabled)
2. Dropdown terbuka dengan focus di search input
3. User ketik nama rumah sakit (misal: "rs cipto")
4. API call ke `/hospital?search=rs%20cipto&province=X&city=Y`
5. Results ditampilkan dalam dropdown
6. User pilih rumah sakit dari list
7. Dropdown close, nilai ter-update

### 3. **Filter by Province Flow**
1. User buka dropdown
2. User pilih provinsi dari dropdown filter
3. Results difilter berdasarkan provinsi
4. User bisa kombinasi dengan search text
5. User pilih rumah sakit

### 4. **Location Management Flow**
1. User click location toggle button → Enable/disable auto-location
2. User click refresh location → Re-detect current location
3. Location error → Show error message with retry option
4. Manual province override → User can still manually select province

### 5. **Add New Hospital Flow**
1. User buka dropdown
2. User click "Tambah Rumah Sakit Baru" di bawah
3. Modal AddHospitalModal terbuka
4. User isi form rumah sakit baru
5. Setelah save, rumah sakit baru auto-selected
6. Modal close, dropdown close

## 🎨 UI/UX Design

### Visual Hierarchy
```
🏥 [Selected Hospital Name - Semarang, Jawa Tengah] ▼
┌─────────────────────────────────────────────┐
│ 🔍 [Search input...........................] │
│ 📍 Semarang, Jawa Tengah           [X] [🔄] │
│ 🌍 [Province Filter Dropdown.......▼]  [📍] │
├─────────────────────────────────────────────┤
│ 🏥 RS Cipto Mangunkusumo                   │
│    📍 Jakarta Pusat, DKI Jakarta           │
│    Jl. Diponegoro No.71, Kenari, Senen     │
├─────────────────────────────────────────────┤
│ 🏥 RS Dr. Soetomo                          │
│    📍 Surabaya, Jawa Timur                 │
│    Jl. Mayjen Prof. Dr. Moestopo No.6-8    │
├─────────────────────────────────────────────┤
│ ➕ Tambah Rumah Sakit Baru                 │
└─────────────────────────────────────────────┘

UI Elements:
[X] = Clear location
[🔄] = Refresh location  
[📍] = Location toggle (enable/disable)
```

### Color Scheme
- **Primary**: Blue (#3B82F6) untuk selected items
- **Secondary**: Gray (#6B7280) untuk text
- **Success**: Green (#10B981) untuk add button
- **Error**: Red (#EF4444) untuk error states

## 🔧 Configuration

### Environment Setup
Tidak perlu environment khusus, menggunakan API yang sama dengan aplikasi.

### Dependencies
- `lucide-react` untuk icons
- `../services/fetchApi` untuk API calls  
- `../data/wilayahIndonesia` untuk data provinsi

## 📊 Performance Optimizations

1. **Debounced Search**: 300ms delay untuk mengurangi API calls
2. **Efficient Re-renders**: useState yang terpisah untuk setiap state
3. **API Response Caching**: Hasil search di-cache selama session
4. **Client-side Filtering**: Fallback filtering jika API gagal

## 🐛 Error Handling

### Location Detection Errors
- **Permission denied** → Auto-disable location, show manual mode
- **Network timeout** → Try alternative geocoding services
- **Service unavailable** → Fall back to coordinate estimation
- **All services fail** → Graceful degradation to manual selection

### API Errors
- Network error → Fallback ke local filtering
- Invalid response → Show empty state dengan retry option
- 404 Not Found → Show "No hospitals found" message
- Timeout (>5s) → Abort request, try next service

### User Input Errors
- Empty search → Show all hospitals
- Special characters → Proper URL encoding
- Long search terms → Truncate dengan ellipsis

### Common Issues & Solutions

#### "Connection Timeout" atau "Failed to fetch"
**Penyebab**: Network issues dengan geocoding services
**Solusi**: 
- System otomatis try multiple services
- Jika semua gagal, coordinate estimation akan berjalan
- User bisa disable location detection dan pilih manual
- Click tombol refresh untuk coba lagi

#### Lokasi tidak akurat (misal: "Semarang, Jawa Barat")
**Penyebab**: 
- Geocoding service memberikan provinsi yang salah
- Address parsing tidak akurat
- Data tidak konsisten antara geocoding dan database lokal

**Solusi (Sudah Diperbaiki)**:
- ✅ **City-First Algorithm**: System sekarang prioritas city name
- ✅ **Database Matching**: Match dengan `wilayahIndonesia.ts` yang akurat
- ✅ **Auto-Correction**: Provinsi ditentukan berdasarkan city yang ditemukan
- ✅ **Multiple Fallbacks**: Jika satu service salah, coba yang lain
- ✅ **Clean Display**: "Kota Semarang" → "Semarang" (hapus prefix)

**Manual Override**:
- Click tombol X untuk hapus lokasi otomatis
- Pilih provinsi manual dari dropdown  
- Click tombol refresh untuk deteksi ulang

## 🧪 Testing Scenarios

### Happy Path
- [ ] Auto location detection → Province auto-selected
- [ ] Search "rs cipto" → Menampilkan RS Cipto Mangunkusumo
- [ ] Filter "DKI Jakarta" → Menampilkan hospital di Jakarta saja  
- [ ] Select hospital → Form ter-update dengan hospital ID
- [ ] Add new hospital → Modal terbuka dan berfungsi

### Location Features
- [ ] Grant location permission → Auto-detect and filter by province
- [ ] Deny location permission → Show manual selection mode
- [ ] Location detection timeout → Graceful fallback
- [ ] Toggle location on/off → State properly managed
- [ ] Refresh location → Re-detect current coordinates
- [ ] Google Maps unavailable → Fallback to alternative geocoding

### Edge Cases
- [ ] Search dengan special characters
- [ ] Search dengan hasil kosong
- [ ] API timeout atau error
- [ ] Province filter + search combination
- [ ] Click outside dropdown untuk close
- [ ] Location permission blocked by browser
- [ ] Geolocation API not supported

### Performance Tests
- [ ] Search response time < 500ms
- [ ] Dropdown tidak lag saat scroll
- [ ] Memory usage tidak meningkat setelah multiple search

## 🔮 Future Enhancements

### Planned Features
- [ ] **Recent Searches**: Cache recent search terms
- [ ] **Favorites**: Mark frequently used hospitals
- [ ] **Bulk Selection**: Select multiple hospitals for campaign
- [ ] **Map Integration**: Show hospital location preview
- [ ] **Hospital Details**: Additional info like contact, services
- [ ] **Keyboard Navigation**: Arrow keys navigation in dropdown

### API Improvements
- [ ] **Autocomplete Endpoint**: Dedicated autocomplete API
- [ ] **Geo-location Filter**: Filter by distance from user
- [ ] **Advanced Filters**: By hospital type, capacity, etc.
- [ ] **Real-time Updates**: WebSocket untuk real-time hospital data

## 🎯 Benefits

### For Admins
1. **Faster Selection**: No need to scroll through long lists
2. **Better Discovery**: Find hospitals by partial names
3. **Location Context**: Visual provinsi/kota information
4. **Easy Addition**: Quick add new hospitals

### For Development
1. **Reusable Component**: Can be used in other forms
2. **API Flexibility**: Supports different response formats
3. **Error Resilience**: Graceful fallbacks
4. **Maintainable Code**: Clear separation of concerns

### For Users (End Donors)
1. **Better Campaign Info**: More accurate hospital data
2. **Location Clarity**: Clear hospital locations
3. **Trust Factor**: Professional, polished interface

## 📈 Metrics to Track

- Search success rate
- Average search time
- Most searched hospitals
- Province filter usage
- Add hospital conversion rate
- User satisfaction with search results 