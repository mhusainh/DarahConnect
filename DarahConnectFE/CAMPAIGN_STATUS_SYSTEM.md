# Campaign Status System Documentation

## Overview
Sistem status campaign yang dinamis untuk menampilkan status campaign dan permintaan darah berdasarkan progress donor dan deadline, serta menonaktifkan pendaftaran jika sudah penuh atau berakhir.

## Features Implemented

### 1. Dynamic Status System
- **Status berdasarkan progress**: Campaign/permintaan dengan progress 100% otomatis berstatus "Selesai"
- **Status berdasarkan deadline**: Campaign/permintaan yang melewati deadline otomatis berstatus "Berakhir"
- **Status berdasarkan urgensi**: Campaign aktif menampilkan status berdasarkan tingkat urgensi
- **Visual indicators**: Warna dan emoji berbeda untuk setiap status

### 2. Disabled State Logic
- **Progress 100%**: Tombol donor dinonaktifkan, tidak bisa mendaftar lagi
- **Deadline terlewat**: Tombol donor dinonaktifkan, campaign berakhir
- **Visual feedback**: Opacity berkurang, tombol abu-abu, cursor not-allowed
- **Tooltip information**: Pesan informatif saat hover pada tombol yang dinonaktifkan

### 3. Enhanced Visual Design
- **Progress bar warna hijau**: Untuk campaign yang sudah mencapai 100%
- **Completion overlay**: Overlay dengan emoji dan status pada gambar campaign
- **Status banners**: Banner informatif untuk campaign yang selesai/berakhir
- **Color-coded status**: Warna berbeda untuk setiap status campaign

## Implementation Details

### Status Calculation Logic

#### For CampaignsPage
```typescript
const getCampaignStatus = (campaign: BloodCampaign) => {
  const now = new Date();
  const deadline = new Date(campaign.deadline);
  const progress = (campaign.currentDonors / campaign.targetDonors) * 100;
  
  // Check if campaign is completed (100% donors reached)
  if (progress >= 100) {
    return {
      text: 'Selesai',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      disabled: true
    };
  }
  
  // Check if deadline has passed
  if (now > deadline) {
    return {
      text: 'Berakhir',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      disabled: true
    };
  }
  
  // Active campaign status based on urgency
  if (campaign.urgencyLevel === 'critical') {
    return {
      text: 'Sangat Mendesak',
      color: 'bg-red-100 text-red-800 border-red-200',
      disabled: false
    };
  }
  
  // Default active status
  return {
    text: 'Aktif',
    color: 'bg-green-100 text-green-800 border-green-200',
    disabled: false
  };
};
```

#### For BloodRequestDetailPage
```typescript
const getBloodRequestStatus = () => {
  const now = new Date();
  const deadline = new Date(bloodRequest.deadline);
  
  // Check if request is completed (100% donors reached)
  if (progress >= 100) {
    return {
      text: 'Selesai - Target Terpenuhi',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      disabled: true
    };
  }
  
  // Check if deadline has passed
  if (now > deadline) {
    return {
      text: 'Berakhir - Deadline Terlewat',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      disabled: true
    };
  }
  
  // Active request status
  return {
    text: 'Aktif - Membutuhkan Donor',
    color: 'bg-green-100 text-green-800 border-green-200',
    disabled: false
  };
};
```

## Visual Components

### 1. Campaign Cards (CampaignsPage)

#### Status Badge
- **Location**: Bottom of campaign card
- **Dynamic color**: Berdasarkan status campaign
- **Text**: Status sesuai kondisi campaign

#### Progress Bar
- **Color**: Hijau untuk 100%, merah untuk belum selesai
- **Text**: Menampilkan "✓ Terpenuhi" jika sudah 100%
- **Celebration message**: "🎉 Target donor telah tercapai!"

#### Image Overlay
- **Completion overlay**: Overlay semi-transparan dengan emoji dan status
- **Icons**: ✅ untuk selesai, ⏰ untuk berakhir
- **Text**: "SELESAI" atau "BERAKHIR"

#### Action Buttons
- **Disabled state**: Tombol donor berubah abu-abu dan tidak bisa diklik
- **Tooltip**: Informasi mengapa tombol dinonaktifkan
- **Text**: "Selesai" untuk tombol yang dinonaktifkan

### 2. Blood Request Detail Page

#### Hero Section
- **Background gradient**: Abu-abu untuk yang sudah selesai/berakhir
- **Completion overlay**: Overlay tengah dengan status dan icon
- **Target indicator**: Kotak target dengan border hijau jika tercapai

#### Status Banner
- **Location**: Di bawah progress bar
- **Color-coded**: Sesuai status permintaan
- **Information**: Detail status dan keterangan

#### Progress Bar
- **Enhanced design**: Warna hijau untuk 100%, text hijau untuk angka
- **Completion message**: "🎉 Target donor telah tercapai!"
- **Status text**: "✓ Terpenuhi" untuk yang sudah selesai

#### Action Button
- **Disabled state**: Abu-abu dan tidak bisa diklik
- **Dynamic text**: "Target Tercapai" atau "Tidak Dapat Donor"
- **Tooltip**: Penjelasan mengapa tidak bisa donor

### 3. Information Notices

#### Campaign Completion Notice
```typescript
{isDisabled && (
  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-center space-x-2">
      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-yellow-800">
          {progress >= 100 ? 'Campaign Selesai' : 'Campaign Berakhir'}
        </p>
        <p className="text-xs text-yellow-700">
          {progress >= 100 ? 'Target donor tercapai' : 'Deadline terlewat'}
        </p>
      </div>
    </div>
  </div>
)}
```

## Status Types

### 1. Active Statuses
- **Aktif**: Campaign normal yang masih berjalan
- **Sangat Mendesak**: Campaign dengan urgency level critical
- **Mendesak**: Campaign dengan urgency level high
- **Sedang**: Campaign dengan urgency level medium

### 2. Inactive Statuses
- **Selesai**: Target donor 100% tercapai
- **Berakhir**: Deadline sudah terlewat
- **Tidak Aktif**: Status umum untuk campaign yang tidak dapat menerima donor

## Color Scheme

### Status Colors
- **Selesai**: `bg-blue-100 text-blue-800 border-blue-200`
- **Berakhir**: `bg-gray-100 text-gray-800 border-gray-200`
- **Sangat Mendesak**: `bg-red-100 text-red-800 border-red-200`
- **Mendesak**: `bg-orange-100 text-orange-800 border-orange-200`
- **Aktif**: `bg-green-100 text-green-800 border-green-200`

### Progress Colors
- **Complete**: `bg-gradient-to-r from-green-500 to-green-600`
- **In Progress**: `bg-gradient-to-r from-red-500 to-red-600`
- **Text Complete**: `text-green-600`
- **Text Progress**: `text-gray-900`

## User Experience Enhancements

### 1. Clear Visual Feedback
- **Immediate recognition**: User langsung tahu status campaign
- **Consistent design**: Warna dan style yang konsisten
- **Accessibility**: Contrast ratio yang baik untuk semua warna

### 2. Informative Messages
- **Contextual tooltips**: Penjelasan mengapa tombol dinonaktifkan
- **Completion celebrations**: Pesan positif untuk campaign yang berhasil
- **Clear status indicators**: Status yang jelas dan mudah dipahami

### 3. Prevented User Frustration
- **No wasted effort**: User tidak bisa mendaftar pada campaign yang sudah selesai
- **Clear expectations**: User tahu apa yang bisa dan tidak bisa dilakukan
- **Helpful guidance**: Informasi yang membantu user memahami situasi

## Testing Scenarios

### Test Cases
1. **Campaign dengan progress 100%**
   - ✅ Status badge "Selesai"
   - ✅ Progress bar hijau dengan teks "✓ Terpenuhi"
   - ✅ Tombol donor dinonaktifkan
   - ✅ Overlay "SELESAI" pada gambar
   - ✅ Pesan "Target donor telah tercapai"

2. **Campaign dengan deadline terlewat**
   - ✅ Status badge "Berakhir"
   - ✅ Tombol donor dinonaktifkan
   - ✅ Overlay "BERAKHIR" pada gambar
   - ✅ Background hero section abu-abu

3. **Campaign aktif dengan urgensi tinggi**
   - ✅ Status badge "Sangat Mendesak" (merah)
   - ✅ Tombol donor aktif
   - ✅ Progress bar merah normal
   - ✅ Semua fungsi normal

4. **Campaign aktif normal**
   - ✅ Status badge "Aktif" (hijau)
   - ✅ Tombol donor aktif
   - ✅ Progress bar merah normal
   - ✅ Semua fungsi normal

## Future Improvements

### 1. Additional Status Types
- **Paused**: Campaign yang dijeda sementara
- **Cancelled**: Campaign yang dibatalkan
- **Extended**: Campaign yang diperpanjang deadlinenya

### 2. Enhanced Notifications
- **Email notifications**: Pemberitahuan saat campaign selesai
- **Push notifications**: Notifikasi real-time
- **SMS alerts**: Pesan singkat untuk update penting

### 3. Analytics Integration
- **Completion rate tracking**: Persentase campaign yang berhasil
- **Time to completion**: Waktu rata-rata untuk mencapai target
- **User engagement metrics**: Interaksi user dengan campaign

### 4. Advanced Features
- **Auto-extension**: Perpanjangan otomatis untuk campaign mendesak
- **Overflow handling**: Sistem untuk menangani donor berlebih
- **Priority queue**: Sistem prioritas untuk campaign mendesak

---

**Note**: Sistem ini meningkatkan user experience dengan memberikan feedback yang jelas dan mencegah user melakukan tindakan yang tidak valid pada campaign yang sudah selesai atau berakhir. 