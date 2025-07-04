import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  User,
  Calendar,
  Search,
  RefreshCw,
  Plus,
  Filter,
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAsc,
  SortDesc,
  X,
  Clock,
  Building2,
  Droplet,
  Target,
  Users,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import { useCampaignService } from '../services/campaignService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DonorOptionModal from '../components/DonorOptionModal';
import CryptoDonationModal from '../components/CryptoDonationModal';
import HospitalDetailModal from '../components/HospitalDetailModal';
import { HoverScale, FadeIn } from '../components/ui/AnimatedComponents';
import { Spinner } from '../components/ui/LoadingComponents';
import WalletConnectBanner from '../components/WalletConnectBanner';
import { BloodCampaign } from '../types';
import debounce from 'lodash.debounce';

// API response interface (from backend)
interface ApiCampaign {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  hospital_id: number;
  hospital: {
    id: number;
    name: string;
    address: string;
    city: string;
    province: string;
    latitude: number;
    longitude: number;
  };
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  diagnosis: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
  status: 'pending' | 'verified' | 'completed' | 'rejected';
  event_type: string;
  created_at: string;
  updated_at: string;
  url_file?: string;
}

interface CampaignsResponse {
  meta: {
    code: number;
    message: string;
  };
  data: ApiCampaign[];
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
  event_type: string;
}



const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const campaignService = useCampaignService();
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // API state
  const [apiCampaigns, setApiCampaigns] = useState<ApiCampaign[]>([]);
  const [campaigns, setCampaigns] = useState<BloodCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state - simplified like AdminCampaignsPage
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Sort state
  const [sortField, setSortField] = useState('event_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    urgency_level: '',
    blood_type: '',
    min_quantity: '',
    max_quantity: '',
    start_date: '',
    end_date: '',
    status: '',
    event_type: ''
  });



  // Search input state untuk debouncing
  const [searchInput, setSearchInput] = useState(filters.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const { get: getApi } = useApi<any>();

  // Convert API campaign to UI campaign format
  const convertApiCampaignToBloodCampaign = (apiCampaign: ApiCampaign): BloodCampaign => {
    return {
      id: apiCampaign.id.toString(),
      title: apiCampaign.event_name,
      description: apiCampaign.diagnosis,
      organizer: {
        name: apiCampaign.user.name,
        avatar: '/api/placeholder/32/32',
        verified: true,
        role: 'Organizer'
      },
      hospital: apiCampaign.hospital.name,
      location: `${apiCampaign.hospital.city}, ${apiCampaign.hospital.province}`,
      bloodType: [apiCampaign.blood_type as any],
      targetDonors: apiCampaign.slots_available || 0,
      currentDonors: apiCampaign.slots_booked || 0,
      urgencyLevel: apiCampaign.urgency_level,
      contactPerson: apiCampaign.user.name,
      contactPhone: apiCampaign.user.phone,
      deadline: apiCampaign.event_date,
      createdAt: apiCampaign.created_at,
      imageUrl: apiCampaign.url_file || '/api/placeholder/400/200',
      url_file: apiCampaign.url_file || ''
    };
  };

  // Build query string from filters and pagination
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    // Add pagination
    params.append('page', currentPage.toString());
    params.append('limit', perPage.toString());
    params.append('sort', sortField);
    params.append('order', sortOrder);

    // Add filters (only if they have values)
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value.trim());
      }
    });

    return params.toString();
  }, [filters, currentPage, perPage, sortField, sortOrder]);

  // Fetch campaigns with current filters and pagination
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await getApi(`/campaign?${queryString}`);

      if (response && response.data) {
        const apiCampaignsData = Array.isArray(response.data) ? response.data : [];
        setApiCampaigns(apiCampaignsData);

        // Convert API campaigns to UI campaigns
        const convertedCampaigns = apiCampaignsData.map(convertApiCampaignToBloodCampaign);
        setCampaigns(convertedCampaigns);

        // Set pagination data from API response
        if (response.pagination) {
          setTotalItems(response.pagination.total_items);
          setTotalPages(response.pagination.total_pages);
          setCurrentPage(response.pagination.page);
        } else {
          // Fallback pagination calculation
          setTotalItems(apiCampaignsData.length);
          setTotalPages(apiCampaignsData.length > 0 ? Math.ceil(apiCampaignsData.length / perPage) : 1);
        }
      } else {
        setError('Gagal memuat data campaigns');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat memuat data');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [getApi, buildQueryString]);

  // Effect to fetch data when current page, perPage, filters, or sort changes
  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, perPage, sortField, sortOrder, filters.search, filters.urgency_level, filters.blood_type,
    filters.min_quantity, filters.max_quantity, filters.start_date, filters.end_date,
    filters.status, filters.event_type]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchInput]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  // Handle sorting changes
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
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
      status: '',
      event_type: ''
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  // Generate pagination numbers (simplified version from AdminCampaignsPage)
  const getPaginationNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    // Add first page if not in range
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page if not in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Utility functions
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
        return 'Menunggu Verifikasi';
      case 'verified':
        return 'Terverifikasi';
      case 'completed':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      case 'active':
        return 'Aktif';
      default:
        return status;
    }
  };

  // Get campaign status based on progress, deadline, and verification status
  const getCampaignStatus = (campaign: BloodCampaign, apiCampaign?: ApiCampaign) => {
    const now = new Date();
    const deadline = new Date(campaign.deadline);
    const progress = (campaign.currentDonors / campaign.targetDonors) * 100;
    const status = apiCampaign?.status || 'pending';

    // Check if campaign is completed (100% donors reached)
    if (progress >= 100) {
      return {
        text: 'Selesai',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        disabled: true
      };
    }

    // Check if deadline has passed
    if (now > deadline) {
      return {
        text: 'Berakhir',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        disabled: true
      };
    }

    // Check if status is not verified
    if (status !== 'verified') {
      return {
        text: 'Tidak Dapat Donor',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        disabled: true
      };
    }

    // Check urgency level for active verified campaigns
    if (campaign.urgencyLevel === 'critical') {
      return {
        text: 'Sangat Mendesak',
        color: 'bg-red-100 text-red-800 border-red-200',
        disabled: false
      };
    }

    if (campaign.urgencyLevel === 'high') {
      return {
        text: 'Mendesak',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        disabled: false
      };
    }

    // Default active status
    return {
      text: 'Aktif',
      color: 'bg-green-100 text-green-800 border-green-200',
      disabled: false
    };
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

  const getProgress = (current: number, target: number) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const handleRefresh = () => {
    fetchCampaigns();
  };

  const handleViewDetails = (campaign: BloodCampaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCryptoDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsCryptoModalOpen(true);
  };

  const handleViewHospital = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsHospitalModalOpen(true);
  };

  const handleDonorNow = async (notes: string, hospitalId: number, description: string) => {
    if (!selectedCampaign) return;

    try {
      const success = await campaignService.donorNowWithSchedule(Number(selectedCampaign.id), hospitalId, description, notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran dan Jadwal Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor dan jadwal telah dibuat. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        setIsModalOpen(false);
        fetchCampaigns(); // Refresh to update donor count
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
    if (!selectedCampaign) return;

    try {
      const success = await campaignService.createSchedule(Number(selectedCampaign.id), hospitalId, description);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Jadwal Berhasil Dibuat!',
          message: 'Jadwal donor darah telah berhasil dibuat. Tim akan menghubungi Anda untuk konfirmasi.',
          duration: 5000
        });
        setIsModalOpen(false);
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

  const handleCryptoDonationSuccess = (txHash: string) => {
    console.log('Crypto donation successful:', txHash);
    addNotification({
      type: 'success',
      title: 'Donasi Crypto Berhasil!',
      message: `Transaction Hash: ${txHash}`,
      duration: 5000
    });
    setIsCryptoModalOpen(false);
  };

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
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
                Semua Campaign Donor Darah
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Temukan campaign yang membutuhkan bantuan Anda dan jadilah bagian dari gerakan menyelamatkan nyawa
              </p>

              {/* Create Campaign CTA */}
              {/* <div className="flex justify-center">
                <HoverScale scale={1.05}>
                  <button
                    onClick={handleCreateCampaign}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Buat Campaign Baru</span>
                  </button>
                </HoverScale>
              </div> */}
            </div>
          </FadeIn>

          {/* Stats Overview */}
          <FadeIn direction="up" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-sm text-gray-600">Total Campaign</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {campaigns.filter(c => c.urgencyLevel === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Sangat Mendesak</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {campaigns.filter(c => c.urgencyLevel === 'high').length}
                </div>
                <div className="text-sm text-gray-600">Mendesak</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {apiCampaigns.filter(c => c.status === 'verified').length}
                </div>
                <div className="text-sm text-gray-600">Campaign Aktif</div>
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
                  placeholder="Cari campaign berdasarkan judul, deskripsi, atau lokasi..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
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
                  <option value="verified">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="canceled">Dibatalkan</option>
                  <option value="rejected">Ditolak</option>
                </select> */}

                {/* <select
                  value={filters.event_type}
                  onChange={(e) => handleFilterChange('event_type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="">Semua Tipe</option>
                  <option value="emergency">Darurat</option>
                  <option value="regular">Regular</option>
                  <option value="community">Komunitas</option>
                  <option value="hospital">Rumah Sakit</option>
                </select> */}

                {/* <button
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
                  {/* <button
                    onClick={handleCreateCampaign}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Campaign</span>
                  </button> */}

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
                    value={sortField}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="event_date">Tanggal Event</option>
                    <option value="created_at">Tanggal Dibuat</option>
                    <option value="urgency_level">Urgensi</option>
                    <option value="quantity">Target Donor</option>
                    <option value="event_name">Nama Campaign</option>
                    <option value="slots_booked">Donor Terdaftar</option>
                  </select>
                  <button
                    onClick={() => handleSortChange(sortField)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'desc' ?
                      <SortDesc className="w-4 h-4" /> :
                      <SortAsc className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Results Info */}
              <div className="mt-4 text-sm text-gray-600">
                Menampilkan {campaigns.length} dari {totalItems} campaign (Halaman {currentPage} dari {totalPages})
              </div>
            </div>
          </FadeIn>

          {/* Campaigns Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" style={{ gridAutoRows: 'minmax(550px, 1fr)' }}>
            {campaigns.map((campaign, index) => {
              const apiCampaign = apiCampaigns[campaigns.indexOf(campaign)];
              const campaignStatus = getCampaignStatus(campaign, apiCampaign);
              const isDisabled = campaignStatus.disabled;

              return (
                <FadeIn key={campaign.id} direction="up" delay={0.1 * index}>
                  <HoverScale scale={1.02}>
                    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full ${isDisabled ? 'opacity-75' : ''}`}>
                      {/* Image Section */}
                      <div className="relative h-40 bg-gradient-to-br from-red-100 to-red-200 flex-shrink-0">
                        {campaign.imageUrl ? (
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {/* Fallback Image */}
                        <div className={`w-full h-full flex items-center justify-center ${campaign.imageUrl ? 'hidden' : ''}`}>
                          <div className="text-center">
                            <Heart className="w-16 h-16 text-red-400 mx-auto mb-2" />
                            <p className="text-red-600 font-semibold">Campaign Donor Darah</p>
                          </div>
                        </div>

                        {/* Completion Overlay */}
                        {isDisabled && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-3xl mb-2">
                                {getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100 ? '✅' : '⏰'}
                              </div>
                              <div className="text-sm font-semibold">
                                {getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100 ? 'SELESAI' : 'BERAKHIR'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Urgency Badge Overlay */}
                        <div className="absolute top-3 right-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${getUrgencyColor(campaign.urgencyLevel)}`}>
                            {getUrgencyText(campaign.urgencyLevel)}
                          </div>
                        </div>

                        {/* Blood Type Badge Overlay */}
                        <div className="absolute top-3 left-3">
                          <div className={`w-10 h-10 ${getBloodTypeColor(campaign.bloodType[0])} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                            {campaign.bloodType[0]}
                          </div>
                        </div>

                        {/* Progress Badge Overlay */}
                        <div className="absolute bottom-3 left-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100
                            ? 'bg-green-600/90 text-white'
                            : 'bg-black/70 text-white'
                            }`}>
                            {campaign.currentDonors || 0}/{campaign.targetDonors || 0} Donor
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-grow flex flex-col">
                        {/* Campaign Name */}
                        <div className="flex-shrink-0">
                          <h3 className="font-bold text-base text-gray-900 mb-2 flex-shrink-0" style={{
                            height: '2.5rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>{campaign.title}</h3>
                          {campaign.description && (
                            <p className="text-sm text-gray-600 mb-3 flex-shrink-0" style={{
                              height: '3rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {campaign.description}
                            </p>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4 flex-shrink-0 mt-auto">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-xs font-medium text-gray-700">Progress Donor</span>
                            <span className={`font-semibold ${getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100
                              ? 'text-green-600'
                              : 'text-gray-900'
                              }`}>
                              {campaign.currentDonors || 0}/{campaign.targetDonors || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                              style={{
                                width: `${getProgress(
                                  campaign.currentDonors || 0,
                                  campaign.targetDonors || 1
                                )}%`
                              }}
                            ></div>
                          </div>
                          {getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100 && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ✓ Target tercapai!
                            </div>
                          )}

                          {/* Campaign Completion Notice */}
                          {isDisabled && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-yellow-800">
                                    {getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100
                                      ? 'Campaign Selesai'
                                      : 'Campaign Berakhir'
                                    }
                                  </p>
                                  <p className="text-xs text-yellow-700">
                                    {getProgress(campaign.currentDonors || 0, campaign.targetDonors || 1) >= 100
                                      ? 'Target donor tercapai'
                                      : 'Deadline terlewat'
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Campaign Info */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm text-gray-600 truncate">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{campaign.hospital}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 truncate">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{campaign.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span>Deadline: {formatDate(campaign.deadline)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Target className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span>Target: {campaign.targetDonors} donor</span>
                          </div>
                        </div>

                        {/* Blood Types */}
                        <div className="mb-3 flex-shrink-0">
                          <p className="text-xs text-gray-600 mb-1">Golongan darah:</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.bloodType.map((type, index) => (
                              <span key={index} className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Urgency Level and Status */}
                        <div className="mb-3 flex-shrink-0 space-y-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Urgency Level:</p>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                              {getUrgencyText(campaign.urgencyLevel)}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Status:</p>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apiCampaigns[campaigns.indexOf(campaign)]?.status || 'pending')}`}>
                              {getStatusText(apiCampaigns[campaigns.indexOf(campaign)]?.status || 'pending')}
                            </div>
                          </div>
                        </div>


                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 flex-shrink-0">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(campaign)}
                            className="flex-1 border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                          >
                            Lihat Detail
                          </button>

                          <button
                            onClick={isDisabled ? undefined : () => handleDonate(campaign)}
                            disabled={isDisabled}
                            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md flex items-center justify-center ${isDisabled
                              ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg'
                              }`}
                            title={isDisabled ? 'Campaign sudah selesai atau berakhir' : 'Klik untuk donor'}
                          >
                            {isDisabled ? 'Slot Penuh' : 'Donor Sekarang'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </HoverScale>
                </FadeIn>
              );
            })}
          </div>

          {/* Pagination */}
          {(campaigns.length > 0 || totalPages > 0) && (
            <FadeIn direction="up" delay={0.4}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-8">
                {/* Pagination Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Menampilkan <span className="font-semibold">{campaigns.length}</span> dari <span className="font-semibold">{totalItems}</span> campaign
                  </div>

                  {/* Per Page Selector */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="perPage" className="text-sm text-gray-600">Tampilkan:</label>
                    <select
                      id="perPage"
                      value={perPage}
                      onChange={e => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white font-medium"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={36}>36</option>
                      <option value={48}>48</option>
                    </select>
                    <span className="text-sm text-gray-600">per halaman</span>
                  </div>
                </div>

                {/* Pagination Controls - only show if more than 1 page */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center">
                    <nav className="flex items-center space-x-1">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-300 shadow-sm hover:shadow-md'
                          }`}
                      >
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Sebelumnya
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1 mx-4">
                        {getPaginationNumbers().map((page, index) => (
                          <span key={index}>
                            {page === '...' ? (
                              <span className="px-3 py-2 text-gray-500 text-sm">...</span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(Number(page))}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === page
                                  ? 'bg-red-600 text-white shadow-lg transform scale-105'
                                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-300 shadow-sm hover:shadow-md'
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-300 shadow-sm hover:shadow-md'
                          }`}
                      >
                        Selanjutnya
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </button>
                    </nav>
                  </div>
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {/* Empty State */}
          {campaigns.length === 0 && !loading && (
            <FadeIn direction="up" delay={0.3}>
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak Ada Campaign Ditemukan
                </h3>
                <p className="text-gray-600 mb-6">
                  {Object.values(filters).some(value => value !== '')
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Belum ada campaign saat ini'}
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
                      onClick={handleCreateCampaign}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Buat Campaign Pertama</span>
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
      <Footer />

      {/* Modals */}
      {selectedCampaign && (
        <>
          <DonorOptionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            campaign={selectedCampaign}
            onDonorNow={handleDonorNow}
            onScheduleOnly={handleScheduleOnly}
          />

          <CryptoDonationModal
            isOpen={isCryptoModalOpen}
            onClose={() => setIsCryptoModalOpen(false)}
            campaign={selectedCampaign}
            onSuccess={handleCryptoDonationSuccess}
          />

          <HospitalDetailModal
            isOpen={isHospitalModalOpen}
            onClose={() => setIsHospitalModalOpen(false)}
            hospital={{
              id: 1,
              name: selectedCampaign.hospital,
              address: selectedCampaign.location,
              city: selectedCampaign.location.split(',')[0] || '',
              province: selectedCampaign.location.split(',')[1] || '',
              latitude: -6.2088,
              longitude: 106.8456,
              created_at: '',
              updated_at: ''
            }}
          />
        </>
      )}
    </>
  );
};

export default CampaignsPage; 