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
  RefreshCw
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import Header from '../components/Header';
import Footer from '../components/Footer';
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

const BloodRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterBloodType, setFilterBloodType] = useState('all');

  const { data: bloodRequestsData, loading, error, get } = useApi<BloodRequestsResponse>();

  // Fetch blood requests on component mount
  React.useEffect(() => {
    get('/blood-request');
  }, [get]);

  // Since fetchApi already extracts responseData.data, bloodRequestsData is the array directly
  const bloodRequests = Array.isArray(bloodRequestsData) ? bloodRequestsData : (bloodRequestsData?.data || []);



  // Filter logic
  const filteredRequests = bloodRequests.filter(request => {
    const matchesSearch = 
      request.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || request.urgency_level === filterUrgency;
    const matchesBloodType = filterBloodType === 'all' || request.blood_type === filterBloodType;

    return matchesSearch && matchesStatus && matchesUrgency && matchesBloodType;
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
    get('/blood-request');
    addNotification({
      type: 'success',
      title: 'Data Diperbarui',
      message: 'Data permintaan darah berhasil diperbarui'
    });
  };

  const handleDonate = (request: BloodRequest) => {
    // Navigate to donor registration with pre-filled data
    navigate('/donor-register', { 
      state: { 
        bloodRequest: request,
        prefilledData: {
          blood_type: request.blood_type,
          hospital_id: request.hospital_id,
          event_name: request.event_name
        }
      }
    });
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
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Permintaan Darah Darurat
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Bantu menyelamatkan nyawa dengan merespons permintaan darah darurat dari rumah sakit dan pasien yang membutuhkan
              </p>
            </div>
          </FadeIn>

          {/* Stats Overview */}
          <FadeIn direction="up" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-red-600">{bloodRequests.length}</div>
                <div className="text-sm text-gray-600">Total Permintaan</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {bloodRequests.filter(r => r.urgency_level === 'Critical').length}
                </div>
                <div className="text-sm text-gray-600">Kritis</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {bloodRequests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Menunggu</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bloodRequests.filter(r => r.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Aktif</div>
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
                    placeholder="Cari pasien, rumah sakit, atau diagnosis..."
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
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                    <option value="canceled">Dibatalkan</option>
                  </select>

                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Semua Urgensi</option>
                    <option value="Critical">Kritis</option>
                    <option value="High">Tinggi</option>
                    <option value="Medium">Sedang</option>
                    <option value="Low">Rendah</option>
                  </select>

                  <select
                    value={filterBloodType}
                    onChange={(e) => setFilterBloodType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Semua Golongan</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
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
                          {request.urgency_level}
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
                          {request.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t">
                      <button
                        onClick={() => handleDonate(request)}
                        disabled={request.status === 'completed' || request.status === 'canceled'}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>
                          {request.status === 'completed' ? 'Sudah Selesai' :
                           request.status === 'canceled' ? 'Dibatalkan' :
                           'Saya Bisa Donor'}
                        </span>
                      </button>
                    </div>
                  </div>
                </HoverScale>
              </FadeIn>
            ))}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <FadeIn direction="up" delay={0.3}>
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak Ada Permintaan Ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all' || filterBloodType !== 'all'
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Belum ada permintaan darah saat ini'}
                </p>
                {(searchTerm || filterStatus !== 'all' || filterUrgency !== 'all' || filterBloodType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterUrgency('all');
                      setFilterBloodType('all');
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BloodRequestsPage;
