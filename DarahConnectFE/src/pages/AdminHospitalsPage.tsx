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
  X
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { addNotification } = useNotification();

  // Fetch hospitals from API
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await getApi<HospitalsResponse>('/hospital');
      
      console.log('🔍 Full API Response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let hospitalsData: Hospital[] = [];
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          hospitalsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response.data has nested data array
          hospitalsData = response.data.data;
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
          hospitalsData = [];
        }
        
        console.log('📋 Hospitals data to set:', hospitalsData);
        setHospitalsList(hospitalsData);
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

  useEffect(() => {
    fetchHospitals();
  }, []);

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

  const filteredHospitals = hospitalsList?.filter(hospital => {
    const matchesSearch = (hospital.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hospital.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hospital.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hospital.province || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = filterProvince === 'all' || hospital.province === filterProvince;
    const matchesCity = filterCity === 'all' || hospital.city === filterCity;

    return matchesSearch && matchesProvince && matchesCity;
  }) || [];

  const handleViewDetails = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailModal(true);
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
        fetchHospitals(); // Refresh the list
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
    fetchHospitals(); // Refresh the list
    setShowAddModal(false);
    setSelectedHospital(null); // Clear selected hospital
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
                {filteredHospitals.length} rumah sakit
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Province Filter */}
              <div className="sm:w-48">
                <select
                  value={filterProvince}
                  onChange={(e) => {
                    setFilterProvince(e.target.value);
                    setFilterCity('all'); // Reset city filter when province changes
                  }}
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
                  onChange={(e) => setFilterCity(e.target.value)}
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
                  setSearchTerm('');
                  setFilterProvince('all');
                  setFilterCity('all');
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
              <div key={hospital.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Hospital Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{hospital.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProvinceColor(hospital.province)}`}>
                          {hospital.province}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Detail Modal */}
      {showDetailModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Detail Rumah Sakit</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedHospital.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getProvinceColor(selectedHospital.province)}`}>
                      {selectedHospital.province}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <p className="text-sm text-gray-900">{selectedHospital.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                    <p className="text-sm text-gray-900">{selectedHospital.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                    <p className="text-sm text-gray-900">{selectedHospital.province}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <p className="text-sm text-gray-900">{selectedHospital.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <p className="text-sm text-gray-900">{selectedHospital.latitude}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <p className="text-sm text-gray-900">{selectedHospital.longitude}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedHospital.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diperbarui</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedHospital.updated_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditHospital(selectedHospital);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Edit
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