# 🔗 Panduan Troubleshooting Wallet Connection

## Masalah Umum dan Solusi

### 1. ❌ MetaMask Tidak Terinstall

**Gejala:** Muncul pesan "MetaMask is not installed"

**Solusi:**
1. Klik tombol "Install MetaMask" di modal yang muncul
2. Atau kunjungi https://metamask.io/download/
3. Install extension sesuai browser Anda
4. Buat atau import wallet
5. Kembali ke aplikasi dan coba hubungkan lagi

### 2. ❌ User Rejected Connection

**Gejala:** Muncul pesan "Koneksi dibatalkan oleh user"

**Solusi:**
1. Pastikan Anda mengklik "Connect" di popup MetaMask
2. Jika popup tidak muncul, klik icon MetaMask di browser
3. Pastikan akun sudah dipilih di MetaMask
4. Coba refresh halaman dan hubungkan lagi

### 3. ❌ No Accounts Found

**Gejala:** "Gagal terhubung ke MetaMask. Pastikan akun sudah dipilih di MetaMask"

**Solusi:**
1. Buka MetaMask extension
2. Pastikan ada akun yang sudah dibuat
3. Jika belum ada akun, buat akun baru
4. Pastikan akun yang aktif (tidak terkunci)
5. Coba hubungkan lagi

### 4. ❌ Wrong Network

**Gejala:** Wallet terhubung tapi network tidak sesuai

**Solusi:**
1. Buka MetaMask
2. Klik dropdown network di bagian atas
3. Pilih network yang sesuai (Ethereum Mainnet, Sepolia, dll)
4. Konfirmasi pergantian network
5. Coba hubungkan lagi

### 5. ❌ API Connection Failed

**Gejala:** "MetaMask terhubung tetapi gagal sync ke server"

**Solusi:**
1. Periksa koneksi internet
2. Refresh halaman dan coba lagi
3. Periksa apakah backend server berjalan
4. Coba hubungkan lagi setelah beberapa saat

## 🔧 Debug Panel (Development Mode)

Jika Anda dalam mode development, akan muncul panel debug di pojok kanan bawah yang menampilkan:

- ✅ Status MetaMask (Installed/Not Installed)
- 🔗 Status Koneksi (Connected/Connecting/Disconnected)
- 👤 Account Address (jika terhubung)
- 🌐 Network Info (jika terhubung)
- 💰 Balance (jika terhubung)
- ❌ Error messages (jika ada)

### Tombol Debug:
- **Connect:** Coba hubungkan wallet
- **Disconnect:** Putuskan koneksi wallet
- **Reset All:** Reset semua state dan reload halaman

## 📋 Langkah-langkah Lengkap

### Untuk User Baru:
1. **Install MetaMask**
   - Kunjungi https://metamask.io/download/
   - Install extension sesuai browser
   - Restart browser jika diperlukan

2. **Setup Wallet**
   - Buka MetaMask extension
   - Klik "Create a new wallet" atau "Import wallet"
   - Ikuti instruksi untuk membuat/import wallet
   - Simpan seed phrase dengan aman

3. **Connect ke Aplikasi**
   - Kembali ke aplikasi
   - Klik "Hubungkan Wallet"
   - Konfirmasi di popup MetaMask
   - Pilih akun yang ingin digunakan

### Untuk User yang Sudah Punya MetaMask:
1. Pastikan MetaMask extension aktif
2. Pastikan akun sudah dipilih dan tidak terkunci
3. Klik "Hubungkan Wallet" di aplikasi
4. Konfirmasi koneksi di popup MetaMask

## 🚨 Troubleshooting Lanjutan

### Jika Modal Install Tidak Muncul:
1. Refresh halaman (F5)
2. Clear browser cache
3. Pastikan JavaScript enabled
4. Coba browser lain

### Jika Popup MetaMask Tidak Muncul:
1. Klik icon MetaMask di browser
2. Pastikan extension tidak diblokir
3. Cek popup blocker settings
4. Coba di tab baru

### Jika Koneksi Terputus Otomatis:
1. Periksa apakah MetaMask masih terbuka
2. Pastikan akun tidak terkunci
3. Cek apakah network berubah
4. Refresh halaman dan hubungkan lagi

## 📞 Bantuan Tambahan

Jika masalah masih berlanjut:

1. **Periksa Console Browser:**
   - Tekan F12 untuk buka Developer Tools
   - Lihat tab Console untuk error messages
   - Screenshot error untuk bantuan

2. **Periksa Network Tab:**
   - Lihat apakah API calls berhasil
   - Periksa response dari server

3. **Test di Browser Lain:**
   - Coba di Chrome, Firefox, atau Edge
   - Pastikan MetaMask terinstall di browser tersebut

4. **Reset Lengkap:**
   - Clear localStorage: `localStorage.clear()`
   - Refresh halaman
   - Hubungkan wallet dari awal

## 🔒 Keamanan

- **Jangan pernah share seed phrase** dengan siapapun
- **Jangan input seed phrase** di website yang mencurigakan
- **Selalu verifikasi URL** sebelum menginstall extension
- **Gunakan MetaMask resmi** dari https://metamask.io

---

**Catatan:** Panduan ini dibuat untuk membantu troubleshooting masalah wallet connection. Jika masalah masih berlanjut, silakan hubungi tim support. 