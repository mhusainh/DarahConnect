import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  DropletIcon,
  AlertTriangleIcon,
  Building2Icon
} from 'lucide-react';
import { useCampaignService } from '../services/campaignService';
import { useNotification } from '../hooks/useNotification';
import { BloodCampaign } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DonorOptionModal from '../components/DonorOptionModal';
import WalletConnectBanner from '../components/WalletConnectBanner';

const BloodRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignService = useCampaignService();
  const { addNotification } = useNotification();
  const [bloodRequest, setBloodRequest] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBloodRequestDetail = async () => {
      if (!id) {
        setError('ID permintaan darah tidak valid');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const requestData = await campaignService.getCampaignDetail(id);
        if (requestData) {
          setBloodRequest(requestData);
        } else {
          setError('Permintaan darah tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data permintaan darah');
        console.error('Error loading blood request detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBloodRequestDetail();
  }, [id]);

  const handleDonorNow = async (notes: string, hospitalId: number, description: string) => {
    if (!bloodRequest) return;
    
    try {
      const success = await campaignService.donorNowWithSchedule(Number(bloodRequest.id), hospitalId, description, notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran dan Jadwal Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor dan jadwal telah dibuat. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        // Refresh data to update donor count
        const updatedRequest = await campaignService.getCampaignDetail(bloodRequest.id);
        if (updatedRequest) {
          setBloodRequest(updatedRequest);
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Pendaftaran Gagal',
          message: 'Terjadi kesalahan saat mendaftar sebagai donor dan membuat jadwal. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleScheduleOnly = async (hospitalId: number, description: string) => {
    if (!bloodRequest) return;
    
    try {
      const success = await campaignService.createSchedule(Number(bloodRequest.id), hospitalId, description);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Jadwal Berhasil Dibuat!',
          message: 'Jadwal donor darah telah berhasil dibuat. Tim akan menghubungi Anda untuk konfirmasi.',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Pembuatan Jadwal Gagal',
          message: 'Terjadi kesalahan saat membuat jadwal. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  if (isLoading) {
    return (
      <>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat permintaan darah...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || (!bloodRequest && !isLoading)) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Permintaan Darah Tidak Ditemukan'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Permintaan darah yang Anda cari tidak tersedia.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate('/blood-requests')}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kembali ke Permintaan Darah
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!bloodRequest) {
    return null;
  }

  const progress = (bloodRequest.currentDonors / bloodRequest.targetDonors) * 100;
  const daysLeft = Math.ceil((new Date(bloodRequest.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Sangat Mendesak';
      case 'high': return 'Mendesak';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return 'Tidak Diketahui';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bloodRequest.title,
        text: bloodRequest.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification({
        type: 'success',
        title: 'Link Disalin!',
        message: 'Link permintaan darah berhasil disalin ke clipboard.',
        duration: 3000
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Kembali
              </button>
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Bagikan
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Section */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-4">{bloodRequest.title}</h1>
                      <div className="flex items-center space-x-4 text-red-100">
                        <div className="flex items-center">
                          <DropletIcon className="w-5 h-5 mr-2" />
                          <span>{bloodRequest.bloodType.join(', ')}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUrgencyColor(bloodRequest.urgencyLevel)}`}>
                          {getUrgencyText(bloodRequest.urgencyLevel)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center min-w-[120px]">
                      <div className="text-2xl font-bold">{bloodRequest.targetDonors}</div>
                      <div className="text-sm opacity-90">Donor Dibutuhkan</div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Progress Donor</span>
                      <span className="text-sm text-gray-600">
                        {bloodRequest.currentDonors}/{bloodRequest.targetDonors} donor
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {progress.toFixed(1)}% tercapai
                    </p>
                  </div>

                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
                    <p className="text-gray-600 leading-relaxed">{bloodRequest.description}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bloodRequest.contactPerson}</p>
                      <p className="text-sm text-gray-500">Person in Charge</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bloodRequest.contactPhone}</p>
                      <p className="text-sm text-gray-500">Nomor Telepon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Action Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bantu Sekarang</h3>
                
                {/* Hospital Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <Building2Icon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bloodRequest.hospital}</p>
                      <p className="text-sm text-gray-500">Rumah Sakit</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bloodRequest.location}</p>
                      <p className="text-sm text-gray-500">Lokasi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(bloodRequest.deadline).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Deadline terlewat'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <HeartIcon className="w-5 h-5" />
                  <span>Saya Bisa Donor</span>
                </button>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{bloodRequest.currentDonors}</div>
                    <div className="text-xs text-gray-500">Donor Terdaftar</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{bloodRequest.targetDonors - bloodRequest.currentDonors}</div>
                    <div className="text-xs text-gray-500">Donor Dibutuhkan</div>
                  </div>
                </div>
              </div>

              {/* Information Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Persyaratan Donor Darah
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Usia 17-65 tahun</li>
                      <li>• Berat badan minimal 45kg</li>
                      <li>• Sehat jasmani dan rohani</li>
                      <li>• Tidak sedang mengonsumsi obat</li>
                      <li>• Interval donor minimal 3 bulan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {bloodRequest && (
        <DonorOptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaign={bloodRequest}
          onDonorNow={handleDonorNow}
          onScheduleOnly={handleScheduleOnly}
        />
      )}

      <Footer />
    </>
  );
};

export default BloodRequestDetailPage; 