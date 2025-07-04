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
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  Heart,
  Building,
  MessageSquare
} from 'lucide-react';
import { BloodRequest, AdminBloodRequestResponse } from '../types/index';
import { adminBloodRequestsApi, getApi } from '../services/fetchApi';
import AdminLayout from '../components/AdminLayout';

const AdminRequestsPage: React.FC = () => {
  const [requestsList, setRequestsList] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch blood requests from API with search and pagination
  const fetchBloodRequests = async (page: number = 1, search: string = '', status: string = 'all', date: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for server-side filtering
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        event_type: 'blood_request'
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
      
      const endpoint = `/admin/blood-requests?${params.toString()}`;
      console.log('🔍 Requests API Endpoint:', endpoint);
      
      const response = await getApi(endpoint);
      
      if (response.success && response.data) {
        // Handle both direct array and nested response structure
        let requestsData: BloodRequest[] = [];
        let paginationData: any = null;
        
        if (Array.isArray(response.data)) {
          requestsData = response.data as BloodRequest[];
          paginationData = response.pagination;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          requestsData = response.data.data as BloodRequest[];
          paginationData = response.data.pagination;
        }
        
        setRequestsList(requestsData);
        setTotalItems(paginationData?.total_items || 0);
        setTotalPages(paginationData?.total_pages || 1);
        setCurrentPage(page);
        
      } else {
        setError(response.error || 'Failed to fetch blood requests');
        setRequestsList([]);
      }
    } catch (err) {
      setError('Failed to fetch blood requests');
      setRequestsList([]);
      console.error('Error fetching blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBloodRequests(currentPage, searchTerm, filterStatus, filterDate);
  }, [currentPage, filterStatus, filterDate]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchBloodRequests(1, searchTerm, filterStatus, filterDate);
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
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'verified': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'verified': return Check;
      case 'pending': return Clock;
      case 'rejected': return X;
      default: return Clock;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Use server-side filtered data directly
  const filteredRequests = requestsList || [];

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

  const handleApproveRequest = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'verified');
      if (response.success) {
        setRequestsList(prev => prev.map(request => 
          request.id === id ? { ...request, status: 'verified' as const } : request
        ));
      } else {
        setError(response.error || 'Failed to approve request');
      }
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'rejected');
      if (response.success) {
        setRequestsList(prev => prev.map(request => 
          request.id === id ? { ...request, status: 'rejected' as const } : request
        ));
      } else {
        setError(response.error || 'Failed to reject request');
      }
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  const handleCompleteRequest = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'completed');
      if (response.success) {
        setRequestsList(prev => prev.map(request => 
          request.id === id ? { ...request, status: 'completed' as const } : request
        ));
      } else {
        setError(response.error || 'Failed to complete request');
      }
    } catch (err) {
      setError('Failed to complete request');
      console.error('Error completing request:', err);
    }
  };

  const handleAddNotes = (id: number, newNotes: string) => {
    // For now, this would just update local state
    // In a real app, you'd probably want an API endpoint for notes
    setRequestsList(prev => prev.map(request => 
      request.id === id ? { ...request, diagnosis: newNotes } : request
    ));
    setShowNotesModal(false);
    setNotes('');
    setSelectedRequest(null);
  };

  const handleViewDetails = (request: BloodRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleOpenNotesModal = (request: BloodRequest) => {
    setSelectedRequest(request);
    setNotes(request.diagnosis || '');
    setShowNotesModal(true);
  };

  const getStatusStats = () => {
    const list = requestsList || [];
    return {
      total: list.length,
      pending: list.filter(r => r.status === 'pending').length,
      approved: list.filter(r => r.status === 'verified').length,
      completed: list.filter(r => r.status === 'completed').length,
      rejected: list.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <AdminLayout title="Kelola Permintaan Donasi" subtitle="Review dan proses permintaan donasi darah">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Loading blood requests...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Kelola Permintaan Donasi" subtitle="Review dan proses permintaan donasi darah">
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
    <AdminLayout title="Kelola Permintaan Donasi" subtitle="Review dan proses permintaan donasi darah">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                <p className="text-xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <Check className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <X className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari donor, pasien, atau rumah sakit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-72"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Disetujui</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
              {/* <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select> */}
            </div>
            <div className="text-sm text-gray-600 lg:text-right">
              Menampilkan <span className="font-medium">{filteredRequests.length}</span> dari <span className="font-medium">{totalItems}</span> permintaan
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                    Informasi Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={request.user.url_file || '/api/placeholder/40/40'} 
                              alt={request.user.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {request.user.name}
                              </p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {request.blood_type}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mb-1">
                              Pasien: {request.patient_name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency_level)}`}>
                                {request.urgency_level}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                {request.hospital.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(request.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Event: {new Date(request.event_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="inline-flex items-center p-1.5 border border-gray-300 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="inline-flex items-center p-1.5 border border-green-300 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                                title="Setujui"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="inline-flex items-center p-1.5 border border-red-300 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Tolak"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {request.status === 'verified' && (
                            <button
                              onClick={() => handleCompleteRequest(request.id)}
                              className="inline-flex items-center p-1.5 border border-blue-300 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Selesai"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada permintaan</h3>
              <p className="mt-1 text-sm text-gray-500">Belum ada permintaan donasi yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg">
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
                  Halaman {currentPage} dari {totalPages} ({totalItems} total)
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === currentPage
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
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
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Detail Permintaan</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Informasi User</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={selectedRequest.user.url_file || '/api/placeholder/60/60'} 
                        alt={selectedRequest.user.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="text-md font-medium text-gray-900">{selectedRequest.user.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded">
                            {selectedRequest.user.blood_type}
                          </span>
                          {selectedRequest.user.is_verified && (
                            <span className="bg-green-100 text-green-600 px-2 py-1 text-xs font-medium rounded">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{selectedRequest.user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedRequest.user.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="text-sm leading-relaxed">{selectedRequest.user.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Informasi Permintaan</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedRequest.url_file && (
                      <img 
                        src={selectedRequest.url_file} 
                        alt="Blood request"
                        className="w-full h-24 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="text-md font-medium text-gray-900 mb-2">{selectedRequest.patient_name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Golongan Darah:</span>
                        <span className="font-medium">{selectedRequest.blood_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedRequest.quantity} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgensi:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getUrgencyColor(selectedRequest.urgency_level)}`}>
                          {selectedRequest.urgency_level}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{selectedRequest.hospital.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{selectedRequest.hospital.address}</p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Tanggal Event</p>
                          <p className="font-semibold text-sm">{new Date(selectedRequest.event_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Slot Tersedia</p>
                          <p className="font-semibold text-sm">{selectedRequest.slots_available}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Status & Catatan</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(selectedRequest.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    
                    {selectedRequest.diagnosis && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Diagnosis/Catatan:</h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {selectedRequest.diagnosis}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleOpenNotesModal(selectedRequest)}
                        className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Edit Catatan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Catatan</h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan permintaan donasi:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Masukkan catatan..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddNotes(selectedRequest.id, notes)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRequestsPage; 