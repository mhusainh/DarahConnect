import React, { useState } from 'react';
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

interface Certificate {
  id: string;
  donorName: string;
  donorId: string;
  bloodType: string;
  donationDate: string;
  donationCount: number;
  certificateId: string;
  blockchainId: string;
  type: 'main' | 'achievement';
  title: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

const AdminCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      donorName: 'Ahmad Suryadi',
      donorId: 'DONOR-001',
      bloodType: 'O+',
      donationDate: '2024-01-15',
      donationCount: 12,
      certificateId: 'CERT-2024-001',
      blockchainId: 'BC-CERT-0x9F8E7D6C5B4A',
      type: 'main',
      title: 'Sertifikat Donor Darah',
      approvalStatus: 'pending',
      submittedAt: '2024-01-16T10:30:00Z'
    },
    {
      id: '2',
      donorName: 'Siti Nurhaliza',
      donorId: 'DONOR-002',
      bloodType: 'A+',
      donationDate: '2024-01-10',
      donationCount: 8,
      certificateId: 'CERT-2024-002',
      blockchainId: 'BC-CERT-0x8E7D6C5B4A',
      type: 'main',
      title: 'Sertifikat Donor Darah',
      approvalStatus: 'approved',
      submittedAt: '2024-01-11T14:20:00Z',
      approvedBy: 'Admin Utama',
      approvedAt: '2024-01-11T16:45:00Z'
    },
    {
      id: '3',
      donorName: 'Budi Santoso',
      donorId: 'DONOR-003',
      bloodType: 'B+',
      donationDate: '2024-01-08',
      donationCount: 15,
      certificateId: 'CERT-2024-003',
      blockchainId: 'BC-BADGE-0x7D6C5B4A',
      type: 'achievement',
      title: 'Hero Donor Achievement',
      approvalStatus: 'pending',
      submittedAt: '2024-01-09T09:15:00Z'
    },
    {
      id: '4',
      donorName: 'Dewi Sartika',
      donorId: 'DONOR-004',
      bloodType: 'AB+',
      donationDate: '2024-01-05',
      donationCount: 5,
      certificateId: 'CERT-2024-004',
      blockchainId: 'BC-CERT-0x6C5B4A9F',
      type: 'main',
      title: 'Sertifikat Donor Darah',
      approvalStatus: 'rejected',
      submittedAt: '2024-01-06T11:00:00Z',
      rejectionReason: 'Dokumen pendukung tidak lengkap'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cert.approvalStatus === filterStatus;
    const matchesType = filterType === 'all' || cert.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusStats = () => {
    return {
      total: certificates.length,
      pending: certificates.filter(c => c.approvalStatus === 'pending').length,
      approved: certificates.filter(c => c.approvalStatus === 'approved').length,
      rejected: certificates.filter(c => c.approvalStatus === 'rejected').length,
    };
  };

  const handleApprove = (certificateId: string) => {
    setCertificates(prev => prev.map(cert => 
      cert.certificateId === certificateId 
        ? { 
            ...cert, 
            approvalStatus: 'approved' as const,
            approvedBy: 'Admin Utama',
            approvedAt: new Date().toISOString()
          }
        : cert
    ));
  };

  const handleReject = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      setSelectedCertificate(cert);
      setShowRejectModal(true);
    }
  };

  const confirmReject = () => {
    if (selectedCertificate) {
      setCertificates(prev => prev.map(cert => 
        cert.certificateId === selectedCertificate.certificateId 
          ? { 
              ...cert, 
              approvalStatus: 'rejected' as const,
              rejectionReason: rejectionReason
            }
          : cert
      ));
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedCertificate(null);
    }
  };

  const handleViewDetails = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      setSelectedCertificate(cert);
      setShowDetailModal(true);
    }
  };

  const stats = getStatusStats();

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
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="main">Sertifikat Donor</option>
                <option value="achievement">Achievement</option>
              </select>

              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <AdminCertificateCard
              key={certificate.id}
              donorName={certificate.donorName}
              bloodType={certificate.bloodType}
              donationDate={certificate.donationDate}
              donationCount={certificate.donationCount}
              certificateId={certificate.certificateId}
              blockchainId={certificate.blockchainId}
              type={certificate.type}
              title={certificate.title}
              approvalStatus={certificate.approvalStatus}
              submittedAt={certificate.submittedAt}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada sertifikat</h3>
            <p className="text-gray-500">Tidak ada sertifikat yang sesuai dengan filter yang dipilih.</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detail Sertifikat</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Donor</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCertificate.donorName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Donor</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCertificate.donorId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Golongan Darah</label>
                    <p className="text-lg font-semibold text-red-600">{selectedCertificate.bloodType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Donasi Ke</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCertificate.donationCount}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Blockchain ID</label>
                  <p className="text-sm font-mono text-blue-600 bg-blue-50 p-3 rounded-lg break-all">
                    {selectedCertificate.blockchainId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Status Approval</label>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCertificate.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedCertificate.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedCertificate.approvalStatus === 'approved' ? 'Disetujui' :
                       selectedCertificate.approvalStatus === 'pending' ? 'Menunggu' : 'Ditolak'}
                    </span>
                  </div>
                </div>

                {selectedCertificate.approvalStatus === 'approved' && selectedCertificate.approvedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Disetujui oleh</label>
                    <p className="text-gray-900">{selectedCertificate.approvedBy}</p>
                    <p className="text-sm text-gray-500">
                      pada {new Date(selectedCertificate.approvedAt!).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}

                {selectedCertificate.approvalStatus === 'rejected' && selectedCertificate.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alasan Penolakan</label>
                    <p className="text-gray-900 bg-red-50 p-3 rounded-lg">{selectedCertificate.rejectionReason}</p>
                  </div>
                )}

                {selectedCertificate.approvalStatus === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedCertificate.certificateId);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Setujui Sertifikat
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleReject(selectedCertificate.certificateId);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Tolak Sertifikat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Tolak Sertifikat</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Anda akan menolak sertifikat <strong>{selectedCertificate.certificateId}</strong> untuk donor <strong>{selectedCertificate.donorName}</strong>.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tolak Sertifikat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCertificatesPage; 