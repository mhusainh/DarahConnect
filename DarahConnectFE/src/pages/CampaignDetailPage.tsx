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
  HeartIcon
} from 'lucide-react';
import { campaigns } from '../data/dummy';
import { BloodCampaign } from '../types';
import DonationModal from '../components/DonationModal';

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading campaign data
    setTimeout(() => {
      const foundCampaign = campaigns.find(c => c.id === id);
      setCampaign(foundCampaign || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

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

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Campaign yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Kembali ke Campaigns
          </button>
        </div>
      </div>
    );
  }

  const progress = (campaign.currentDonors / campaign.targetDonors) * 100;
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

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
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
              <img 
                src={campaign.imageUrl} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
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
                    className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progress.toFixed(1)}% tercapai</span>
                  <span>{campaign.targetDonors - campaign.currentDonors} donor lagi</span>
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

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Donasi Sekarang
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <ShareIcon className="w-5 h-5 mr-2" />
                  Bagikan Campaign
                </button>
              </div>

              {/* Emergency Notice */}
              {campaign.urgencyLevel === 'critical' && (
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

      {/* Donation Modal */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onSubmit={(data) => {
          console.log('Donation submitted:', data);
          alert('Pendaftaran donasi berhasil! Kami akan menghubungi Anda segera.');
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default CampaignDetailPage; 