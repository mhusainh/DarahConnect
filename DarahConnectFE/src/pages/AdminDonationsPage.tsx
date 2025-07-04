import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Eye, 
  Check, 
  X, 
  AlertTriangle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getApi } from '../services/fetchApi';
import { useNotification } from '../hooks/useNotification';
import { Donation, DonationsResponse } from '../types/index';

const AdminDonationsPage: React.FC = () => {
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotification();

  // Fetch donations from API with search and pagination
  const fetchDonations = async (page: number = 1, search: string = '', status: string = 'all') => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString()
      });
      
      // Add search parameter if provided
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      // Add status filter if not 'all'
      if (status !== 'all') {
        params.append('status', status);
      }
      
      const endpoint = `/admin/donations?${params.toString()}`;
      console.log('🔍 API Endpoint:', endpoint);
      
      const response = await getApi<any>(endpoint);
      
      console.log('🔍 Donations API Response:', response);
      console.log('🔍 Response Data:', response.data);
      
      if (response.success && response.data) {
        // Handle different possible response structures
        let donationsData: Donation[] = [];
        let paginationData = null;
        
        // Check if response.data is the direct API response structure
        if (response.data.data && Array.isArray(response.data.data)) {
          // Structure: { success: true, data: { data: [...], pagination: {...} } }
          donationsData = response.data.data;
          paginationData = response.data.pagination;
        } else if (Array.isArray(response.data)) {
          // Structure: { success: true, data: [...] }
          donationsData = response.data;
          paginationData = response.pagination;
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
        }
        
        console.log('🔍 Parsed donations data:', donationsData);
        console.log('🔍 Donations count:', donationsData.length);
        
        setDonationsList(donationsData);
        
        if (paginationData) {
          setTotalPages(paginationData.total_pages || 1);
          setCurrentPage(paginationData.page || page);
          setTotalItems(paginationData.total_items || 0);
        } else {
          // If no pagination data, assume single page
          setTotalPages(1);
          setCurrentPage(1);
          setTotalItems(donationsData.length);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch donations');
      }
    } catch (error: any) {
      console.error('❌ Error fetching donations:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Gagal memuat data donasi: ' + (error.message || 'Unknown error')
      });
      setDonationsList([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDonations(currentPage, searchTerm, filterStatus);
  }, [currentPage, filterStatus]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Reset to page 1 when searching
      setCurrentPage(1);
      fetchDonations(1, searchTerm, filterStatus);
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word && word[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Use server-side filtered data directly
  const filteredDonations = donationsList || [];

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

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
    setCurrentPage(1); // Reset to first page when changing filter
  };

  if (loading) {
    return (
      <AdminLayout title="Riwayat Donasi" subtitle="Kelola dan pantau riwayat donasi">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data donasi...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Riwayat Donasi" subtitle="Kelola dan pantau riwayat donasi">
      {/* Header with Search and Filter */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Cari berdasarkan nama, email, atau order ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {!loading && searchTerm && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="success">Berhasil</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Gagal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {searchTerm || filterStatus !== 'all' ? 'Hasil Pencarian' : 'Total Donasi'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchTerm || filterStatus !== 'all' ? donationsList.length : totalItems}
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <p className="text-xs text-gray-500">dari {totalItems} total</p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Berhasil</p>
                <p className="text-2xl font-bold text-green-600">
                  {donationsList.filter(d => d.status.toLowerCase() === 'success').length}
                </p>
                <p className="text-xs text-gray-500">halaman ini</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {donationsList.filter(d => d.status.toLowerCase() === 'pending').length}
                </p>
                <p className="text-xs text-gray-500">halaman ini</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Nominal</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(donationsList.reduce((sum, donation) => sum + (donation.amount || 0), 0))}
                </p>
                <p className="text-xs text-gray-500">halaman ini</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Memuat data...</h3>
              <p className="text-gray-500">Sedang mengambil data donasi</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada donasi ditemukan</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Belum ada riwayat donasi yang tersedia'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus Pencarian
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donatur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nominal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {donation.user?.url_file ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={donation.user.url_file} 
                                  alt={donation.user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-red-600">
                                    {getUserInitials(donation.user?.name || '')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {donation.user?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {donation.user?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {donation.order_id || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {donation.amount ? formatCurrency(donation.amount) : 'Rp 0'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span className="ml-1 capitalize">
                              {donation.status || 'Unknown'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donation.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(donation)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {donationsList.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                        <span className="font-medium">{totalItems}</span> total donasi
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
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detail Donasi</h3>
              <button
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={() => setShowDetailModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Donation Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Informasi Donasi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedDonation.order_id || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nominal</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedDonation.amount ? formatCurrency(selectedDonation.amount) : 'Rp 0'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedDonation.status)}`}>
                      {getStatusIcon(selectedDonation.status)}
                      <span className="ml-1 capitalize">{selectedDonation.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Transaksi</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedDonation.transaction_time)}</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Informasi Donatur</h4>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {selectedDonation.user?.url_file ? (
                      <img 
                        className="h-16 w-16 rounded-full object-cover" 
                        src={selectedDonation.user.url_file} 
                        alt={selectedDonation.user.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-red-600">
                          {getUserInitials(selectedDonation.user?.name || '')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nama</label>
                      <p className="text-sm text-gray-900">{selectedDonation.user?.name || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{selectedDonation.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telepon</label>
                        <p className="text-sm text-gray-900">{selectedDonation.user?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Golongan Darah</label>
                        <p className="text-sm text-gray-900">{selectedDonation.user?.blood_type || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Alamat</label>
                        <p className="text-sm text-gray-900">{selectedDonation.user?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Riwayat Waktu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dibuat</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedDonation.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Diperbarui</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedDonation.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDonationsPage; 
