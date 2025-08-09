export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Organizer {
  name: string;
  avatar: string;
  verified: boolean;
  role: string;
}

export interface BloodCampaign {
  id: string;
  title: string;
  description: string;
  organizer: Organizer;
  hospital: string;
  location: string;
  // Hospital coordinates for map functionality
  hospitalCoordinates?: {
    latitude: number;
    longitude: number;
    city: string;
    province: string;
    address: string;
  } | null;
  bloodType: BloodType[];
  targetDonors: number;
  currentDonors: number;
  urgencyLevel: UrgencyLevel;
  contactPerson: string;
  contactPhone: string;
  deadline: string;
  createdAt: string;
  imageUrl: string;
  url_file: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: BloodType;
  age: number;
  weight: number;
  location: string;
  totalDonations: number;
  lastDonation: string;
  emergencyContact: string;
  isAvailable: boolean;
  avatar: string;
  verified: boolean;
}

export interface DonationRequest {
  id: string;
  campaignId: string;
  donorId: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  completedDate?: string;
  notes?: string;
}

// Admin-related types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  avatar: string;
  createdAt: string;
  lastLogin: string;
  permissions: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  module: 'campaigns' | 'donors' | 'requests' | 'users' | 'settings';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface AdminStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonors: number;
  verifiedDonors: number;
  totalRequests: number;
  pendingRequests: number;
  completedDonations: number;
  urgentCampaigns: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  read: boolean;
  actionUrl?: string;
} 