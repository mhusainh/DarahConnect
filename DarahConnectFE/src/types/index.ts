export interface BloodCampaign {
  id: string;
  title: string;
  description: string;
  hospital: string;
  location: string;
  targetDonors: number;
  currentDonors: number;
  bloodType: BloodType[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline: string;
  contactPerson: string;
  contactPhone: string;
  imageUrl: string;
  createdAt: string;
  organizer: {
    name: string;
    avatar: string;
    verified: boolean;
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