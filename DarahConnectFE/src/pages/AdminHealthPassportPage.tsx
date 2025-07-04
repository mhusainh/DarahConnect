import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  User,
  Heart,
  Building,
  MessageSquare,
  Shield,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { HealthPassport, HealthPassportResponse } from '../types/index';
import { adminBloodRequestsApi, getApi } from '../services/fetchApi';
import AdminLayout from '../components/AdminLayout';

function Avatar({ name, src }: { name: string; src?: string }) {
  const [imgError, setImgError] = React.useState(false);
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border"
        onError={() => setImgError(true)}
      />
    );
  }
  // Ambil inisial (maksimal 2 huruf)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center font-bold text-white border">
      {initials}
    </div>
  );
}

const AdminHealthPassportPage: React.FC = () => {
  const [passportsList, setPassportsList] = useState<HealthPassport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedPassport, setSelectedPassport] = useState<HealthPassport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch health passports from API with search and pagination
  const fetchHealthPassports = async (page: number = 1, search: string = '', status: string = 'all', date: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      if (date !== 'all') {
        params.append('date_filter', date);
      }
      
             const endpoint = `/admin/health-passports?${params.toString()}`;
       console.log('🔍 Health Passports API Endpoint:', endpoint);
       
       const response = await getApi(endpoint);
      
      if (response.success && response.data) {
        // Handle both direct array and nested response structure
        let passportsData: HealthPassport[] = [];
        let paginationData = null;
        
        if (Array.isArray(response.data)) {
          passportsData = response.data as HealthPassport[];
          paginationData = response.pagination;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          passportsData = response.data.data as HealthPassport[];
          paginationData = response.data.pagination;
        }
        
        // Client-side filtering for now (until API supports server-side filtering)
        const filtered = passportsData.filter(passport => {
          if (!passport || !passport.user || !passport.passport_number) {
            return false;
          }
          
          const matchesSearch = !search || 
            passport.user.name.toLowerCase().includes(search.toLowerCase()) ||
            passport.user.email.toLowerCase().includes(search.toLowerCase()) ||
            passport.passport_number.toLowerCase().includes(search.toLowerCase());
          
          const matchesStatus = status === 'all' || passport.status === status;
          
          const passportDate = new Date(passport.created_at);
          const today = new Date();
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const matchesDate = date === 'all' ||
                             (date === 'today' && passportDate.toDateString() === today.toDateString()) ||
                             (date === 'week' && passportDate >= weekAgo) ||
                             (date === 'month' && passportDate >= monthAgo);

          return matchesSearch && matchesStatus && matchesDate;
        });
        
        // Client-side pagination
        // const startIndex = (page - 1) * perPage;
        // const endIndex = startIndex + perPage;
        // const paginatedData = filtered.slice(startIndex, endIndex);
        
        setPassportsList(passportsData);
        setTotalItems(paginationData?.total_items || 0);
        setTotalPages(paginationData?.total_pages || 1);
        setCurrentPage(page);
        
        
        
      } else {
        setError(response.error || 'Failed to fetch health passports');
        setPassportsList([]);
      }
    } catch (err) {
      setError('Failed to fetch health passports');
      setPassportsList([]);
      console.error('Error fetching health passports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHealthPassports(currentPage, searchTerm, filterStatus, filterDate);
  }, [currentPage, filterStatus, filterDate]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchHealthPassports(1, searchTerm, filterStatus, filterDate);
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-200';
      case 'expired': return 'text-red-600 bg-red-100 border-red-200';
      case 'suspended': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'expired': return AlertTriangle;
      case 'suspended': return Clock;
      default: return Clock;
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Use server-side filtered data directly
  const filteredPassports = passportsList || [];

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

  const handleDateFilter = (date: string) => {
    setFilterDate(date);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await adminBloodRequestsApi.updateHealthPassportStatus(id, status);
      if (response.success) {
        setPassportsList(prev => prev.map(passport => 
          passport.id === id ? { ...passport, status: status as 'active' | 'expired' | 'suspended' } : passport
        ));
      } else {
        setError(response.error || 'Failed to update passport status');
      }
    } catch (err) {
      setError('Failed to update passport status');
      console.error('Error updating passport status:', err);
    }
  };

  const handleDeletePassport = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.deleteHealthPassport(id);
      if (response.success) {
        setPassportsList(prev => prev.filter(passport => passport.id !== id));
        setShowDeleteConfirm(false);
        setSelectedPassport(null);
      } else {
        setError(response.error || 'Failed to delete passport');
      }
    } catch (err) {
      setError('Failed to delete passport');
      console.error('Error deleting passport:', err);
    }
  };

  const handleViewDetails = (passport: HealthPassport) => {
    setSelectedPassport(passport);
    setShowDetailModal(true);
  };

  const getStatusStats = () => {
    return {
      total: totalItems,
      active: filteredPassports.filter(p => p.status === 'active').length,
      expired: filteredPassports.filter(p => p.status === 'expired').length,
      suspended: filteredPassports.filter(p => p.status === 'suspended').length,
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <AdminLayout title="Kelola Health Passport" subtitle="Kelola dan verifikasi health passport pengguna">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Loading health passports...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Kelola Health Passport" subtitle="Kelola dan verifikasi health passport pengguna">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Kelola Health Passport" subtitle="Kelola dan verifikasi health passport pengguna">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Passport</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari user, email, atau nomor passport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredPassports.length} dari {passportsList?.length || 0} passport
            </div>
          </div>
        </div>

        {/* Passports List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Passport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Dibuat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPassports.map((passport) => {
                  const StatusIcon = getStatusIcon(passport.status);
                  const daysUntilExpiry = getDaysUntilExpiry(passport.expiry_date);
                  const isExpiredPassport = isExpired(passport.expiry_date);
                  
                  return (
                    <tr key={passport.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <Avatar name={passport.user.name} src={passport.user.url_file} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {passport.user.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {passport.user.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 text-xs font-medium rounded border border-blue-200">
                                {passport.passport_number}
                              </span>
                              <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                                {passport.user.blood_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(passport.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(passport.expiry_date).toLocaleDateString('id-ID')}
                        </div>
                        {!isExpiredPassport && daysUntilExpiry <= 30 && (
                          <div className="text-xs text-orange-600">
                            {daysUntilExpiry} hari lagi
                          </div>
                        )}
                        {isExpiredPassport && (
                          <div className="text-xs text-red-600">
                            Expired {Math.abs(daysUntilExpiry)} hari lalu
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(passport.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {passport.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(passport)}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Detail</span>
                          </button>
                          
                          {passport.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(passport.id, 'suspended')}
                                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors flex items-center space-x-1"
                              >
                                <Clock className="h-3 w-3" />
                                <span>Suspend</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(passport.id, 'expired')}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors flex items-center space-x-1"
                              >
                                <X className="h-3 w-3" />
                                <span>Expire</span>
                              </button>
                            </>
                          )}
                          
                          {passport.status === 'suspended' && (
                            <button
                              onClick={() => handleUpdateStatus(passport.id, 'active')}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>Aktifkan</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedPassport(passport);
                              setShowDeleteConfirm(true);
                            }}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredPassports.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada health passport ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPassports.length > 0 && (
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
                  <span className="font-medium">{totalItems}</span> total health passport
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
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPassport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detail Health Passport</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi User</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar name={selectedPassport.user.name} src={selectedPassport.user.url_file} />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{selectedPassport.user.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                            {selectedPassport.user.blood_type}
                          </span>
                          {selectedPassport.user.is_verified && (
                            <span className="bg-green-100 text-green-600 px-2 py-1 text-xs font-medium rounded border border-green-200">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedPassport.user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedPassport.user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedPassport.user.gender}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{new Date(selectedPassport.user.birth_date).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Passport</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nomor Passport:</span>
                        <span className="font-medium text-lg">{selectedPassport.passport_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedPassport.status)}`}>
                          {selectedPassport.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tanggal Dibuat:</span>
                        <span className="font-medium">{new Date(selectedPassport.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Expiry Date:</span>
                        <span className="font-medium">{new Date(selectedPassport.expiry_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sisa Waktu:</span>
                        <span className={`font-medium ${isExpired(selectedPassport.expiry_date) ? 'text-red-600' : 'text-green-600'}`}>
                          {isExpired(selectedPassport.expiry_date) 
                            ? `Expired ${Math.abs(getDaysUntilExpiry(selectedPassport.expiry_date))} hari lalu`
                            : `${getDaysUntilExpiry(selectedPassport.expiry_date)} hari lagi`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPassport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Health Passport</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus health passport "{selectedPassport.passport_number}" milik {selectedPassport.user.name}? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeletePassport(selectedPassport.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminHealthPassportPage; 