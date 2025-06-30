# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## Dokumentasi Smart Contract: SertifikatDonasi

**Alamat di Sepolia:** `0x...AlamatKontrakAnda...`

### Fungsi: `mintSertifikat(address _pendonor)`
- **Deskripsi:** Membuat sertifikat baru untuk seorang pendonor.
- **Parameter:**
  - `_pendonor` (tipe: `address`): Alamat wallet Ethereum milik pengguna yang telah mendonor.
- **Catatan:** Fungsi ini hanya bisa dipanggil oleh pemilik kontrak (wallet backend).
