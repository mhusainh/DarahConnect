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
  FileTextIcon,
  Edit,
  Filter,
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAsc,
  SortDesc,
  X,
  Eye
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import { useCampaignService } from '../services/campaignService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditBloodRequestModal from '../components/EditBloodRequestModal';
import DonorOptionModal from '../components/DonorOptionModal';
import { HoverScale, FadeIn } from '../components/ui/AnimatedComponents';
import { Spinner } from '../components/ui/LoadingComponents';
import WalletConnectBanner from '../components/WalletConnectBanner';
import { BloodCampaign } from '../types';
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
  image_url?: string;
  url_file?: string;
  description?: string;
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

const BloodRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const campaignService = useCampaignService();
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Modal state for donor option
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [selectedDonorRequest, setSelectedDonorRequest] = useState<BloodRequest | null>(null);
  
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

  // Tambahkan state untuk search input
  const [searchInput, setSearchInput] = useState(filters.search);

  // Tambahkan debounced function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      handleFilterChange('search', value);
    }, 500),
    []
  );

  const { get: getApi } = useApi<any>();

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
      const response = await getApi(`/blood-request?${queryString}`);
      
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
      console.error('Error fetching blood requests:', err);
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

  // Clear all filters
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
    setPaginationState(prev => ({ ...prev, page: 1 }));
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

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
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu';
      case 'active':
        return 'Verified';
      case 'completed':
        return 'Selesai';
      case 'canceled':
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
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRefresh = () => {
    fetchBloodRequests();
  };

  // Convert BloodRequest to BloodCampaign format for modal
  const convertBloodRequestToCampaign = (request: BloodRequest): BloodCampaign => {
    return {
      id: request.id.toString(),
      title: request.event_name,
      description: request.diagnosis,
      organizer: {
        name: request.user.name,
        avatar: request.user.url_file || '/api/placeholder/32/32',
        verified: request.user.is_verified,
        role: request.user.role
      },
      hospital: request.hospital.name,
      location: `${request.hospital.city}, ${request.hospital.province}`,
      bloodType: [request.blood_type as any],
      targetDonors: request.quantity || 1,
      currentDonors: 0,
      urgencyLevel: request.urgency_level as any,
      contactPerson: request.user.name,
      contactPhone: request.user.phone,
      deadline: request.event_date,
      createdAt: request.created_at,
      imageUrl: '',
      url_file: ''
    };
  };

  const handleDonate = (request: BloodRequest) => {
    setSelectedDonorRequest(request);
    setIsDonorModalOpen(true);
  };

  const handleDonorNow = async (notes: string, hospitalId: number, description: string) => {
    if (!selectedDonorRequest) return;
    
    try {
      const success = await campaignService.donorNowWithSchedule(selectedDonorRequest.id, hospitalId, description, notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran dan Jadwal Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor untuk permintaan darah ini. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        setIsDonorModalOpen(false);
        setSelectedDonorRequest(null);
        fetchBloodRequests(); // Refresh to update data
      } else {
        addNotification({
          type: 'error',
          title: 'Pendaftaran Gagal',
          message: 'Terjadi kesalahan saat mendaftar sebagai donor dan membuat jadwal. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleScheduleOnly = async (hospitalId: number, description: string) => {
    if (!selectedDonorRequest) return;
    
    try {
      const success = await campaignService.createSchedule(selectedDonorRequest.id, hospitalId, description);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Jadwal Berhasil Dibuat!',
          message: 'Jadwal donor darah untuk permintaan ini telah berhasil dibuat. Tim akan menghubungi Anda untuk konfirmasi.',
          duration: 5000
        });
        setIsDonorModalOpen(false);
        setSelectedDonorRequest(null);
      } else {
        addNotification({
          type: 'error',
          title: 'Pembuatan Jadwal Gagal',
          message: 'Terjadi kesalahan saat membuat jadwal. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleViewDetails = (request: BloodRequest) => {
    // For now, navigate to the blood requests detail page or display modal
    // Since we don't have a dedicated detail page for blood requests yet,
    // we can create one or show a detailed modal
    navigate(`/blood-requests/${request.id}`);
  };

  const handleCreateBloodRequest = () => {
    navigate('/create-blood-request');
  };

  const handleOpenEditRequestModal = (request: BloodRequest) => {
    setSelectedRequest(request);
    setEditRequestModalOpen(true);
  };

  const handleCloseEditRequestModal = () => {
    setEditRequestModalOpen(false);
    setSelectedRequest(null);
  };

  const handleEditSuccess = () => {
    // Refresh the data after successful edit
    fetchBloodRequests();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
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
    <WalletConnectBanner />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Permintaan Darah Darurat
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Bantu menyelamatkan nyawa dengan merespons permintaan darah darurat dari rumah sakit dan pasien yang membutuhkan
              </p>
              
              {/* Create Request CTA */}
              <div className="flex justify-center">
                <HoverScale scale={1.05}>
                  <button
                    onClick={handleCreateBloodRequest}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Buat Permintaan Darah Darurat</span>
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
                <div className="text-2xl font-bold text-red-600">
                  {bloodRequests.filter(r => r.urgency_level === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Sangat Mendesak</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {bloodRequests.filter(r => r.urgency_level === 'high').length}
                </div>
                <div className="text-sm text-gray-600">Mendesak</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bloodRequests.filter(r => r.urgency_level === 'low').length}
                </div>
                <div className="text-sm text-gray-600">Normal</div>
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
                  placeholder="Cari pasien, rumah sakit, atau diagnosis..."
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

                {/* <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="canceled">Dibatalkan</option>
                </select> */}

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter Lanjutan</span>
                </button>
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
                    onClick={() => navigate('/my-blood-requests')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    <FileTextIcon className="w-4 h-4" />
                    <span>Permintaan Saya</span>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bloodRequests.map((request, index) => (
              <FadeIn key={request.id} direction="up" delay={0.1 * index}>
                <HoverScale scale={1.02}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-red-100 to-red-200">
                      {request.url_file ? (
                        <img
                          src={request.url_file}
                          alt={request.event_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {/* Fallback Image */}
                      <div className={`w-full h-full flex items-center justify-center ${request.url_file ? 'hidden' : ''}`}>
                        <div className="text-center">
                          <Droplet className="w-16 h-16 text-red-400 mx-auto mb-2" />
                          <p className="text-red-600 font-semibold">Permintaan Darah</p>
                        </div>
                      </div>
                      
                      {/* Urgency Badge Overlay */}
                      <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${getUrgencyColor(request.urgency_level)}`}>
                          {getUrgencyText(request.urgency_level)}
                        </div>
                      </div>
                      
                      {/* Blood Type Badge Overlay */}
                      <div className="absolute top-3 left-3">
                        <div className={`w-10 h-10 ${getBloodTypeColor(request.blood_type)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                          {request.blood_type}
                        </div>
                      </div>
                      
                      {/* Quantity Badge Overlay */}
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {request.quantity} Kantong
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                      {/* Event Name */}
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{request.event_name}</h3>
                        {request.description && (
                          <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {request.description}
                          </p>
                        )}
                      </div>

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

                      {/* Request Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Diminta oleh: {request.user.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{request.user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(request.event_date)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t">
                      {/* Main Actions Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                        
                        <button
                          onClick={() => handleDonate(request)}
                          disabled={request.status === 'completed' || request.status === 'canceled'}
                          className="bg-red-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                        >
                          <Heart className="w-4 h-4" />
                          <span>
                            {request.status === 'completed' ? 'Selesai' :
                             request.status === 'canceled' ? 'Dibatalkan' :
                             'Saya Bisa Donor'}
                          </span>
                        </button>
                      </div>

                      {/* Edit Button - Only show if user is the request owner */}
                      {request.user_id === parseInt(localStorage.getItem('userId') || '0') && (
                        <button
                          onClick={() => handleOpenEditRequestModal(request)}
                          disabled={request.status === 'completed' || request.status === 'canceled'}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>
                            {request.status === 'completed' ? 'Tidak Dapat Diedit' :
                             request.status === 'canceled' ? 'Tidak Dapat Diedit' :
                             'Edit Permintaan'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </HoverScale>
              </FadeIn>
            ))}
          </div>

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

          {/* Empty State */}
          {bloodRequests.length === 0 && !loading && (
            <FadeIn direction="up" delay={0.3}>
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak Ada Permintaan Ditemukan
                </h3>
                <p className="text-gray-600 mb-6">
                  {Object.values(filters).some(value => value !== '')
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Belum ada permintaan darah saat ini'}
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
          )}
        </div>
      </div>
      <Footer />
      
      {/* DonorOptionModal for Blood Requests */}
      {selectedDonorRequest && (
        <DonorOptionModal
          isOpen={isDonorModalOpen}
          onClose={() => {
            setIsDonorModalOpen(false);
            setSelectedDonorRequest(null);
          }}
          campaign={convertBloodRequestToCampaign(selectedDonorRequest)}
          onDonorNow={handleDonorNow}
          onScheduleOnly={handleScheduleOnly}
        />
      )}
      
      {selectedRequest && (
        <EditBloodRequestModal
          isOpen={editRequestModalOpen}
          onClose={handleCloseEditRequestModal}
          onSuccess={handleEditSuccess}
          bloodRequest={selectedRequest}
        />
      )}
    </>
  );
};

export default BloodRequestsPage;
