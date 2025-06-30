import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditBloodRequestModal from '../components/EditBloodRequestModal';
import { HoverScale, FadeIn } from '../components/ui/AnimatedComponents';
import { Spinner } from '../components/ui/LoadingComponents';

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

const MyBloodRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  const { data: bloodRequestsData, loading, error, get } = useApi<BloodRequestsResponse>();

  // Fetch user's blood requests on component mount
  React.useEffect(() => {
    get('/user/blood-request');
  }, [get]);

  // Since fetchApi already extracts responseData.data, bloodRequestsData is the array directly
  const bloodRequests = Array.isArray(bloodRequestsData) ? bloodRequestsData : (bloodRequestsData?.data || []);

  // Filter logic
  const filteredRequests = bloodRequests.filter(request => {
    const matchesSearch = 
      request.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || request.urgency_level === filterUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

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
      case 'verified':
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    get('/user/blood-request');
    addNotification({
      type: 'success',
      title: 'Data Diperbarui',
      message: 'Data permintaan darah Anda berhasil diperbarui'
    });
  };

  const handleCreateBloodRequest = () => {
    navigate('/create-blood-request');
  };

  const handleEditRequest = (requestId: number) => {
    // Navigate to edit page (you might need to create this)
    navigate(`/edit-blood-request/${requestId}`);
  };

  const handleDeleteRequest = (requestId: number) => {
    // Add delete confirmation and API call
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus permintaan ini?');
    if (confirmed) {
      // TODO: Implement delete API call
      addNotification({
        type: 'info',
        title: 'Fitur Belum Tersedia',
        message: 'Fitur hapus permintaan belum tersedia'
      });
    }
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
    // Refresh the data after successful edit
    get('/user/blood-request');
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
                <div className="text-2xl font-bold text-blue-600">{bloodRequests.length}</div>
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

          {/* Filters and Search */}
          <FadeIn direction="up" delay={0.2}>
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan pasien, rumah sakit, atau diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="verified">Verified</option>
                    <option value="completed">Selesai</option>
                    <option value="canceled">Dibatalkan</option>
                  </select>

                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Semua Urgensi</option>
                    <option value="critical">Sangat Mendesak</option>
                    <option value="high">Mendesak</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Normal</option>
                  </select>

                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Blood Requests Grid */}
          {filteredRequests.length === 0 ? (
            <FadeIn direction="up" delay={0.3}>
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all'
                    ? 'Tidak Ada Permintaan Ditemukan'
                    : 'Belum Ada Permintaan'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all'
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Anda belum membuat permintaan darah. Buat permintaan pertama Anda sekarang.'}
                </p>
                <div className="flex justify-center space-x-4">
                  {(searchTerm || filterStatus !== 'all' || filterUrgency !== 'all') ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterUrgency('all');
                      }}
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
              {filteredRequests.map((request, index) => (
                <FadeIn key={request.id} direction="up" delay={0.1 * index}>
                  <HoverScale scale={1.02}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
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
                            disabled={request.status === 'completed' || request.status === 'canceled'}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={request.status === 'active' || request.status === 'completed'}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </HoverScale>
                </FadeIn>
              ))}
            </div>
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
    </>
  );
};

export default MyBloodRequestsPage; 