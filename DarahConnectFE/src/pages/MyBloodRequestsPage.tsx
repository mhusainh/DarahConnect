import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  User, 
  Phone, 
  AlertTriangle, 
  Calendar,
  Building2,
  Droplet,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Clock,
  Filter,
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditBloodRequestModal from '../components/EditBloodRequestModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { HoverScale, FadeIn } from '../components/ui/AnimatedComponents';
import { Spinner } from '../components/ui/LoadingComponents';
import debounce from 'lodash.debounce';

interface UserData {
  id: number;
  name: string;
  gender: string;
  email: string;
  phone: string;
  blood_type: string;
  birth_date: string;
  address: string;
  role: string;
  is_verified: boolean;
  url_file: string;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface BloodRequest {
  id: number;
  user_id: number;
  user: UserData;
  hospital_id: number;
  hospital: Hospital;
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency_level: string;
  diagnosis: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
  status: string;
  event_type: string;
  created_at: string;
  updated_at: string;
  public_id?: string;
  url_file?: string;
}

interface BloodRequestsResponse {
  meta: {
    code: number;
    message: string;
  };
  data: BloodRequest[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

interface FilterState {
  search: string;
  urgency_level: string;
  blood_type: string;
  min_quantity: string;
  max_quantity: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface PaginationState {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

const MyBloodRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Cancel confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<BloodRequest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // API state
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total_items: 0,
    total_pages: 0
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    urgency_level: '',
    blood_type: '',
    min_quantity: '',
    max_quantity: '',
    start_date: '',
    end_date: '',
    status: ''
  });

  // Pagination and sorting state
  const [paginationState, setPaginationState] = useState<PaginationState>({
    page: 1,
    limit: 10,
    sort: 'created_at',
    order: 'desc'
  });

  // Search input state for debouncing
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      handleFilterChange('search', value);
    }, 500),
    []
  );

  const { get: getApi, put: putApi } = useApi<any>();

  // Build query string from filters and pagination
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', paginationState.page.toString());
    params.append('limit', paginationState.limit.toString());
    params.append('sort', paginationState.sort);
    params.append('order', paginationState.order);
    
    // Add filters (only if they have values)
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value.trim());
      }
    });
    
    return params.toString();
  }, [filters, paginationState]);

  // Fetch blood requests with current filters and pagination
  const fetchBloodRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString();
      const response = await getApi(`/user/blood-request?${queryString}`);
      
      if (response && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setBloodRequests(dataArray);
        
        // Set pagination data with fallbacks
        if ((response as any).pagination) {
          setPagination((response as any).pagination);
        } else {
          // If no pagination data from API, calculate based on data length
          setPagination({
            page: paginationState.page,
            per_page: paginationState.limit,
            total_items: dataArray.length,
            total_pages: dataArray.length > 0 ? Math.ceil(dataArray.length / paginationState.limit) : 1
          });
        }
      } else {
        setError('Gagal memuat data permintaan darah');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat memuat data');
      console.error('Error fetching my blood requests:', err);
    } finally {
      setLoading(false);
    }
  }, [getApi, buildQueryString]);

  // Effect to fetch data when filters or pagination change
  useEffect(() => {
    fetchBloodRequests();
  }, [fetchBloodRequests]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setPaginationState(prev => ({ ...prev, page: newPage }));
  };

  // Handle sorting changes
  const handleSortChange = (sortField: string) => {
    setPaginationState(prev => ({
      ...prev,
      sort: sortField,
      order: prev.sort === sortField && prev.order === 'desc' ? 'asc' : 'desc',
      page: 1
    }));
  };

  // Clear all filters with enhanced feedback
  const clearFilters = () => {
    setFilters({
      search: '',
      urgency_level: '',
      blood_type: '',
      min_quantity: '',
      max_quantity: '',
      start_date: '',
      end_date: '',
      status: ''
    });
    setSearchInput('');
    setPaginationState(prev => ({ ...prev, page: 1 }));
    
    // Enhanced clear filters notification
    addNotification({
      type: 'info',
      title: '🔄 Filter Direset',
      message: 'Semua filter telah dihapus. Menampilkan semua permintaan darah Anda.',
      duration: 3000
    });
  };

  // Generate pagination numbers
  const getPaginationNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, paginationState.page - delta);
      i <= Math.min(pagination.total_pages - 1, paginationState.page + delta);
      i++
    ) {
      range.push(i);
    }

    if (paginationState.page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (paginationState.page + delta < pagination.total_pages - 1) {
      rangeWithDots.push('...', pagination.total_pages);
    } else {
      rangeWithDots.push(pagination.total_pages);
    }

    return rangeWithDots;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'Sangat Mendesak';
      case 'high':
        return 'Mendesak';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Normal';
      default:
        return urgency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu';
      case 'verified':
        return 'Verified';
      case 'completed':
        return 'Selesai';
      case 'rejected':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-400',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-400',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-400',
      'O+': 'bg-green-500',
      'O-': 'bg-green-400',
    };
    return colors[bloodType as keyof typeof colors] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = async () => {
    try {
      // Show loading notification
      addNotification({
        type: 'info',
        title: '🔄 Memperbarui Data...',
        message: 'Sedang memuat data permintaan darah terbaru...',
        duration: 2000
      });

      await fetchBloodRequests();
      
      // Success notification with enhanced styling
      addNotification({
        type: 'success',
        title: '✨ Data Berhasil Diperbarui!',
        message: `Menampilkan ${bloodRequests.length} permintaan darah terbaru dari total ${pagination.total_items} permintaan.`,
        duration: 4000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '🚫 Gagal Memperbarui',
        message: 'Terjadi kesalahan saat memperbarui data. Silakan coba lagi.',
        duration: 5000
      });
    }
  };

  const handleCreateBloodRequest = () => {
    // Enhanced navigation with notification
    addNotification({
      type: 'info',
      title: '📝 Membuka Form Permintaan',
      message: 'Mengarahkan ke halaman pembuatan permintaan darah baru...',
      duration: 2000
    });
    
    setTimeout(() => {
      navigate('/create-blood-request');
    }, 500);
  };

  const handleEditRequest = (requestId: number) => {
    // Navigate to edit page (you might need to create this)
    navigate(`/edit-blood-request/${requestId}`);
  };

  const handleDeleteRequest = (request: BloodRequest) => {
    setRequestToDelete(request);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      // API call to update blood request status to cancelled
      const formData = new FormData();
      formData.append('status', 'cancelled');
      const response = await putApi(`/user/update-blood-request/${requestToDelete.id}`, formData);

      if (response) {
        // Success notification with custom style
        addNotification({
          type: 'success',
          title: '🎉 Berhasil Dibatalkan!',
          message: `Permintaan darah "${requestToDelete.event_name}" telah berhasil dibatalkan.`,
          duration: 5000
        });

        // Close modal and refresh data
        setDeleteModalOpen(false);
        setRequestToDelete(null);
        fetchBloodRequests();
      } else {
        throw new Error('Gagal membatalkan permintaan');
      }
    } catch (error: any) {
      console.error('Error cancelling blood request:', error);
      
      // Enhanced error notification with detailed message
      let errorTitle = '🚫 Gagal Membatalkan';
      let errorMessage = 'Terjadi kesalahan saat membatalkan permintaan darah.';
      
      if (error.response?.status === 404) {
        errorTitle = '❓ Tidak Ditemukan';
        errorMessage = 'Permintaan darah tidak ditemukan atau sudah dibatalkan sebelumnya.';
      } else if (error.response?.status === 403) {
        errorTitle = '🔒 Akses Ditolak';
        errorMessage = 'Anda tidak memiliki izin untuk membatalkan permintaan ini.';
      } else if (error.response?.status === 409) {
        errorTitle = '⚠️ Tidak Dapat Dibatalkan';
        errorMessage = 'Permintaan tidak dapat dibatalkan karena sudah ada donor yang terdaftar atau sedang diproses.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 7000
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setRequestToDelete(null);
    setDeleteLoading(false);
  };

  const handleOpenEditRequestModal = (request: BloodRequest) => {
    setSelectedRequest(request);
    setEditRequestModalOpen(true);
  };

  const handleCloseEditRequestModal = () => {
    setSelectedRequest(null);
    setEditRequestModalOpen(false);
  };

  const handleEditSuccess = () => {
    // Enhanced success notification for edit
    addNotification({
      type: 'success',
      title: '🎉 Permintaan Berhasil Diperbarui!',
      message: 'Perubahan data permintaan darah Anda telah berhasil disimpan.',
      duration: 4000
    });
    
    // Refresh the data after successful edit
    fetchBloodRequests();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 text-lg">Memuat permintaan darah Anda...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Permintaan Darah Saya
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Kelola dan pantau permintaan darah yang telah Anda buat
              </p>
              
              {/* Create Request CTA */}
              <div className="flex justify-center">
                <HoverScale scale={1.05}>
                  <button
                    onClick={handleCreateBloodRequest}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Buat Permintaan Baru</span>
                  </button>
                </HoverScale>
              </div>
            </div>
          </FadeIn>

          {/* Stats Overview */}
          <FadeIn direction="up" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{pagination.total_items}</div>
                <div className="text-sm text-gray-600">Total Permintaan</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {bloodRequests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Menunggu</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bloodRequests.filter(r => r.status === 'verified').length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bloodRequests.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Selesai</div>
              </div>
            </div>
          </FadeIn>

          {/* Enhanced Filters and Search */}
          <FadeIn direction="up" delay={0.2}>
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              {/* Main Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan pasien, rumah sakit, atau diagnosis..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Quick Filters Row */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={filters.urgency_level}
                  onChange={(e) => handleFilterChange('urgency_level', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="">Semua Urgensi</option>
                  <option value="critical">Sangat Mendesak</option>
                  <option value="high">Mendesak</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Normal</option>
                </select>

                <select
                  value={filters.blood_type}
                  onChange={(e) => handleFilterChange('blood_type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="">Semua Golongan</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="verified">Verified</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Dibatalkan</option>
                </select>
{/* 
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter Lanjutan</span>
                </button> */}
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <FadeIn direction="down" delay={0.1}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Quantity</label>
                      <input
                        type="number"
                        placeholder="Min kantong"
                        value={filters.min_quantity}
                        onChange={(e) => handleFilterChange('min_quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Quantity</label>
                      <input
                        type="number"
                        placeholder="Max kantong"
                        value={filters.max_quantity}
                        onChange={(e) => handleFilterChange('max_quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Action Buttons and Sort */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCreateBloodRequest}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Permintaan</span>
                  </button>

                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>

                  {Object.values(filters).some(value => value !== '') && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Urutkan:</span>
                  <select
                    value={paginationState.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="created_at">Tanggal Dibuat</option>
                    <option value="event_date">Tanggal Event</option>
                    <option value="urgency_level">Urgensi</option>
                    <option value="quantity">Jumlah</option>
                    <option value="patient_name">Nama Pasien</option>
                  </select>
                  <button
                    onClick={() => handleSortChange(paginationState.sort)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {paginationState.order === 'desc' ? 
                      <SortDesc className="w-4 h-4" /> : 
                      <SortAsc className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Results Info */}
              <div className="mt-4 text-sm text-gray-600">
                Menampilkan {bloodRequests.length} dari {pagination.total_items} permintaan (Halaman {pagination.page} dari {pagination.total_pages})
              </div>
            </div>
          </FadeIn>

          {/* Blood Requests Grid */}
          {bloodRequests.length === 0 && !loading ? (
            <FadeIn direction="up" delay={0.3}>
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {Object.values(filters).some(value => value !== '')
                    ? 'Tidak Ada Permintaan Ditemukan'
                    : 'Belum Ada Permintaan'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {Object.values(filters).some(value => value !== '')
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Anda belum membuat permintaan darah. Buat permintaan pertama Anda sekarang.'}
                </p>
                <div className="flex justify-center space-x-4">
                  {Object.values(filters).some(value => value !== '') ? (
                    <button
                      onClick={clearFilters}
                      className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Reset Filter
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateBloodRequest}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Buat Permintaan Pertama</span>
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bloodRequests.map((request, index) => (
                <FadeIn key={request.id} direction="up" delay={0.1 * index}>
                  <HoverScale scale={1.02}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                      {/* Image Section */}
                      {request.url_file ? (
                        <div className="relative h-48 w-full overflow-hidden">
                          <img 
                            src={request.url_file} 
                            alt={`Gambar untuk ${request.event_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <div class="text-center">
                                    <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                      </svg>
                                    </div>
                                    <p class="text-gray-500 text-sm">Gambar tidak tersedia</p>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Heart className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-gray-500 text-sm">Permintaan Darah</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Header */}
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 ${getBloodTypeColor(request.blood_type)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                              {request.blood_type}
                            </div>
                            <span className="font-semibold">{request.quantity} Kantong</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency_level)}`}>
                            {getUrgencyText(request.urgency_level)}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg">{request.event_name}</h3>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-4">
                        {/* Patient Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {request.patient_name || 'Tidak disebutkan'}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="text-sm text-gray-600">{request.diagnosis}</span>
                          </div>
                        </div>

                        {/* Hospital Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{request.hospital.name}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="text-sm text-gray-600">
                              {request.hospital.city}, {request.hospital.province}
                            </span>
                          </div>
                        </div>

                        {/* Timing Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Dibutuhkan: {formatDate(request.event_date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Dibuat: {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: #{request.id}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 bg-gray-50 border-t">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditRequestModal(request)}
                            disabled={request.status === 'verified' || request.status === 'rejected'}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request)}
                            disabled={request.status === 'verified' || request.status === 'rejected'}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                                                                title={
                                      request.status === 'verified' ? 'Tidak dapat dibatalkan karena sudah verified' :
                                      request.status === 'rejected' ? 'Tidak dapat dibatalkan karena sudah ditolak' :
                                      'Batalkan permintaan darah ini'
                                    }
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>
                              {request.status === 'verified' ? 'Sudah Verified' :
                               request.status === 'completed' ? 'Sudah Selesai' :
                               request.status === 'rejected' ? 'Permintaan Ditolak' :
                               'Batalkan'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </HoverScale>
                </FadeIn>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(bloodRequests.length > 0 || pagination.total_pages > 0) && (
            <FadeIn direction="up" delay={0.4}>
              {/* Limit Per Page Dropdown */}
              <div className="flex items-center justify-end mb-2">
                <label htmlFor="perPage" className="mr-2 text-sm text-gray-600">Tampilkan</label>
                <select
                  id="perPage"
                  value={paginationState.limit}
                  onChange={e => {
                    setPaginationState(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2 text-sm text-gray-600">per halaman</span>
              </div>
              {/* Pagination Info */}
              <div className="mt-2 text-center text-sm text-gray-600">
                Menampilkan {bloodRequests.length} dari {pagination.total_items} permintaan 
                (Halaman {paginationState.page} dari {Math.max(pagination.total_pages, 1)})
              </div>

              {/* Pagination Controls - only show if more than 1 page */}
              {pagination.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-center">
                  <nav className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(paginationState.page - 1)}
                      disabled={paginationState.page === 1}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paginationState.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-1" />
                      Sebelumnya
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPaginationNumbers().map((page, index) => (
                        <span key={index}>
                          {page === '...' ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(Number(page))}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                paginationState.page === page
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(paginationState.page + 1)}
                      disabled={paginationState.page === pagination.total_pages}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paginationState.page === pagination.total_pages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Selanjutnya
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </nav>
                </div>
              )}
            </FadeIn>
          )}
        </div>
      </div>
      <Footer />
      {selectedRequest && (
        <EditBloodRequestModal
          isOpen={editRequestModalOpen}
          onClose={handleCloseEditRequestModal}
          onSuccess={handleEditSuccess}
          bloodRequest={selectedRequest}
        />
      )}
      
      {/* Enhanced Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        type="danger"
        title="Batalkan Permintaan Darah?"
        message={
          requestToDelete 
            ? `Apakah Anda yakin ingin membatalkan permintaan darah "${requestToDelete.event_name}" untuk pasien "${requestToDelete.patient_name}"?\n\nStatus permintaan akan diubah menjadi 'dibatalkan' dan tidak dapat diaktifkan kembali.`
            : 'Apakah Anda yakin ingin membatalkan permintaan darah ini?'
        }
        confirmText="Ya, Batalkan"
        cancelText="Batal"
        loading={deleteLoading}
      />
    </>
  );
};

export default MyBloodRequestsPage; 