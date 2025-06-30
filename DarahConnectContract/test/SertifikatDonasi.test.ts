import { expect } from "chai";
import { ethers } from "hardhat";

describe("SertifikatDonasi", function () {
  it("Should mint a new certificate and assign it to the donor", async function () {
    // Dapatkan beberapa alamat wallet untuk testing
    const [owner, donor] = await ethers.getSigners();

    // Deploy kontrak
    const SertifikatDonasiFactory = await ethers.getContractFactory("SertifikatDonasi");
    const sertifikatDonasi = await SertifikatDonasiFactory.deploy();

    // Siapkan data dummy untuk semua parameter
    const dummyNama = "Budi Donor";
    const dummyNomorSertifikat = 9001;
    const dummyAlamat = "Jl. Kebaikan No. 123, Jakarta"; // <-- DITAMBAHKAN: Data baru
    
    // Panggil fungsi mintSertifikat dengan EMPAT parameter
    await sertifikatDonasi.connect(owner).mintSertifikat(
      donor.address,
      dummyNama,
      dummyNomorSertifikat,
      dummyAlamat // <-- DITAMBAHKAN: Argumen ke-empat
    );

    // Periksa hasilnya
    const sertifikat = await sertifikatDonasi.daftarSertifikat(1);
    
    // Verifikasi semua data
    expect(sertifikat.id).to.equal(1);
    expect(sertifikat.pendonor).to.equal(donor.address);
    expect(sertifikat.namaPendonor).to.equal(dummyNama);
    expect(sertifikat.nomorSertifikat).to.equal(dummyNomorSertifikat);
    expect(sertifikat.alamatPendonor).to.equal(dummyAlamat); // <-- DITAMBAHKAN: Pengecekan baru
    expect(sertifikat.penerbit).to.equal("DarahConnect");   // <-- DITAMBAHKAN: Pengecekan untuk penerbit
  });
});