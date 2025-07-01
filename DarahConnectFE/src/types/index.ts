// API Response Types
export interface User {
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
  last_donation_date: string;
  donation_count: number;
  url_file: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface BloodCampaign {
  id: number;
  user_id: number;
  user: User;
  hospital_id: number;
  hospital: Hospital;
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  diagnosis: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
  status: 'pending' | 'verified' | 'completed' | 'rejected';
  event_type: 'campaign';
  url_file: string;
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignApiResponse {
  meta: {
    code: number;
    message: string;
  };
  data: BloodCampaign[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: BloodType;
  age: number;
  weight: number;
  lastDonation?: string;
  totalDonations: number;
  emergencyContact: string;
  medicalHistory?: string;
  isAvailable: boolean;
  location: string;
  avatar?: string;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface DonationRequest {
  id: string;
  campaignId: string;
  donorId: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestedDate: string;
  completedDate?: string;
  notes?: string;
}

// MetaMask and Wallet Types
export interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  balance: string;
  network: {
    chainId: number;
    name: string;
  } | null;
}

export interface MetaMaskError {
  code: number;
  message: string;
}

export interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface DonationTransaction extends WalletTransaction {
  campaignId: string;
  donorId: string;
  amount: string;
}

export interface BloodRequest {
  id: number;
  user_id: number;
  user: User;
  hospital_id: number;
  hospital: Hospital;
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  diagnosis: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
  status: 'pending' | 'verified' | 'completed' | 'rejected';
  event_type: 'blood_request';
  url_file: string;
  public_id: string;
  created_at: string;
  updated_at: string;
}

// Union type for both campaigns and blood requests
export type AdminBloodEvent = BloodCampaign | BloodRequest;

export interface AdminBloodRequestResponse {
  meta: {
    code: number;
    message: string;
  };
  data: AdminBloodEvent[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface HealthPassport {
  id: number;
  user_id: number;
  user: User;
  passport_number: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface HealthPassportResponse {
  meta: {
    code: number;
    message: string;
  };
  data: HealthPassport[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

// Admin Dashboard Types
export interface AdminDashboardData {
  campaign_active: number;
  donor_terverifikasi: number;
  request_pending: number;
  total_campaign: number;
  total_donor: number;
}

export interface AdminDashboardResponse {
  meta: {
    code: number;
    message: string;
  };
  data: AdminDashboardData;
} 