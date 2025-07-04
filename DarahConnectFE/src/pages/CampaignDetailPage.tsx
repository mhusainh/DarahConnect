import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  MapPinIcon, 
  CalendarIcon, 
  PhoneIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ShareIcon,
  HeartIcon,
  Building2Icon
} from 'lucide-react';
import { BloodCampaign } from '../types';
import { useCampaignService } from '../services/campaignService';
import DonorOptionModal from '../components/DonorOptionModal';
import HospitalDetailModal from '../components/HospitalDetailModal';
import { useNotification } from '../hooks/useNotification';

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignService = useCampaignService();
  const { addNotification } = useNotification();
  const [campaign, setCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaignDetail = async () => {
      if (!id) {
        setError('ID campaign tidak valid');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const campaignData = await campaignService.getCampaignDetail(id);
        if (campaignData) {
          setCampaign(campaignData);
        } else {
          setError('Campaign tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data campaign');
        console.error('Error loading campaign detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignDetail();
  }, [id]);

  const handleDonorNow = async (notes: string, hospitalId: number, description: string) => {
    if (!campaign) return;
    
    try {
      const success = await campaignService.donorNowWithSchedule(Number(campaign.id), hospitalId, description, notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran dan Jadwal Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor dan jadwal telah dibuat. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        // Refresh campaign data to update donor count
        const updatedCampaign = await campaignService.getCampaignDetail(campaign.id);
        if (updatedCampaign) {
          setCampaign(updatedCampaign);
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
    if (!campaign) return;
    
    try {
      const success = await campaignService.createSchedule(Number(campaign.id), hospitalId, description);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat campaign...</p>
        </div>
      </div>
    );
  }

  if (error || (!campaign && !isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Campaign Tidak Ditemukan'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Campaign yang Anda cari tidak tersedia.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate('/campaigns')}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali ke Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null; // This will only happen during loading
  }

  const progress = (campaign.currentDonors / campaign.targetDonors) * 100;
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Get campaign status based on progress and deadline
  const getCampaignStatus = () => {
    const now = new Date();
    const deadline = new Date(campaign.deadline);
    
    // Check if campaign is completed (100% donors reached)
    if (progress >= 100) {
      return {
        text: 'Selesai - Target Terpenuhi',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        disabled: true
      };
    }
    
    // Check if deadline has passed
    if (now > deadline) {
      return {
        text: 'Berakhir - Deadline Terlewat',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        disabled: true
      };
    }
    
    // Check urgency level for active campaigns
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
      text: 'Aktif - Membutuhkan Donor',
      color: 'bg-green-100 text-green-800 border-green-200',
      disabled: false
    };
  };
  
  const campaignStatus = getCampaignStatus();
  const isDisabled = campaignStatus.disabled;

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
        title: campaign.title,
        text: campaign.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  return (
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
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-red-100 to-red-200">
              {campaign.url_file ? (
                <img 
                  src={campaign.url_file} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback Image */}
              <div className={`w-full h-full flex items-center justify-center ${campaign.url_file ? 'hidden' : ''}`}>
                <div className="text-center">
                  <HeartIcon className="w-20 h-20 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 font-semibold text-lg">Kampanye Donor Darah</p>
                </div>
              </div>

              {/* Completion Overlay */}
              {isDisabled && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">
                      {progress >= 100 ? '✅' : '⏰'}
                    </div>
                    <div className="text-lg font-bold">
                      {progress >= 100 ? 'SELESAI' : 'BERAKHIR'}
                    </div>
                    <div className="text-sm opacity-90">
                      {progress >= 100 ? 'Target donor tercapai' : 'Deadline terlewat'}
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                  <AlertTriangleIcon className="w-3 h-3 mr-1" />
                  {getUrgencyText(campaign.urgencyLevel)}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                  {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Berakhir'}
                </span>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
              
              {/* Organizer */}
              <div className="flex items-center mb-6">
                <img 
                  src={campaign.organizer.avatar} 
                  alt={campaign.organizer.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{campaign.organizer.name}</span>
                    {campaign.organizer.verified && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-500 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{campaign.organizer.role}</p>
                </div>
              </div>

              {/* Blood Types Needed */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Golongan Darah yang Dibutuhkan</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.bloodType.map((type, index) => (
                    <span 
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-2 rounded-lg font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Image Section */}
              {campaign.url_file && campaign.url_file !== 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Dokumentasi Campaign</h3>
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={campaign.url_file} 
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback */}
                    <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-500">
                        <HeartIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Gambar tidak dapat dimuat</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Deskripsi Campaign</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Lokasi Donasi</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{campaign.hospital}</p>
                        <p className="text-gray-600">{campaign.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Kontak Person</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{campaign.contactPerson}</p>
                        <p className="text-gray-600">{campaign.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Mulai Campaign</p>
                      <p className="text-gray-600">{new Date(campaign.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Deadline</p>
                      <p className="text-gray-600">{new Date(campaign.deadline).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Donasi</h3>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {campaign.currentDonors}
                </div>
                <p className="text-gray-600">dari {campaign.targetDonors} donor</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className={`h-4 rounded-full transition-all duration-300 ${
                      progress >= 100
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progress.toFixed(1)}% tercapai</span>
                  <span>{campaign.targetDonors - campaign.currentDonors} donor lagi</span>
                </div>
                {progress >= 100 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    🎉 Target donor telah tercapai!
                  </p>
                )}
              </div>

              {/* Status Banner */}
              <div className={`mb-6 p-4 rounded-lg border ${campaignStatus.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Status Campaign</h4>
                    <p className="text-sm">{campaignStatus.text}</p>
                  </div>
                  {isDisabled && (
                    <div className="text-right">
                      <span className="text-xs font-medium">
                        {progress >= 100 ? 'Target Tercapai' : 'Tidak Aktif'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{campaign.currentDonors}</p>
                  <p className="text-xs text-gray-600">Donor Terdaftar</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{daysLeft > 0 ? daysLeft : 0}</p>
                  <p className="text-xs text-gray-600">Hari Tersisa</p>
                </div>
              </div>

              {/* Hospital Detail Button */}
              <button
                onClick={() => setIsHospitalModalOpen(true)}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mb-3"
              >
                <Building2Icon className="w-5 h-5" />
                <span>Lihat Detail Rumah Sakit</span>
              </button>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={isDisabled ? undefined : () => setIsModalOpen(true)}
                  disabled={isDisabled}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                    isDisabled
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  title={isDisabled ? 'Campaign sudah selesai atau berakhir' : 'Klik untuk donor'}
                >
                  <HeartIcon className="w-5 h-5 mr-2" />
                  {isDisabled 
                    ? (progress >= 100 ? 'Target Tercapai' : 'Tidak Dapat Donor') 
                    : 'Donor Sekarang'
                  }
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <ShareIcon className="w-5 h-5 mr-2" />
                  Bagikan Campaign
                </button>
              </div>

              {/* Disabled Info */}
              {isDisabled && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {progress >= 100 ? 'Campaign Selesai' : 'Campaign Berakhir'}
                      </p>
                      <p className="text-xs text-yellow-700">
                        {progress >= 100 
                          ? 'Target donor sudah tercapai. Terima kasih!' 
                          : 'Deadline campaign sudah terlewat.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Notice */}
              {campaign.urgencyLevel === 'critical' && !isDisabled && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Keadaan Darurat!</p>
                      <p className="text-sm text-red-700 mt-1">
                        Campaign ini membutuhkan bantuan segera. Setiap donasi sangat berarti.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Safety Guidelines */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🛡️ Panduan Keamanan</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Semua donasi melalui prosedur medis yang aman</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Menggunakan alat steril dan sekali pakai</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Pemeriksaan kesehatan gratis sebelum donasi</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Konsumsi dan istirahat setelah donasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donor Option Modal */}
      <DonorOptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onDonorNow={handleDonorNow}
        onScheduleOnly={handleScheduleOnly}
      />

      {/* Hospital Detail Modal */}
      <HospitalDetailModal
        isOpen={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        hospital={{
          id: 1,
          name: campaign.hospital,
          address: campaign.location,
          city: campaign.location.split(',')[0] || '',
          province: campaign.location.split(',')[1] || '',
          latitude: -6.2088,
          longitude: 106.8456,
          created_at: '',
          updated_at: ''
        }}
      />
    </div>
  );
};

export default CampaignDetailPage;