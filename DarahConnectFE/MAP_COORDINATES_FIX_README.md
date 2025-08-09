# Map Coordinates Fix Documentation

## Masalah yang Ditemukan

Sebelumnya, ketika mengklik tombol "Lihat Detail Rumah Sakit" di halaman detail permintaan darah atau campaign, pin map yang ditampilkan tidak sesuai dengan latitude dan longitude yang seharusnya. Masalah ini terjadi karena:

1. **Koordinat Hardcode**: Koordinat latitude dan longitude di-hardcode dengan nilai `-6.2088` dan `106.8456` yang merupakan koordinat Manggarai, Jakarta.

2. **Data Tidak Sesuai**: Data rumah sakit yang ditampilkan memiliki alamat "Pondok Cina, Kecamatan Beji, Kota Depok, Jawa Barat" tetapi koordinat yang digunakan adalah koordinat Manggarai, Jakarta.

3. **Kehilangan Informasi Koordinat**: Adapter `campaignAdapter.ts` mengkonversi data API dari objek `Hospital` lengkap menjadi string, sehingga kehilangan informasi koordinat.

## Solusi yang Diterapkan

### 1. Memperbaiki Campaign Adapter

File: `src/services/campaignAdapter.ts`

- Menambahkan properti `hospitalCoordinates` untuk menyimpan informasi koordinat rumah sakit
- Mempertahankan data koordinat dari API response

```typescript
// Preserve hospital coordinates for map functionality
hospitalCoordinates: apiCampaign.hospital ? {
  latitude: apiCampaign.hospital.latitude,
  longitude: apiCampaign.hospital.longitude,
  city: apiCampaign.hospital.city,
  province: apiCampaign.hospital.province,
  address: apiCampaign.hospital.address
} : null,
```

### 2. Memperbarui Tipe Data

File: `src/types.ts`

- Menambahkan properti `hospitalCoordinates` ke interface `BloodCampaign`

```typescript
// Hospital coordinates for map functionality
hospitalCoordinates?: {
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  address: string;
} | null;
```

### 3. Menggunakan Koordinat yang Sebenarnya

File: `src/pages/BloodRequestDetailPage.tsx` dan `src/pages/CampaignDetailPage.tsx`

- Menggunakan koordinat dari API response jika tersedia
- Menambahkan fallback coordinates yang sesuai dengan alamat rumah sakit

```typescript
latitude: bloodRequest.hospitalCoordinates?.latitude || getFallbackCoordinates(bloodRequest.location).latitude,
longitude: bloodRequest.hospitalCoordinates?.longitude || getFallbackCoordinates(bloodRequest.location).longitude,
```

### 4. Implementasi Fallback Coordinates

- **Depok**: `-6.4025, 106.7942` (sesuai dengan alamat "Pondok Cina, Depok")
- **Jakarta**: `-6.2088, 106.8456` (untuk alamat yang mengandung "Jakarta")
- **Default**: Menggunakan koordinat Depok karena sebagian besar rumah sakit berada di area Depok

## Cara Kerja Solusi

1. **Data dari API**: Ketika data campaign/permintaan darah diambil dari API, informasi koordinat rumah sakit disimpan dalam properti `hospitalCoordinates`.

2. **Fallback Logic**: Jika koordinat tidak tersedia dari API, sistem akan menggunakan fungsi `getFallbackCoordinates()` yang menganalisis alamat untuk menentukan koordinat yang sesuai.

3. **Map Display**: `HospitalDetailModal` akan menampilkan pin map pada koordinat yang benar, baik dari API maupun dari fallback coordinates.

## Keuntungan Solusi

1. **Akurasi**: Pin map sekarang menampilkan lokasi yang sesuai dengan alamat rumah sakit
2. **Fleksibilitas**: Mendukung berbagai lokasi rumah sakit dengan fallback coordinates yang tepat
3. **Maintainability**: Kode lebih mudah dipelihara dengan pemisahan logika koordinat yang jelas
4. **User Experience**: Pengguna mendapatkan informasi lokasi yang akurat dan dapat dipercaya

## Rekomendasi untuk Pengembangan Selanjutnya

1. **Geocoding Service**: Implementasikan layanan geocoding untuk mengkonversi alamat menjadi koordinat secara otomatis
2. **Database Update**: Pastikan semua data rumah sakit di database memiliki koordinat yang akurat
3. **Validation**: Tambahkan validasi untuk memastikan koordinat yang diberikan sesuai dengan alamat rumah sakit
4. **Caching**: Implementasikan caching untuk koordinat yang sering digunakan

## File yang Dimodifikasi

- `src/services/campaignAdapter.ts`
- `src/types.ts`
- `src/pages/BloodRequestDetailPage.tsx`
- `src/pages/CampaignDetailPage.tsx`

## Testing

Untuk memverifikasi perbaikan:

1. Buka halaman detail permintaan darah atau campaign
2. Klik tombol "Lihat Detail Rumah Sakit"
3. Periksa apakah pin map menampilkan lokasi yang sesuai dengan alamat rumah sakit
4. Verifikasi bahwa koordinat yang ditampilkan sesuai dengan lokasi yang sebenarnya
