import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AwardIcon, UploadCloudIcon, FileTextIcon, CheckCircle2Icon, ImageIcon, FileIcon } from 'lucide-react';
import Header from '../components/Header';
interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
}

interface BloodDonation {
  id: number;
  donation_date: string;
  blood_type: string;
  status: string;
  url_file: string;
  hospital: Hospital;
  created_at: string;
  updated_at: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700 border-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const BloodDonationHistoryPage: React.FC = () => {
  const { get, put, post } = useApi<any>();
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [printCertificate, setPrintCertificate] = useState(false);
  const [bloodType, setBloodType] = useState('');
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    const res = await get('/user/blood-donations');
    if (res.success) {
      setDonations(res.data || []);
    } else {
      setError(res.error || 'Gagal memuat data');
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedId) return;
    if (!bloodType) {
      setError('Golongan darah wajib dipilih.');
      return;
    }
    setUploading(true);
    setSuccessMsg('');
    setError('');
    const donation = donations.find(d => d.id === selectedId);
    if (!donation) {
      setError('Data donor tidak ditemukan');
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append('hospital_id', String(donation.hospital?.id || ''));
    formData.append('registration_id', String((donation as any).registration_id || ''));
    formData.append('donation_date', donation.donation_date);
    formData.append('blood_type', bloodType);
    formData.append('status', printCertificate ? 'pending' : 'completed');
    formData.append('image', file);
    const res = await post('/blood-donation', formData);
    if (res.success) {
      setSuccessMsg('Bukti berhasil diupload!');
      setFile(null);
      setSelectedId(null);
      setPrintCertificate(false);
      setBloodType('');
      fetchDonations();
    } else {
      setError(res.error || 'Gagal upload bukti');
    }
    setUploading(false);
  };

  const renderFilePreview = (url: string) => {
    if (!url) return null;
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={url} alt="Bukti Donor" className="w-20 h-20 object-cover rounded shadow border" />;
    }
    if (url.match(/\.pdf$/i)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-blue-600 hover:underline">
          <FileIcon className="w-10 h-10 mb-1" />
          <span className="text-xs">Lihat PDF</span>
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-blue-600 hover:underline">
        <FileTextIcon className="w-10 h-10 mb-1" />
        <span className="text-xs">Lihat File</span>
      </a>
    );
  };

  return (
    <>
    <Header />
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-2">
        <AwardIcon className="w-8 h-8 text-primary-600" />
        <h2 className="text-2xl font-bold">Riwayat Donor Darah Saya</h2>
      </div>
      <p className="text-gray-500 mb-8">Lihat riwayat donor darah Anda dan upload bukti donor untuk mendapatkan badge & sertifikat digital.</p>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : donations.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Belum ada riwayat donor darah.</p>
          <p className="text-gray-400 text-sm">Ayo mulai donor darah dan dapatkan badge digital!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg text-gray-900">{donation.hospital?.name || '-'}</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">ID #{donation.id}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{donation.hospital?.address}, {donation.hospital?.city}, {donation.hospital?.province}</div>
                <div className="flex flex-wrap gap-4 text-sm mt-2">
                  <div>Tanggal Donor: <b>{donation.donation_date !== '0001-01-01T00:00:00Z' ? new Date(donation.donation_date).toLocaleDateString() : '-'}</b></div>
                  <div>Golongan Darah: <b>{donation.blood_type || '-'}</b></div>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${statusColor(donation.status)}`}>Status: {donation.status}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 min-w-[140px]">
                {donation.url_file ? (
                  <div className="flex flex-col items-center gap-2">
                    {renderFilePreview(donation.url_file)}
                    <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle2Icon className="w-4 h-4" /> Bukti Terkirim</span>
                  </div>
                ) : (
                  <>
                    <button
                      className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700 flex items-center gap-2 shadow transition"
                      onClick={() => setSelectedId(donation.id)}
                    >
                      <UploadCloudIcon className="w-5 h-5" /> Upload Bukti
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload Bukti */}
      {selectedId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><UploadCloudIcon className="w-5 h-5" /> Upload Bukti Donor Darah</h3>
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="mb-4" />
            <div className="mb-4">
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah <span className="text-red-500">*</span></label>
              <select
                id="bloodType"
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Golongan Darah</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="printCertificate"
                checked={printCertificate}
                onChange={e => setPrintCertificate(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="printCertificate" className="text-sm text-gray-700 select-none cursor-pointer">
                Saya ingin mencetak sertifikat digital donor darah
              </label>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                onClick={handleUpload}
                disabled={uploading || !file}
              >
                {uploading ? 'Mengupload...' : (<><UploadCloudIcon className="w-4 h-4" /> Upload</>)}
              </button>
              <button
                className="px-5 py-2 border rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setSelectedId(null); setFile(null); setPrintCertificate(false); setBloodType(''); }}
                disabled={uploading}
              >
                Batal
              </button>
            </div>
            {successMsg && <div className="text-green-600 mt-3">{successMsg}</div>}
            {error && <div className="text-red-600 mt-3">{error}</div>}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default BloodDonationHistoryPage; 