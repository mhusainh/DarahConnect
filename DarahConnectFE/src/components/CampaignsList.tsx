import React, { useState } from 'react';
import { FilterIcon, MapPinIcon, CalendarIcon, SearchIcon } from 'lucide-react';
import { BloodCampaign, BloodType } from '../types';
import CampaignCard from './CampaignCard';
import { FadeIn, StaggerContainer, StaggerItem } from './ui/AnimatedComponents';
import { MagneticButton } from './ui/AdvancedAnimations';

interface CampaignsListProps {
  campaigns: BloodCampaign[];
  onViewDetails?: (campaign: BloodCampaign) => void;
  onDonate?: (campaign: BloodCampaign) => void;
  onCryptoDonate?: (campaign: BloodCampaign) => void;
}

const CampaignsList: React.FC<CampaignsListProps> = ({ 
  campaigns, 
  onViewDetails, 
  onDonate,
  onCryptoDonate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = !selectedBloodType || campaign.bloodType.includes(selectedBloodType);
    const matchesUrgency = !selectedUrgency || campaign.urgencyLevel === selectedUrgency;
    const matchesLocation = !selectedLocation || campaign.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesBloodType && matchesUrgency && matchesLocation;
  });

  // Get unique values for filters
  const bloodTypes = Array.from(new Set(campaigns.flatMap(c => c.bloodType)));
  const urgencyLevels = Array.from(new Set(campaigns.map(c => c.urgencyLevel)));
  const locations = Array.from(new Set(campaigns.map(c => c.location)));

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Sangat Mendesak';
      case 'high': return 'Mendesak';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return urgency;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter Section */}
      <FadeIn direction="up" delay={0.1}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari campaign berdasarkan judul, deskripsi, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredCampaigns.length} dari {campaigns.length} campaign
            </p>
            <MagneticButton
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              strength={0.2}
            >
              <FilterIcon className="w-4 h-4" />
              <span>Filter</span>
            </MagneticButton>
          </div>

          {/* Filters */}
          {showFilters && (
            <FadeIn direction="down" delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                {/* Blood Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Golongan Darah
                  </label>
                  <select
                    value={selectedBloodType}
                    onChange={(e) => setSelectedBloodType(e.target.value as BloodType | '')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Semua</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Urgensi
                  </label>
                  <select
                    value={selectedUrgency}
                    onChange={(e) => setSelectedUrgency(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Semua</option>
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>{getUrgencyText(level)}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Semua</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </FadeIn>

      {/* Campaign Grid */}
      {filteredCampaigns.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {filteredCampaigns.map((campaign, index) => (
            <StaggerItem key={campaign.id}>
              <CampaignCard
                campaign={campaign}
                onViewDetails={onViewDetails}
                onDonate={onDonate}
                onCryptoDonate={onCryptoDonate}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <FadeIn direction="up" delay={0.3}>
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <SearchIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada campaign ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              Coba ubah kata kunci pencarian atau filter Anda
            </p>
            <MagneticButton
              onClick={() => {
                setSearchTerm('');
                setSelectedBloodType('');
                setSelectedUrgency('');
                setSelectedLocation('');
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              strength={0.3}
            >
              Reset Filter
            </MagneticButton>
          </div>
        </FadeIn>
      )}
    </div>
  );
};

export default CampaignsList; 