import React, { useState } from 'react';
import { 
  MapPinIcon, 
  CalendarIcon, 
  PhoneIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  Wallet
} from 'lucide-react';
import { BloodCampaign } from '../types';
import { HoverScale, FadeIn, Pulse } from './ui/AnimatedComponents';
import { RippleEffect } from './ui/AdvancedAnimations';
import DonorOptionModal from './DonorOptionModal';
import { useCampaignService } from '../services/campaignService';
import { useNotification } from '../hooks/useNotification';

interface CampaignCardProps {
  campaign: BloodCampaign;
  onViewDetails?: (campaign: BloodCampaign) => void;
  onDonate?: (campaign: BloodCampaign) => void;
  onCryptoDonate?: (campaign: BloodCampaign) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onViewDetails, 
  onDonate,
  onCryptoDonate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const campaignService = useCampaignService();
  const { addNotification } = useNotification();
  const progress = (campaign.currentDonors / campaign.targetDonors) * 100;
  
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

  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleDonorNow = async (notes: string, hospitalId: number, description: string) => {
    try {
      const success = await campaignService.donorNowWithSchedule(Number(campaign.id), hospitalId, description, notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran dan Jadwal Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor dan jadwal telah dibuat. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
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

  return (
    <FadeIn direction="up" delay={0.1}>
      <HoverScale scale={1.02} duration={0.3}>
        <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={campaign.url_file} 
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute top-4 left-4">
              {campaign.urgencyLevel === 'critical' ? (
                <Pulse scale={[1, 1.1]} duration={1}>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                    <AlertTriangleIcon className="w-3 h-3 mr-1" />
                    {getUrgencyText(campaign.urgencyLevel)}
                  </span>
                </Pulse>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                  <AlertTriangleIcon className="w-3 h-3 mr-1" />
                  {getUrgencyText(campaign.urgencyLevel)}
                </span>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Berakhir'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
              {campaign.title}
            </h3>

            {/* Organizer */}
            <div className="flex items-center mb-3">
              <HoverScale scale={1.1} duration={0.2}>
                <img 
                  src={campaign.organizer.avatar} 
                  alt={campaign.organizer.name}
                  className="w-8 h-8 rounded-full mr-3"
                />
              </HoverScale>
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{campaign.organizer.name}</span>
                  {campaign.organizer.verified && (
                    <CheckCircleIcon className="w-4 h-4 text-blue-500 ml-1" />
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {campaign.description}
            </p>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                {campaign.hospital}, {campaign.location}
              </div>
              <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                {campaign.contactPerson} - {campaign.contactPhone}
              </div>
              <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                Deadline: {new Date(campaign.deadline).toLocaleDateString('id-ID')}
              </div>
            </div>

            {/* Blood Types */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Golongan darah yang dibutuhkan:</p>
              <div className="flex flex-wrap gap-2">
                {campaign.bloodType.map((type, index) => (
                  <HoverScale key={index} scale={1.05} duration={0.2}>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium hover:bg-primary-200 transition-colors cursor-default">
                      {type}
                    </span>
                  </HoverScale>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Progress Donor</span>
                <span className="text-sm text-gray-600">
                  {campaign.currentDonors}/{campaign.targetDonors} donor
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress.toFixed(1)}% tercapai
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="flex gap-3">
                <RippleEffect 
                  className="flex-1" 
                  color="rgba(107, 114, 128, 0.3)"
                >
                  <button 
                    onClick={() => onViewDetails?.(campaign)}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Lihat Detail
                  </button>
                </RippleEffect>
                
                <RippleEffect 
                  className="flex-1" 
                  color="rgba(255, 255, 255, 0.4)"
                >
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Donor Sekarang
                  </button>
                </RippleEffect>
              </div>
              
              {/* Crypto Donation Button */}
              {onCryptoDonate && (
                <RippleEffect 
                  className="w-full" 
                  color="rgba(59, 130, 246, 0.4)"
                >
                  <button 
                    onClick={() => onCryptoDonate(campaign)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-500/20"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="font-semibold">💎 Crypto Donation</span>
                  </button>
                </RippleEffect>
              )}
            </div>
          </div>
        </div>
      </HoverScale>

      {/* Donor Option Modal */}
      <DonorOptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onDonorNow={handleDonorNow}
        onScheduleOnly={handleScheduleOnly}
      />
    </FadeIn>
  );
};

export default CampaignCard;