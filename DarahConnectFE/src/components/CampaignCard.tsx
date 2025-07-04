import React, { useState } from 'react';
import { 
  MapPinIcon, 
  CalendarIcon, 
  PhoneIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  Wallet,
  HeartIcon
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
  const isFull = campaign.currentDonors >= campaign.targetDonors;
  
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
        <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col" style={{ minHeight: '550px', height: '100%' }}>
          {/* Image */}
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-red-100 to-red-200 flex-shrink-0">
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
                <HeartIcon className="w-12 h-12 text-red-400 mx-auto mb-1" />
                <p className="text-red-600 font-medium text-sm">Donor Darah</p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="absolute top-3 left-3">
              {campaign.urgencyLevel === 'critical' ? (
                <Pulse scale={[1, 1.1]} duration={1}>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                    {getUrgencyText(campaign.urgencyLevel)}
                  </span>
                </Pulse>
              ) : (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                  {getUrgencyText(campaign.urgencyLevel)}
                </span>
              )}
            </div>
            
            <div className="absolute top-3 right-3">
              <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Berakhir'}
              </span>
            </div>
            
            {/* Progress Indicator */}
            <div className="absolute bottom-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                isFull ? 'bg-green-600 text-white' : 'bg-black bg-opacity-70 text-white'
              }`}>
                {campaign.currentDonors}/{campaign.targetDonors}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-grow flex flex-col">
            {/* Title */}
            <h3 className="text-base font-bold text-gray-900 mb-2 flex-shrink-0" style={{
              height: '2.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {campaign.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 flex-shrink-0" style={{
              height: '3rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {campaign.description}
            </p>

            {/* Info */}
            <div className="space-y-2 mb-3 flex-grow">
              <div className="flex items-center text-sm text-gray-600 truncate">
                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{campaign.hospital}, {campaign.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>Deadline: {new Date(campaign.deadline).toLocaleDateString('id-ID')}</span>
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

            {/* Progress */}
            <div className="mb-4 flex-shrink-0 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-700">Progress Donor</span>
                <span className="text-sm text-gray-600">
                  {campaign.currentDonors}/{campaign.targetDonors}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    isFull ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              {isFull && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  ✓ Target tercapai!
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              {/* Primary Actions */}
              <div className="flex gap-2">
                <RippleEffect 
                  className="flex-1" 
                  color="rgba(107, 114, 128, 0.3)"
                >
                  <button 
                    onClick={() => onViewDetails?.(campaign)}
                    className="w-full border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Lihat Detail
                  </button>
                </RippleEffect>
                
                <RippleEffect 
                  className="flex-1" 
                  color="rgba(255, 255, 255, 0.4)"
                >
                  <button 
                    onClick={() => { if (!isFull) setIsModalOpen(true); }}
                    disabled={isFull}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md flex items-center justify-center
                      ${isFull
                        ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg'
                      }`
                    }
                  >
                    {isFull ? 'Slot Penuh' : 'Donor Sekarang'}
                  </button>
                </RippleEffect>
              </div>
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