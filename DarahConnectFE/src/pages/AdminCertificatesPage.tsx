import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  Eye, 
  Clock, 
  AlertTriangle,
  Database,
  User,
  Calendar,
  Heart,
  Download,
  FileText
} from 'lucide-react';
import { AdminCertificateCard } from '../components/ui/CertificateComponents';
import AdminLayout from '../components/AdminLayout';
import { useApi } from '../hooks/useApi';

interface Certificate {
  id: string;
  donorName: string;
  bloodType: string;
  donationDate: string;
  status: string;
  hospitalName: string;
  urlFile?: string;
}

const AdminCertificatesPage: React.FC = () => {
  const { get, put } = useApi<any>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    setError('');
    const res = await get('/blood-donations');
    if (res.success && Array.isArray(res.data)) {
      const mapped = res.data.map((item: any) => ({
        id: String(item.id),
        donorName: item.registration?.user?.name || '-',
        bloodType: item.blood_type || '-',
        donationDate: item.donation_date ? item.donation_date.split('T')[0] : '-',
        status: item.status || '-',
        hospitalName: item.hospital?.name || '-',
        urlFile: item.url_file || '',
      }));
      setCertificates(mapped);
    } else {
      setError(res.error || 'Gagal memuat data');
    }
    setLoading(false);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return {
      total: certificates.length,
      pending: certificates.filter(c => c.status === 'pending').length,
      approved: certificates.filter(c => c.status === 'completed').length,
      rejected: certificates.filter(c => c.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  // Approve handler
  const handleApprove = async (id: string) => {
    setApprovingId(id);
    await put(`/blood-donation/${id}/status`, { status: 'completed' });
    setApprovingId(null);
    fetchCertificates();
  };

  return (
    <AdminLayout title="Kelola Sertifikat" subtitle="Review dan approve sertifikat donor darah">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sertifikat</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Award className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari donor atau ID sertifikat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="completed">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading & Error State */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat data sertifikat...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <>
            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((certificate) => (
                <div key={certificate.id} className="bg-white p-6 rounded-xl shadow border flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-6 w-6 text-red-500" />
                    <span className="font-bold text-lg">{certificate.donorName}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Rumah Sakit: {certificate.hospitalName}</div>
                  <div className="flex flex-wrap gap-4 text-sm mb-2">
                    <div>ID: <b>{certificate.id}</b></div>
                    <div>Golongan Darah: <b>{certificate.bloodType}</b></div>
                    <div>Tanggal Donor: <b>{certificate.donationDate}</b></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${certificate.status === 'completed' ? 'bg-green-100 text-green-700' : certificate.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{certificate.status}</span>
                    {certificate.urlFile && (
                      <a href={certificate.urlFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Lihat Bukti</a>
                    )}
                    {certificate.status === 'pending' && (
                      <button
                        className="ml-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-semibold flex items-center gap-2 disabled:opacity-60"
                        onClick={() => handleApprove(certificate.id)}
                        disabled={approvingId === certificate.id}
                      >
                        {approvingId === certificate.id ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        ) : 'Approve'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredCertificates.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada sertifikat</h3>
                <p className="text-gray-500">Tidak ada sertifikat yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCertificatesPage; 