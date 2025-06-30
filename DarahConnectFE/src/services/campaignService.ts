import { useApi } from '../hooks/useApi';
import { CampaignApiResponse, BloodCampaign as ApiCampaign } from '../types/index';
import { BloodCampaign } from '../types';
import { adaptCampaignsFromApi, adaptCampaignFromApi } from './campaignAdapter';
import { debugConsole } from '../config/api';


export const useCampaignService = () => {
  const api = useApi();

  const fetchCampaigns = async (): Promise<BloodCampaign[]> => {
    try {
      const response = await api.get('/campaign');
      
      if (response.success && response.data) {
        // Check if response.data is already the campaigns array (useApi might extract it)
        if (Array.isArray(response.data)) {
          const adaptedCampaigns = adaptCampaignsFromApi(response.data);
          debugConsole.success('Successfully fetched and converted campaigns', adaptedCampaigns.length);
          return adaptedCampaigns;
        }
        
        // Otherwise, check if it has the full API response structure
        const apiData = response.data;
        
        // Check if we have the expected structure
        if (apiData.meta?.code === 200 && apiData.data && Array.isArray(apiData.data)) {
          const adaptedCampaigns = adaptCampaignsFromApi(apiData.data);
          debugConsole.success('Successfully fetched and converted campaigns from API response', adaptedCampaigns.length);
          return adaptedCampaigns;
        } else {
          debugConsole.error('Campaign response validation failed', {
            metaCode: apiData.meta?.code,
            metaMessage: apiData.meta?.message,
            hasData: !!apiData.data,
            isArray: Array.isArray(apiData.data)
          });
          return [];
        }
      } else {
        debugConsole.error('API call failed', response.error);
        return [];
      }
    } catch (error) {
      debugConsole.error('Error fetching campaigns', error);
      return [];
    }
  };

  const getCampaignById = async (id: number | string): Promise<BloodCampaign | null> => {
    try {
      const campaigns = await fetchCampaigns();
      const campaign = campaigns.find(campaign => campaign.id === String(id));
      if (campaign) {
        debugConsole.success(`Found campaign with ID: ${id}`);
      } else {
        debugConsole.log(`Campaign not found with ID: ${id}`);
      }
      return campaign || null;
    } catch (error) {
      debugConsole.error('Error fetching campaign by ID', error);
      return null;
    }
  };

  const getCampaignDetail = async (id: number | string): Promise<BloodCampaign | null> => {
    try {
      const response = await api.get(`/campaign-bloodRequest/${id}`);
      
      if (response.success && response.data) {
        // Check if response.data is already the campaign object
        if (typeof response.data === 'object' && response.data.id) {
          const adaptedCampaign = adaptCampaignFromApi(response.data);
          debugConsole.success(`Successfully fetched campaign detail for ID: ${id}`);
          return adaptedCampaign;
        }
        
        // Otherwise, check if it has the full API response structure
        const apiData = response.data;
        if (apiData.meta?.code === 200 && apiData.data) {
          const adaptedCampaign = adaptCampaignFromApi(apiData.data);
          debugConsole.success(`Successfully fetched campaign detail from API response for ID: ${id}`);
          return adaptedCampaign;
        } else {
          debugConsole.error('Campaign detail response validation failed', {
            metaCode: apiData.meta?.code,
            metaMessage: apiData.meta?.message,
            hasData: !!apiData.data
          });
          return null;
        }
      } else {
        debugConsole.error('Campaign detail API call failed', response.error);
        return null;
      }
    } catch (error) {
      debugConsole.error('Error fetching campaign detail', error);
      return null;
    }
  };

  const registerAsDonor = async (requestId: number, notes: string = "Saya bersedia mendonorkan darah untuk kegiatan ini"): Promise<boolean> => {
    try {
      const response = await api.post('/user/donor-registration', {
        request_id: requestId,
        notes: notes
      });
      
      if (response.success) {
        debugConsole.success(`Successfully registered as donor for request ID: ${requestId}`);
        return true;
      } else {
        debugConsole.error('Donor registration failed', response.error);
        return false;
      }
    } catch (error) {
      debugConsole.error('Error during donor registration', error);
      return false;
    }
  };

  const createSchedule = async (requestId: number, hospitalId: number, description: string): Promise<boolean> => {
    try {
      const response = await api.post('/user/schedule/', {
        request_id: requestId,
        hospital_id: hospitalId,
        description: description
      });
      
      if (response.success) {
        debugConsole.success(`Successfully created schedule for request ID: ${requestId}`);
        return true;
      } else {
        debugConsole.error('Schedule creation failed', response.error);
        return false;
      }
    } catch (error) {
      debugConsole.error('Error during schedule creation', error);
      return false;
    }
  };

  const donorNowWithSchedule = async (requestId: number, hospitalId: number, description: string, notes: string): Promise<boolean> => {
    try {
      // First create schedule
      const scheduleResponse = await api.post('/user/schedule/', {
        request_id: requestId,
        hospital_id: hospitalId,
        description: description
      });
      
      if (!scheduleResponse.success) {
        debugConsole.error('Schedule creation failed in donor now process', scheduleResponse.error);
        return false;
      }
      
      // Then register as donor
      const donorResponse = await api.post('/user/donor-registration', {
        request_id: requestId,
        notes: notes
      });
      
      if (donorResponse.success) {
        debugConsole.success(`Successfully completed donor now with schedule for request ID: ${requestId}`);
        return true;
      } else {
        debugConsole.error('Donor registration failed in donor now process', donorResponse.error);
        return false;
      }
    } catch (error) {
      debugConsole.error('Error during donor now with schedule process', error);
      return false;
    }
  };

  return {
    fetchCampaigns,
    getCampaignById,
    getCampaignDetail,
    registerAsDonor,
    createSchedule,
    donorNowWithSchedule
  };
};

// Utility functions untuk format data campaign
export const formatCampaignData = {
  // Format urgency level untuk display
  getUrgencyColor: (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Format status untuk display
  getStatusColor: (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Format tanggal untuk display
  formatDate: (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  },

  // Format tanggal dan waktu
  formatDateTime: (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calculate progress percentage
  getProgress: (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  },

  // Format blood type display
  formatBloodType: (bloodType: string) => {
    return bloodType || 'Semua';
  },

  // Get urgency icon
  getUrgencyIcon: (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⏰';
      case 'low': return '📋';
      default: return '📋';
    }
  }
};