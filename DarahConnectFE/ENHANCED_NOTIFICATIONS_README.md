# 🔔 Enhanced Notification System - DarahConnect

Sistem notifikasi yang telah disempurnakan dengan berbagai fitur canggih untuk meningkatkan pengalaman pengguna.

## ✨ Fitur Utama

### 🎨 Visual & Animasi
- **Animasi Smooth**: Slide-in dan fade out dengan transisi yang halus
- **Progress Bar**: Indikator visual durasi notifikasi
- **Gradient Background**: Background gradien yang menarik untuk setiap tipe
- **Responsive Design**: Desain yang responsif untuk berbagai ukuran layar
- **Stacking Effect**: Efek tumpuk dengan scaling untuk notifikasi multiple

### 🔊 Audio & Interaktivity  
- **Sound Effects**: Efek suara berbeda untuk setiap tipe notifikasi
- **Hover to Pause**: Jeda otomatis saat mouse hover
- **Action Buttons**: Tombol aksi untuk interaksi pengguna
- **Persistent Mode**: Notifikasi yang tetap muncul sampai ditutup manual

### 📍 Posisi & Layout
- **Multiple Positions**: 6 posisi berbeda (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
- **Max Notifications**: Batas maksimal notifikasi yang ditampilkan
- **Queue System**: Sistem antrian untuk notifikasi berlebih
- **Auto-cleanup**: Pembersihan otomatis notifikasi lama

## 🎯 Tipe Notifikasi

### 1. Success (✅)
```typescript
showSuccess('Operasi Berhasil', 'Data telah berhasil diproses');
```
- Warna: Hijau
- Durasi default: 4 detik
- Suara: Nada tinggi (800Hz)

### 2. Error (❌)
```typescript
showError('Terjadi Kesalahan', 'Koneksi ke server terputus');
```
- Warna: Merah
- Durasi default: 6 detik
- Suara: Nada rendah (300Hz)

### 3. Warning (⚠️)
```typescript
showWarning('Peringatan', 'Ruang penyimpanan hampir penuh');
```
- Warna: Kuning/Orange
- Durasi default: 5 detik
- Suara: Nada sedang (600Hz)

### 4. Info (ℹ️)
```typescript
showInfo('Informasi', 'Sistem akan maintenance dalam 30 menit');
```
- Warna: Biru
- Durasi default: 4 detik
- Suara: Nada info (500Hz)

## 🚀 Cara Penggunaan

### Basic Usage
```typescript
import { useNotificationContext } from '../contexts/NotificationContext';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();
  
  const handleSuccess = () => {
    showSuccess('Berhasil!', 'Operasi telah selesai');
  };
  
  return <button onClick={handleSuccess}>Show Notification</button>;
};
```

### Advanced Usage with Actions
```typescript
const { showWithActions } = useNotificationContext();

const showUpdateNotification = () => {
  showWithActions(
    'info',
    'Update Tersedia',
    'Versi baru aplikasi telah tersedia. Apakah Anda ingin mengupdate sekarang?',
    [
      {
        label: 'Update Sekarang',
        onClick: () => startUpdate(),
        variant: 'primary'
      },
      {
        label: 'Nanti Saja',
        onClick: () => dismissUpdate(),
        variant: 'secondary'
      }
    ]
  );
};
```

### Quick Notification Patterns
```typescript
import { useQuickNotifications } from '../contexts/NotificationContext';

const MyComponent = () => {
  const notifications = useQuickNotifications();
  
  const handleSave = async () => {
    try {
      await saveData();
      notifications.saveSuccess('Profil');
    } catch (error) {
      notifications.saveError(error.message);
    }
  };
  
  // Pola umum lainnya:
  // notifications.deleteSuccess('Kampanye');
  // notifications.updateSuccess('Data');
  // notifications.networkError();
  // notifications.unauthorized();
  // notifications.validationError('Email sudah terdaftar');
};
```

### Persistent Notifications
```typescript
const { showPersistent } = useNotificationContext();

const showOfflineNotification = () => {
  showPersistent(
    'warning',
    'Mode Offline',
    'Aplikasi berjalan dalam mode offline. Beberapa fitur mungkin tidak tersedia.'
  );
};
```

## ⚙️ Konfigurasi

### Provider Setup
```typescript
import { NotificationProvider } from '../contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider
      position="top-right"
      maxNotifications={5}
      defaultDuration={5000}
      enableSounds={true}
      enableProgress={true}
    >
      <YourApp />
    </NotificationProvider>
  );
}
```

### Custom Notification Options
```typescript
showSuccess('Title', 'Message', {
  duration: 8000,
  persistent: false,
  dismissible: true,
  showProgress: true,
  sound: true,
  actions: [
    {
      label: 'Action',
      onClick: () => console.log('clicked'),
      variant: 'primary'
    }
  ]
});
```

## 📊 Statistik & Monitoring

```typescript
const { stats } = useNotificationContext();

console.log({
  total: stats.total,              // Total notifikasi aktif
  success: stats.byType.success,   // Jumlah notifikasi success
  error: stats.byType.error,       // Jumlah notifikasi error
  warning: stats.byType.warning,   // Jumlah notifikasi warning
  info: stats.byType.info,         // Jumlah notifikasi info
  queued: stats.queued             // Notifikasi dalam antrian
});
```

## 🎛️ Management Functions

```typescript
const { 
  clearAll,      // Hapus semua notifikasi
  clearByType,   // Hapus berdasarkan tipe
  pauseAll,      // Jeda semua notifikasi
  resumeAll      // Lanjutkan semua notifikasi
} = useNotificationContext();

// Contoh penggunaan
clearByType('error');  // Hapus semua notifikasi error
pauseAll();           // Jeda semua notifikasi
resumeAll();          // Lanjutkan semua notifikasi
clearAll();           // Hapus semua notifikasi
```

## 🔧 API Integration

Sistem notifikasi terintegrasi otomatis dengan API calls:

```typescript
// Notifikasi otomatis untuk API calls
await postApi('/users', userData);
// ✅ Otomatis menampilkan: "Menyimpan Berhasil - Data berhasil diproses"

// Error handling otomatis
try {
  await getApi('/protected-route');
} catch (error) {
  // ❌ Otomatis menampilkan error dengan pesan dari backend
}
```

## 🎨 Customization

### Custom Notification Messages
```typescript
import { NotificationMessages } from '../utils/notification';

// Gunakan pesan yang sudah didefinisikan
const { title, message } = NotificationMessages.auth.loginSuccess;
showSuccess(title, message);

// Atau pesan custom
showError('Custom Error', 'This is a custom error message');
```

### Custom Styling
Notifikasi menggunakan Tailwind CSS dan dapat dikustomisasi melalui:
- Modifikasi typeConfig di `Notification.tsx`
- Override CSS classes
- Mengubah durasi dan animasi

## 📱 Responsive Behavior

- **Desktop**: Notifikasi muncul di pojok dengan full width
- **Mobile**: Otomatis menyesuaikan lebar layar
- **Tablet**: Optimal spacing dan sizing

## 🔊 Sound System

Sistem audio menggunakan Web Audio API dengan fallback:
- Setiap tipe notifikasi memiliki frekuensi unik
- Volume dan durasi dapat dikustomisasi
- Graceful degradation untuk browser yang tidak support

## 📈 Performance Optimization

- **Lazy Loading**: Component dimuat saat dibutuhkan
- **Memory Management**: Auto-cleanup untuk mencegah memory leak
- **Queue System**: Mencegah spam notifikasi
- **Efficient Rendering**: Minimal re-renders dengan React optimization

## 🧪 Testing & Debugging

```typescript
// Debug mode
localStorage.setItem('NOTIFICATION_DEBUG', 'true');

// Test all notification types
showBasicNotifications();
showActionNotifications();
showPersistentNotifications();
showQuickNotifications();
```

## 📚 Examples

Lihat file `src/examples/ApiExamples.tsx` untuk contoh penggunaan lengkap:
- Basic notification types
- Notifications with actions
- Persistent notifications
- Quick notification patterns
- API integration examples

## 🚨 Best Practices

1. **Jangan spam notifikasi** - Gunakan queue system dan batasi jumlah maksimal
2. **Pesan yang jelas** - Gunakan bahasa yang mudah dipahami
3. **Durasi yang tepat** - Error lebih lama, success lebih singkat
4. **Sound feedback** - Gunakan dengan bijak, bisa dimatikan user
5. **Action buttons** - Hanya untuk aksi yang benar-benar penting
6. **Persistent** - Hanya untuk pesan yang sangat penting

## 🔄 Migration Guide

Jika sebelumnya menggunakan sistem notifikasi lama:

```typescript
// Lama
toast.success('Success message');

// Baru
showSuccess('Success Title', 'Success message');

// Atau dengan quick patterns
notifications.saveSuccess('Data');
```

## 🐛 Troubleshooting

### Notifikasi tidak muncul
- Pastikan `NotificationProvider` ada di root aplikasi
- Check console untuk error messages
- Pastikan context digunakan dalam component tree

### Sound tidak terdengar
- Check browser permission untuk audio
- Pastikan `enableSounds` tidak false
- Test di browser yang support Web Audio API

### Performance issues
- Kurangi `maxNotifications`
- Matikan `showProgress` jika tidak diperlukan
- Gunakan `clearAll()` secara berkala

---

## 🎉 Kesimpulan

Sistem notifikasi yang telah disempurnakan ini memberikan:
- **User Experience** yang lebih baik dengan animasi dan feedback
- **Developer Experience** yang mudah dengan API yang intuitif  
- **Performance** yang optimal dengan optimization yang tepat
- **Flexibility** dalam kustomisasi dan konfigurasi

Nikmati pengalaman notifikasi yang lebih baik! 🚀 