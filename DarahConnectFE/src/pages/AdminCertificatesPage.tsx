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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch certificates with search and pagination
  const fetchCertificates = async (page: number = 1, search: string = '', status: string = 'all') => {
    setLoading(true);
    setError('');
    
    // Build query parameters for server-side filtering
    const params = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString()
    });
    
    if (search.trim()) {
      params.append('search', search.trim());
    }
    
    if (status !== 'all') {
      params.append('status', status);
    }
    
    const endpoint = `/blood-donations?${params.toString()}`;
    console.log('🔍 Certificates API Endpoint:', endpoint);
    
    const res = await get(endpoint);
    if (res.success && Array.isArray(res.data)) {
      let paginationData = null;
      const mapped = res.data.map((item: any) => ({
        id: String(item.id),
        donorName: item.registration?.user?.name || '-',
        bloodType: item.blood_type || '-',
        donationDate: item.donation_date ? item.donation_date.split('T')[0] : '-',
        status: item.status || '-',
        hospitalName: item.hospital?.name || '-',
        urlFile: item.url_file || '',
      }));
      paginationData = res.pagination;
      
      // Client-side filtering for now (until API supports server-side filtering)
      const filtered = mapped.filter(cert => {
        const matchesSearch = !search || 
          cert.donorName.toLowerCase().includes(search.toLowerCase()) ||
          cert.id.toLowerCase().includes(search.toLowerCase()) ||
          cert.hospitalName.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = status === 'all' || cert.status === status;
        
        return matchesSearch && matchesStatus;
      });
      
      // Client-side pagination
      // const startIndex = (page - 1) * perPage;
      // const endIndex = startIndex + perPage;
      // const paginatedData = filtered.slice(startIndex, endIndex);
      
      setCertificates(mapped);
      setTotalItems(paginationData?.total_items || 0);
      setTotalPages(paginationData?.total_pages || 1);
      setCurrentPage(page);
      
      
      
    } else {
      setError(res.error || 'Gagal memuat data');
    }
    setLoading(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchCertificates(currentPage, searchTerm, filterStatus);
  }, [currentPage, filterStatus]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchCertificates(1, searchTerm, filterStatus);
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

  // Use server-side filtered data directly
  const filteredCertificates = certificates || [];

  // Handler functions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const getStatusStats = () => {
    return {
      total: totalItems,
      pending: filteredCertificates.filter(c => c.status === 'pending').length,
      approved: filteredCertificates.filter(c => c.status === 'completed').length,
      rejected: filteredCertificates.filter(c => c.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  // Approve handler
  const handleApprove = async (id: string) => {
    setApprovingId(id);
    await put(`/blood-donation/${id}/status`, { status: 'completed' });
    setApprovingId(null);
    fetchCertificates(currentPage, searchTerm, filterStatus);
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="completed">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredCertificates.length} dari {totalItems} sertifikat
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

            {/* Pagination */}
            {filteredCertificates.length > 0 && (
              <div className="mt-8 bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan{' '}
                      <span className="font-medium">
                        {((currentPage - 1) * perPage) + 1}
                      </span>{' '}
                      sampai{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * perPage, totalItems)}
                      </span>{' '}
                      dari{' '}
                      <span className="font-medium">{totalItems}</span> total sertifikat
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {(() => {
                        const pages = [];
                        const maxPages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                        let endPage = Math.min(totalPages, startPage + maxPages - 1);
                        
                        if (endPage - startPage + 1 < maxPages) {
                          startPage = Math.max(1, endPage - maxPages + 1);
                        }
                        
                        // Add first page if not in range
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                                ...
                              </span>
                            );
                          }
                        }
                        
                        // Add page numbers in range
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                i === currentPage
                                  ? 'z-10 bg-red-50 border-red-500 text-red-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        // Add last page if not in range
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCertificatesPage; 