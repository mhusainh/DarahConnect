import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshakeIcon, ArrowLeftIcon, ShieldCheckIcon, LockIcon } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <HeartHandshakeIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Kebijakan Privasi
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Perlindungan data pribadi dan medis Anda di DarahConnect
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">
                Kebijakan Privasi DarahConnect
              </h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm m-0">
                <strong>Terakhir diperbarui:</strong> {new Date().toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <LockIcon className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 text-sm m-0">
                  <strong>Komitmen Kami:</strong> Kami berkomitmen untuk melindungi informasi pribadi dan medis Anda 
                  dengan standar keamanan tertinggi.
                </p>
              </div>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Pengantar</h3>
              <p className="text-gray-700 mb-4">
                DarahConnect menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi yang Anda bagikan 
                dengan kami. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi 
                informasi Anda ketika menggunakan platform kami.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Informasi yang Kami Kumpulkan</h3>
              
              <h4 className="text-md font-semibold text-gray-800 mb-3">A. Informasi Pribadi</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Nama lengkap</li>
                <li>Alamat email</li>
                <li>Nomor telepon</li>
                <li>Tanggal lahir</li>
                <li>Jenis kelamin</li>
                <li>Alamat tempat tinggal</li>
                <li>Lokasi geografis</li>
              </ul>

              <h4 className="text-md font-semibold text-gray-800 mb-3">B. Informasi Medis</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Golongan darah</li>
                <li>Berat badan</li>
                <li>Riwayat donasi darah</li>
                <li>Status kesehatan terkait donor darah</li>
                <li>Hasil tes kesehatan (jika tersedia)</li>
              </ul>

              <h4 className="text-md font-semibold text-gray-800 mb-3">C. Informasi Teknis</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Alamat IP</li>
                <li>Jenis browser dan perangkat</li>
                <li>Data aktivitas di platform</li>
                <li>Preferensi notifikasi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Cara Kami Menggunakan Informasi</h3>
              <p className="text-gray-700 mb-4">
                Informasi yang kami kumpulkan digunakan untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Memfasilitasi proses donor darah dan permintaan darah</li>
                <li>Mencocokkan donor dengan penerima berdasarkan kompatibilitas</li>
                <li>Mengirim notifikasi tentang kebutuhan darah yang mendesak</li>
                <li>Menyediakan informasi kampanye donor darah</li>
                <li>Melacak riwayat donasi untuk keperluan kesehatan</li>
                <li>Meningkatkan layanan dan pengalaman pengguna</li>
                <li>Memenuhi kewajiban hukum dan regulasi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Berbagi Informasi</h3>
              <p className="text-gray-700 mb-4">
                Kami hanya membagikan informasi Anda dalam situasi berikut:
              </p>
              
              <h4 className="text-md font-semibold text-gray-800 mb-3">A. Dengan Persetujuan Anda</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Rumah sakit dan fasilitas kesehatan yang membutuhkan donor</li>
                <li>Penerima darah yang memerlukan donor spesifik</li>
                <li>Koordinator kampanye donor darah</li>
              </ul>

              <h4 className="text-md font-semibold text-gray-800 mb-3">B. Keperluan Hukum</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Penegakan hukum jika diwajibkan</li>
                <li>Perlindungan keamanan dan keselamatan</li>
                <li>Kepatuhan terhadap regulasi kesehatan</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm m-0">
                  <strong>Penting:</strong> Kami TIDAK PERNAH menjual informasi pribadi Anda kepada pihak ketiga 
                  untuk keperluan komersial.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Keamanan Data</h3>
              <p className="text-gray-700 mb-4">
                Kami menggunakan berbagai langkah keamanan untuk melindungi informasi Anda:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Enkripsi data end-to-end</li>
                <li>Akses terbatas berdasarkan peran</li>
                <li>Audit keamanan berkala</li>
                <li>Penyimpanan data di server yang aman</li>
                <li>Pemantauan aktivitas mencurigakan</li>
                <li>Backup data yang terencrypted</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Hak Anda</h3>
              <p className="text-gray-700 mb-4">
                Sebagai pengguna, Anda memiliki hak-hak berikut:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li><strong>Akses:</strong> Melihat informasi pribadi yang kami miliki</li>
                <li><strong>Koreksi:</strong> Memperbarui informasi yang tidak akurat</li>
                <li><strong>Penghapusan:</strong> Meminta penghapusan data pribadi</li>
                <li><strong>Pembatasan:</strong> Membatasi penggunaan data tertentu</li>
                <li><strong>Portabilitas:</strong> Meminta copy data dalam format yang dapat dibaca</li>
                <li><strong>Penolakan:</strong> Menolak penggunaan data untuk tujuan tertentu</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Penyimpanan Data</h3>
              <p className="text-gray-700 mb-4">
                Data Anda akan disimpan selama:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Akun aktif: Selama Anda menggunakan layanan</li>
                <li>Riwayat medis: Sesuai regulasi kesehatan (biasanya 7 tahun)</li>
                <li>Data teknis: Maksimal 2 tahun</li>
                <li>Setelah penghapusan akun: Data akan dihapus dalam 30 hari</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Cookies dan Teknologi Pelacakan</h3>
              <p className="text-gray-700 mb-4">
                Kami menggunakan cookies untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Menjaga sesi login Anda</li>
                <li>Mengingat preferensi Anda</li>
                <li>Menganalisis penggunaan platform</li>
                <li>Meningkatkan keamanan</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Anda dapat mengatur preferensi cookies melalui pengaturan browser Anda.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Pengguna di Bawah Umur</h3>
              <p className="text-gray-700 mb-4">
                Layanan kami ditujukan untuk pengguna berusia 17 tahun ke atas. Jika Anda berusia 17-18 tahun, 
                pastikan untuk mendapatkan persetujuan orang tua atau wali sebelum menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">10. Perubahan Kebijakan</h3>
              <p className="text-gray-700 mb-4">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan material akan 
                diberitahukan melalui:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Notifikasi di platform</li>
                <li>Email ke alamat yang terdaftar</li>
                <li>Banner pengumuman</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">11. Kontak Kami</h3>
              <p className="text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak-hak Anda, 
                silakan hubungi kami:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 m-0">
                  <strong>Email:</strong> privacy@darahconnect.com<br />
                  <strong>Data Protection Officer:</strong> dpo@darahconnect.com<br />
                  <strong>Phone:</strong> +62 21 1234 5678<br />
                  <strong>Address:</strong> Jakarta, Indonesia
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">12. Dasar Hukum</h3>
              <p className="text-gray-700 mb-4">
                Kebijakan privasi ini dibuat berdasarkan:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Undang-Undang Perlindungan Data Pribadi Indonesia</li>
                <li>Peraturan Menteri Kesehatan tentang Donor Darah</li>
                <li>Regulasi internasional terkait perlindungan data</li>
                <li>Standar industri keamanan informasi</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Link
            to="/register"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Kembali ke Pendaftaran
          </Link>
          
          <Link
            to="/terms"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Lihat Syarat & Ketentuan →
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 