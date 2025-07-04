import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshakeIcon, ArrowLeftIcon, FileTextIcon } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <HeartHandshakeIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Syarat dan Ketentuan
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Kebijakan penggunaan platform DarahConnect
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <div className="flex items-center mb-6">
              <FileTextIcon className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">
                Syarat dan Ketentuan Penggunaan DarahConnect
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

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Penerimaan Syarat</h3>
              <p className="text-gray-700 mb-4">
                Dengan menggunakan platform DarahConnect, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. 
                Jika Anda tidak setuju dengan syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Tentang Layanan</h3>
              <p className="text-gray-700 mb-4">
                DarahConnect adalah platform yang menghubungkan pendonor darah dengan penerima yang membutuhkan. 
                Layanan kami mencakup:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Pendaftaran dan manajemen profil donor</li>
                <li>Permintaan darah dari rumah sakit dan individu</li>
                <li>Sistem notifikasi untuk kebutuhan darah mendesak</li>
                <li>Kampanye donor darah</li>
                <li>Tracking riwayat donasi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Syarat Pendaftaran</h3>
              <p className="text-gray-700 mb-4">
                Untuk menggunakan layanan DarahConnect, Anda harus:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Berusia minimal 17 tahun dan maksimal 65 tahun</li>
                <li>Memiliki berat badan minimal 45 kg</li>
                <li>Dalam kondisi kesehatan yang baik</li>
                <li>Memberikan informasi yang akurat dan lengkap</li>
                <li>Memiliki alamat email yang valid</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Kewajiban Pengguna</h3>
              <p className="text-gray-700 mb-4">
                Sebagai pengguna DarahConnect, Anda berkomitmen untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Memberikan informasi kesehatan yang akurat</li>
                <li>Mematuhi prosedur donor darah yang berlaku</li>
                <li>Tidak memberikan informasi palsu atau menyesatkan</li>
                <li>Menjaga kerahasiaan akun dan password Anda</li>
                <li>Menghormati privasi pengguna lain</li>
                <li>Menggunakan platform sesuai dengan tujuan yang dimaksudkan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Tanggung Jawab Medis</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm m-0">
                  <strong>Penting:</strong> DarahConnect adalah platform penghubung. Kami tidak bertanggung jawab 
                  atas keputusan medis atau kondisi kesehatan donor dan penerima.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Konsultasi dengan tenaga medis profesional sebelum mendonor</li>
                <li>Prosedur donor darah harus dilakukan di fasilitas kesehatan yang bersertifikat</li>
                <li>Pengguna bertanggung jawab atas kondisi kesehatan mereka sendiri</li>
                <li>DarahConnect tidak menjamin kompatibilitas atau keamanan transfusi darah</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Privasi dan Data</h3>
              <p className="text-gray-700 mb-4">
                Kami menghormati privasi Anda. Informasi pribadi dan medis Anda akan dijaga kerahasiaannya 
                sesuai dengan <Link to="/privacy" className="text-primary-600 hover:underline">Kebijakan Privasi</Link> kami.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Pembatasan Layanan</h3>
              <p className="text-gray-700 mb-4">
                Kami berhak untuk membatasi atau menghentikan layanan jika:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Pengguna melanggar syarat dan ketentuan</li>
                <li>Terdapat aktivitas yang mencurigakan atau berbahaya</li>
                <li>Diperlukan untuk pemeliharaan sistem</li>
                <li>Diwajibkan oleh hukum yang berlaku</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Perubahan Syarat</h3>
              <p className="text-gray-700 mb-4">
                Kami dapat mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan 
                melalui platform atau email. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan 
                terhadap syarat yang baru.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Hukum yang Berlaku</h3>
              <p className="text-gray-700 mb-4">
                Syarat dan ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia. 
                Setiap sengketa akan diselesaikan melalui jalur hukum yang berlaku.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">10. Kontak</h3>
              <p className="text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 m-0">
                  <strong>Email:</strong> support@darahconnect.com<br />
                  <strong>Phone:</strong> +62 21 1234 5678<br />
                  <strong>Address:</strong> Jakarta, Indonesia
                </p>
              </div>
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
            to="/privacy"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Lihat Kebijakan Privasi →
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

export default TermsPage; 