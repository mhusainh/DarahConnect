import React from 'react';
import { useNotification } from '../hooks/useNotification';
import { 
  createSuccessNotification, 
  createErrorNotification,
  createNotificationWithLinks,
  createHtmlNotification 
} from '../components/Notification';

const NotificationExamples: React.FC = () => {
  const { addNotification } = useNotification();

  const showBasicNotification = () => {
    addNotification(createSuccessNotification(
      'Berhasil!',
      'Data telah berhasil disimpan ke database.'
    ));
  };

  const showNotificationWithAutoLinks = () => {
    addNotification(createHtmlNotification(
      'info',
      'Tautan Ditemukan',
      'Silakan kunjungi https://darahconnect.com untuk informasi lebih lanjut atau hubungi kami di https://wa.me/6281234567890'
    ));
  };

  const showNotificationWithCustomLinks = () => {
    addNotification(createNotificationWithLinks(
      'success',
      'Pendaftaran Berhasil!',
      'Terima kasih telah mendaftar sebagai donor. Berikut adalah langkah selanjutnya:',
      [
        { text: 'Lihat Profil', url: '/profile' },
        { text: 'Panduan Donor', url: '/donor-guide' },
        { text: 'Hubungi Admin', url: 'https://wa.me/6281234567890', external: true }
      ]
    ));
  };

  const showHealthPassportNotification = () => {
    addNotification({
      type: 'error',
      title: 'Health Passport Diperlukan',
      message: 'Anda belum memiliki health passport. Silakan lengkapi data kesehatan Anda terlebih dahulu.',
      links: [
        { text: 'Buat Health Passport', url: '/health-passport' },
        { text: 'Pelajari Lebih Lanjut', url: '/about-health-passport' }
      ],
      duration: 8000,
      persistent: false
    });
  };

  const showCampaignNotification = () => {
    addNotification({
      type: 'info',
      title: 'Kampanye Baru Tersedia',
      message: 'Ada kampanye donor darah darurat yang membutuhkan bantuan Anda.',
      links: [
        { text: 'Lihat Kampanye', url: '/campaigns' },
        { text: 'Daftar Sekarang', url: '/donor-registration' }
      ],
      actions: [
        { 
          label: 'Daftar Langsung', 
          onClick: () => window.location.href = '/donor-registration',
          variant: 'primary'
        }
      ],
      duration: 10000
    });
  };

  const showCertificateNotification = () => {
    addNotification({
      type: 'success',
      title: 'Sertifikat Siap Diunduh',
      message: 'Sertifikat donor darah Anda telah selesai diproses dan siap untuk diunduh.',
      links: [
        { text: 'Unduh Sertifikat', url: '/certificates/download/123' },
        { text: 'Lihat Riwayat', url: '/certificates' }
      ],
      persistent: true,
      sound: true
    });
  };

  const showErrorWithSupportLinks = () => {
    addNotification({
      type: 'error',
      title: 'Terjadi Kesalahan',
      message: 'Sistem mengalami gangguan. Silakan coba beberapa saat lagi atau hubungi support.',
      links: [
        { text: 'Hubungi Support', url: 'mailto:support@darahconnect.com', external: true },
        { text: 'Cek Status Server', url: '/status' },
        { text: 'Laporan Bug', url: '/report-bug' }
      ],
      actions: [
        { 
          label: 'Coba Lagi', 
          onClick: () => window.location.reload(),
          variant: 'primary'
        }
      ],
      duration: 15000
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Contoh Notifikasi Enhanced</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={showBasicNotification}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Notifikasi Dasar
        </button>

        <button
          onClick={showNotificationWithAutoLinks}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Auto-detect Links
        </button>

        <button
          onClick={showNotificationWithCustomLinks}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Custom Links
        </button>

        <button
          onClick={showHealthPassportNotification}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Health Passport Error
        </button>

        <button
          onClick={showCampaignNotification}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Kampanye Baru
        </button>

        <button
          onClick={showCertificateNotification}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Sertifikat Ready
        </button>

        <button
          onClick={showErrorWithSupportLinks}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Error dengan Support
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Cara Penggunaan:</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <strong>1. Notifikasi dengan Auto-detect Links:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2">
{`addNotification(createHtmlNotification(
  'info',
  'Tautan Ditemukan',
  'Kunjungi https://darahconnect.com untuk info lebih lanjut'
));`}
            </pre>
          </div>

          <div>
            <strong>2. Notifikasi dengan Custom Links:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2">
{`addNotification(createNotificationWithLinks(
  'success',
  'Berhasil!',
  'Data telah disimpan.',
  [
    { text: 'Lihat Profil', url: '/profile' },
    { text: 'Hubungi Admin', url: 'https://wa.me/...', external: true }
  ]
));`}
            </pre>
          </div>

          <div>
            <strong>3. Notifikasi Manual dengan Semua Opsi:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2">
{`addNotification({
  type: 'error',
  title: 'Error!',
  message: 'Terjadi kesalahan sistem.',
  links: [
    { text: 'Support', url: 'mailto:support@...', external: true }
  ],
  actions: [
    { label: 'Coba Lagi', onClick: () => retry(), variant: 'primary' }
  ],
  duration: 8000,
  persistent: false
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationExamples; 