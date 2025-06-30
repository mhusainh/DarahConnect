// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SertifikatDonasi is Ownable {
    struct Sertifikat {
        uint256 id;
        address pendonor; // Alamat wallet penerima sertifikat
        string namaPendonor;
        uint256 tanggalDonasi;
        uint256 nomorSertifikat;
        string alamatPendonor;
        string penerbit;
        address adminVerifikator; // Alamat admin/backend yg memverifikasi
    }

    mapping(uint256 => Sertifikat) public daftarSertifikat;
    uint256 private _sertifikatCounter;

    event SertifikatDibuat(uint256 indexed id, address indexed pendonor, uint256 nomorSertifikat);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Fungsi untuk membuat sertifikat baru.
     * @param _pendonor Alamat wallet pengguna.
     * @param _namaPendonor Nama lengkap pengguna yang akan dicatat.
     * @param _nomorSertifikat Nomor unik sertifikat yang digenerate oleh backend.
     * @param _alamatPendonor Alamat lengkap pengguna yang akan dicatat.
     */
    function mintSertifikat(
        address _pendonor,
        string calldata _namaPendonor,
        uint256 _nomorSertifikat,
        string calldata _alamatPendonor // <-- DITAMBAHKAN: Parameter baru
    ) public onlyOwner {
        _sertifikatCounter++;
        uint256 newId = _sertifikatCounter;

        daftarSertifikat[newId] = Sertifikat({
            id: newId,
            pendonor: _pendonor,
            namaPendonor: _namaPendonor,
            nomorSertifikat: _nomorSertifikat,
            alamatPendonor: _alamatPendonor, // <-- DIPERBAIKI: Mengambil dari parameter
            penerbit: "DarahConnect",        // <-- DIPERBAIKI: Diisi dengan nilai tetap
            tanggalDonasi: block.timestamp,
            adminVerifikator: msg.sender
        });

        emit SertifikatDibuat(newId, _pendonor, _nomorSertifikat);
    }
}