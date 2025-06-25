# MetaMask Integration Documentation

## Overview
Aplikasi DarahConnect sekarang telah diintegrasikan dengan MetaMask untuk memungkinkan donasi menggunakan cryptocurrency (ETH). 

## Fitur yang Telah Ditambahkan

### 1. Komponen MetaMask
- **`MetaMaskWallet`**: Komponen untuk koneksi dan menampilkan status wallet
- **`CryptoDonationModal`**: Modal untuk melakukan donasi crypto
- **`useMetaMask`**: Hook untuk mengelola koneksi dan transaksi MetaMask

### 2. Hook useMetaMask
Hook ini menyediakan:
- Deteksi instalasi MetaMask
- Koneksi/diskoneksi wallet
- Monitoring perubahan akun dan network
- Fungsi untuk mengirim transaksi
- Pengelolaan state wallet (balance, network, dll)

### 3. Integrasi UI
- Tombol "Connect Wallet" di Header
- Tombol "Donasi dengan Crypto" di setiap Campaign Card
- Modal donasi crypto dengan form lengkap
- Tampilan status transaksi dan konfirmasi

## Cara Penggunaan

### 1. Koneksi Wallet
- User mengklik tombol "Connect Wallet" di Header
- MetaMask akan meminta izin untuk koneksi
- Setelah terhubung, akan menampilkan alamat wallet dan balance

### 2. Donasi Crypto
- User mengklik "Donasi dengan Crypto" pada campaign yang diinginkan
- Modal akan terbuka dengan form donasi
- User memasukkan jumlah ETH dan informasi donor
- Konfirmasi transaksi di MetaMask
- Sistem akan menampilkan status transaksi

### 3. Network Support
- Ethereum Mainnet
- Sepolia Testnet
- Polygon Mainnet
- Polygon Mumbai Testnet

## Dependencies
- `ethers`: Library untuk interaksi dengan blockchain Ethereum
- `lucide-react`: Icons untuk UI

## Struktur File Baru
```
src/
├── hooks/
│   ├── useMetaMask.ts
│   └── index.ts
├── components/
│   ├── MetaMaskWallet.tsx
│   └── CryptoDonationModal.tsx
└── types/
    └── index.ts (updated with wallet types)
```

## Konfigurasi

### Environment Variables (Opsional)
Untuk production, tambahkan environment variables:
```
REACT_APP_DEFAULT_RECIPIENT_ADDRESS=0x...
REACT_APP_SUPPORTED_NETWORKS=1,137,11155111,80001
```

### Alamat Penerima
Saat ini menggunakan alamat contoh. Untuk production, ubah `recipientAddress` di `CryptoDonationModal.tsx` dengan alamat wallet organisasi yang sesungguhnya.

## Testing

### Test dengan Testnet
1. Pastikan MetaMask terhubung ke Sepolia atau Mumbai testnet
2. Dapatkan test ETH dari faucet:
   - Sepolia: https://sepoliafaucet.com/
   - Mumbai: https://faucet.polygon.technology/
3. Coba lakukan donasi dengan jumlah kecil

### Local Development
1. Install MetaMask browser extension
2. Buat atau import wallet test
3. Connect ke testnet
4. Test semua fitur wallet

## Security Considerations

1. **Private Key Safety**: Aplikasi tidak pernah mengakses private key user
2. **Transaction Verification**: Semua transaksi dikonfirmasi melalui MetaMask
3. **Network Detection**: Sistem mendeteksi dan menampilkan network yang digunakan
4. **Error Handling**: Comprehensive error handling untuk semua kasus edge

## Future Enhancements

1. **Multi-Wallet Support**: Integrasi dengan WalletConnect untuk wallet lain
2. **Token Support**: Dukungan untuk token ERC-20 (USDC, USDT, dll)
3. **Smart Contract**: Implementasi smart contract untuk transparansi donasi
4. **Receipt Generation**: Generate receipt otomatis untuk donasi crypto
5. **Tax Integration**: Integrasi dengan sistem pajak untuk crypto donations

## Troubleshooting

### Common Issues
1. **MetaMask not detected**: Pastikan MetaMask terinstall dan enabled
2. **Transaction failed**: Periksa balance dan gas fee
3. **Wrong network**: Switch ke network yang supported
4. **Connection timeout**: Refresh page dan coba lagi

### Error Codes
- `4001`: User rejected transaction
- `4902`: Network not added to MetaMask
- `-32603`: Internal JSON-RPC error

## Support
Untuk pertanyaan atau issues, hubungi tim development DarahConnect. 