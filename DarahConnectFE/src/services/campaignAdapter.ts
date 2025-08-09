import { BloodCampaign as ApiCampaign } from '../types/index';
import { BloodCampaign as ComponentCampaign, BloodType } from '../types';

// Adapter untuk mengkonversi data API ke format yang diharapkan komponen
export const adaptCampaignFromApi = (apiCampaign: ApiCampaign): ComponentCampaign => {
  // Default image jika tidak ada
  const defaultImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
  
  // Format urgency level ke format component
  const mapUrgencyLevel = (apiLevel: string): 'low' | 'medium' | 'high' | 'critical' => {
    switch (apiLevel.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  // Format lokasi - handle berbagai kemungkinan struktur
  let location = 'Lokasi tidak diketahui';
  if (apiCampaign.hospital?.address) {
    location = apiCampaign.hospital.address;
  } else if (apiCampaign.hospital?.city || apiCampaign.hospital?.province) {
    const cityPart = apiCampaign.hospital.city || '';
    const provincePart = apiCampaign.hospital.province || '';
    location = [cityPart, provincePart].filter(Boolean).join(', ') || 'Lokasi tidak diketahui';
  }

  return {
    id: apiCampaign.id.toString(),
    title: apiCampaign.event_name || `Donor Darah untuk ${apiCampaign.patient_name || 'Pasien'}`,
    description: apiCampaign.diagnosis || 'Bantuan donor darah dibutuhkan',
    hospital: apiCampaign.hospital?.name || 'Rumah Sakit',
    location: location,
    // Preserve hospital coordinates for map functionality
    hospitalCoordinates: apiCampaign.hospital ? {
      latitude: apiCampaign.hospital.latitude,
      longitude: apiCampaign.hospital.longitude,
      city: apiCampaign.hospital.city,
      province: apiCampaign.hospital.province,
      address: apiCampaign.hospital.address
    } : null,
    targetDonors: apiCampaign.slots_available || 1,
    currentDonors: apiCampaign.slots_booked || 0,
    bloodType: apiCampaign.blood_type ? [apiCampaign.blood_type as BloodType] : ['O+' as BloodType], // Convert single string to array, default to O+
    urgencyLevel: mapUrgencyLevel(apiCampaign.urgency_level || 'medium'),
    deadline: apiCampaign.event_date || new Date().toISOString(),
    contactPerson: apiCampaign.user?.name || 'Contact Person',
    contactPhone: apiCampaign.user?.phone || '-',
    imageUrl: apiCampaign.user?.url_file || defaultImage,
    url_file: apiCampaign.url_file || defaultImage,
    createdAt: apiCampaign.created_at || new Date().toISOString(),
    organizer: {
      name: apiCampaign.user?.name || 'Organizer',
      avatar: apiCampaign.user?.url_file || 'https://via.placeholder.com/40',
      verified: apiCampaign.user?.is_verified || false,
      role: apiCampaign.user?.role || 'User'
    }
  };
};

// Adapter untuk mengkonversi array campaign
export const adaptCampaignsFromApi = (apiCampaigns: ApiCampaign[]): ComponentCampaign[] => {
  return apiCampaigns.map(adaptCampaignFromApi);
}; 