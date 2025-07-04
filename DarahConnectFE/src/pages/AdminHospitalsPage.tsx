import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin,
  Phone,
  Mail,
  Plus,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Navigation,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getApi, deleteApi } from '../services/fetchApi';
import { useNotification } from '../hooks/useNotification';
import { Hospital } from '../types/index';
import AddHospitalModal from '../components/AddHospitalModal';

// Interface untuk response API
interface HospitalsResponse {
  meta: {
    code: number;
    message: string;
  };
  data: Hospital[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

const AdminHospitalsPage: React.FC = () => {
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalDetail, setHospitalDetail] = useState<Hospital | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10); // 3x3 grid
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotification();

  // Fetch hospitals from API with search and pagination
  const fetchHospitals = async (page: number = 1, search: string = '', province: string = 'all', city: string = 'all') => {
    try {
      setLoading(true);
      
      // Build query parameters for server-side filtering
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString()
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (province !== 'all') {
        params.append('province', province);
      }
      
      if (city !== 'all') {
        params.append('city', city);
      }
      
      const endpoint = `/hospital?${params.toString()}`;
      console.log('🔍 Hospitals API Endpoint:', endpoint);
      const response = await getApi<HospitalsResponse>(endpoint);
      
      console.log('🔍 Full API Response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let hospitalsData: Hospital[] = [];
        let paginationData = null;
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          hospitalsData = response.data;
          paginationData = response.pagination;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response.data has nested data array
          hospitalsData = response.data.data;
          paginationData = response.data.pagination;
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
          hospitalsData = [];
        }
        
        // Client-side filtering for now (until API supports server-side filtering)
        const filtered = hospitalsData.filter(hospital => {
          if (!hospital || !hospital.name) return false;
          
          const matchesSearch = !search || 
            (hospital.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (hospital.address || '').toLowerCase().includes(search.toLowerCase()) ||
            (hospital.city || '').toLowerCase().includes(search.toLowerCase()) ||
            (hospital.province || '').toLowerCase().includes(search.toLowerCase());
          
          const matchesProvince = province === 'all' || hospital.province === province;
          const matchesCity = city === 'all' || hospital.city === city;

          return matchesSearch && matchesProvince && matchesCity;
        });
        
        // Client-side pagination
        // const startIndex = (page - 1) * perPage;
        // const endIndex = startIndex + perPage;
        // const paginatedData = filtered.slice(startIndex, endIndex);
        
        // console.log('📋 Hospitals data to set:', paginatedData);
        
        setHospitalsList(hospitalsData);
        setTotalItems(paginationData.total_items);
        setTotalPages(paginationData.total_pages);
        setCurrentPage(page);
        
      } else {
        throw new Error(response.message || 'Failed to fetch hospitals');
      }
    } catch (error: any) {
      console.error('❌ Error fetching hospitals:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Gagal memuat data rumah sakit: ' + (error.message || 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospital detail from API
  const fetchHospitalDetail = async (hospitalId: number) => {
    try {
      setDetailLoading(true);
      const endpoint = `/hospital/${hospitalId}`;
      console.log('🔍 Hospital Detail API Endpoint:', endpoint);
      const response = await getApi(endpoint);
      
      console.log('🔍 Hospital Detail Response:', response);
      
      if (response.success && response.data) {
        // Handle the response structure properly
        let hospitalData: Hospital;
        
        // Check if response.data has the nested structure or is direct Hospital data
        if (response.data.data) {
          // If response.data.data exists, use it (nested structure like {meta: {...}, data: {...}})
          hospitalData = response.data.data;
        } else {
          // If response.data is directly the Hospital object
          hospitalData = response.data;
        }
        
        setHospitalDetail(hospitalData);
        return hospitalData;
      } else {
        throw new Error(response.message || 'Failed to fetch hospital detail');
      }
    } catch (error: any) {
      console.error('❌ Error fetching hospital detail:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Gagal memuat detail rumah sakit: ' + (error.message || 'Unknown error')
      });
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHospitals(currentPage, searchTerm, filterProvince, filterCity);
  }, [currentPage, filterProvince, filterCity]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchHospitals(1, searchTerm, filterProvince, filterCity);
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

  const getProvinceColor = (province: string) => {
    const colors = {
      'DKI Jakarta': 'bg-blue-100 text-blue-600 border-blue-200',
      'Jawa Barat': 'bg-green-100 text-green-600 border-green-200',
      'Jawa Tengah': 'bg-yellow-100 text-yellow-600 border-yellow-200',
      'Jawa Timur': 'bg-red-100 text-red-600 border-red-200',
      'Banten': 'bg-purple-100 text-purple-600 border-purple-200',
      'Yogyakarta': 'bg-indigo-100 text-indigo-600 border-indigo-200',
    };
    return colors[province as keyof typeof colors] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getUniqueProvinces = () => {
    const provinces = hospitalsList.map(hospital => hospital.province);
    return Array.from(new Set(provinces)).sort();
  };

  const getUniqueCities = () => {
    const cities = hospitalsList
      .filter(hospital => filterProvince === 'all' || hospital.province === filterProvince)
      .map(hospital => hospital.city);
    return Array.from(new Set(cities)).sort();
  };

  // Use server-side filtered data directly
  const filteredHospitals = hospitalsList || [];

  // Handler functions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleProvinceFilter = (province: string) => {
    setFilterProvince(province);
    setFilterCity('all'); // Reset city filter when province changes
    setCurrentPage(1);
  };

  const handleCityFilter = (city: string) => {
    setFilterCity(city);
    setCurrentPage(1);
  };

  const handleViewDetails = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailModal(true);
    
    // Fetch detailed information from API
    await fetchHospitalDetail(hospital.id);
    // setHospitalDetail is already called inside fetchHospitalDetail
  };

  const handleHospitalClick = async (hospital: Hospital) => {
    await handleViewDetails(hospital);
  };

  const handleEditHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowAddModal(true);
  };

  const handleDeleteHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDeleteModal(true);
  };

  const confirmDeleteHospital = async () => {
    if (!selectedHospital) return;

    try {
      setDeleteLoading(true);
      const response = await deleteApi(`/hospital/${selectedHospital.id}`);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Berhasil',
          message: 'Rumah sakit berhasil dihapus'
        });
        fetchHospitals(currentPage, searchTerm, filterProvince, filterCity); // Refresh the list
        setShowDeleteModal(false);
        setSelectedHospital(null);
      } else {
        throw new Error(response.message || 'Failed to delete hospital');
      }
    } catch (error: any) {
      console.error('❌ Error deleting hospital:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Gagal menghapus rumah sakit: ' + (error.message || 'Unknown error')
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleHospitalAdded = () => {
    fetchHospitals(currentPage, searchTerm, filterProvince, filterCity); // Refresh the list
    setShowAddModal(false);
    setSelectedHospital(null); // Clear selected hospital
  };

  const openGoogleMaps = (latitude: number, longitude: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const getDirections = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <AdminLayout title="Kelola Rumah Sakit" subtitle="Kelola data rumah sakit mitra">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data rumah sakit...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Kelola Rumah Sakit" subtitle="Kelola data rumah sakit mitra">
      {/* Header with Add Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Daftar Rumah Sakit</h2>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {searchTerm || filterProvince !== 'all' || filterCity !== 'all' ? (
                  <>
                    {filteredHospitals.length} hasil dari {totalItems} total
                  </>
                ) : (
                  <>
                    {totalItems} rumah sakit
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedHospital(null); // Clear any selected hospital for new addition
                  setShowAddModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Rumah Sakit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari rumah sakit..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {!loading && searchTerm && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Province Filter */}
              <div className="sm:w-48">
                <select
                  value={filterProvince}
                  onChange={(e) => handleProvinceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">Semua Provinsi</option>
                  {getUniqueProvinces().map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="sm:w-48">
                <select
                  value={filterCity}
                  onChange={(e) => handleCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">Semua Kota</option>
                  {getUniqueCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada rumah sakit</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterProvince !== 'all' || filterCity !== 'all' 
                ? 'Tidak ada rumah sakit yang sesuai dengan filter yang dipilih.'
                : 'Belum ada data rumah sakit yang tersedia.'
              }
            </p>
            {searchTerm || filterProvince !== 'all' || filterCity !== 'all' ? (
              <button
                onClick={() => {
                  handleSearch('');
                  handleProvinceFilter('all');
                  handleCityFilter('all');
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Reset filter
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Tambah Rumah Sakit Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div key={hospital.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group">
                {/* Clickable Card Content */}
                <div 
                  onClick={() => handleHospitalClick(hospital)}
                  className="p-6"
                >
                  {/* Hospital Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Building className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{hospital.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProvinceColor(hospital.province)}`}>
                          {hospital.province}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewDetails(hospital)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditHospital(hospital)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(hospital)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hospital Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{hospital.city}, {hospital.province}</span>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {hospital.address}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>ID: {hospital.id}</span>
                      <span>Dibuat: {new Date(hospital.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Click to view hint */}
                <div className="px-6 pb-4">
                  <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    Klik untuk melihat detail lengkap
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredHospitals.length > 0 && (
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
                  <span className="font-medium">{totalItems}</span> total rumah sakit
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

      {/* Hospital Detail Modal */}
      {showDetailModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Detail Rumah Sakit</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setHospitalDetail(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat detail rumah sakit...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Hospital Header */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {hospitalDetail?.name || selectedHospital.name}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getProvinceColor(hospitalDetail?.province || selectedHospital.province)}`}>
                        {hospitalDetail?.province || selectedHospital.province}
                      </span>
                    </div>
                  </div>

                  {/* Google Maps Integration */}
                  {(hospitalDetail?.latitude && hospitalDetail?.longitude) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Lokasi di Peta
                      </h5>
                          {/* Embedded Google Map */}
                          <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-4">
                            <iframe
                              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${hospitalDetail.latitude},${hospitalDetail.longitude}&zoom=15`}
                              width="100%"
                              height="250"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title={`Lokasi ${hospitalDetail.name}`}
                            ></iframe>
                          </div>
                          
                          {/* Map Actions */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openGoogleMaps(hospitalDetail.latitude, hospitalDetail.longitude, hospitalDetail.name)}
                              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Buka di Google Maps</span>
                            </button>
                            <button
                              onClick={() => getDirections(hospitalDetail.latitude, hospitalDetail.longitude)}
                              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Navigation className="h-4 w-4" />
                              <span>Rute ke Sini</span>
                            </button>
                          </div>
                        
                    </div>
                  )}

                  {/* Hospital Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {hospitalDetail?.address || selectedHospital.address}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {hospitalDetail?.city || selectedHospital.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {hospitalDetail?.province || selectedHospital.province}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Rumah Sakit</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {hospitalDetail?.id || selectedHospital.id}
                      </p>
                    </div>
                    
                    {/* Coordinates */}
                    {(hospitalDetail?.latitude && hospitalDetail?.longitude) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Koordinat Latitude</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg font-mono">
                            {hospitalDetail.latitude}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Koordinat Longitude</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg font-mono">
                            {hospitalDetail.longitude}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {/* Timestamps */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dibuat</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {new Date(hospitalDetail?.created_at || selectedHospital.created_at).toLocaleString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Diperbarui</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {new Date(hospitalDetail?.updated_at || selectedHospital.updated_at).toLocaleString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setHospitalDetail(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditHospital(hospitalDetail || selectedHospital);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Hapus Rumah Sakit</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus rumah sakit <strong>{selectedHospital.name}</strong>? 
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={deleteLoading}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteHospital}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Hospital Modal */}
      {showAddModal && (
        <AddHospitalModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onHospitalAdded={handleHospitalAdded}
          hospital={selectedHospital}
        />
      )}
    </AdminLayout>
  );
};

export default AdminHospitalsPage; 