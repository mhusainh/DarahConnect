import { BloodCampaign, Donor, DonationRequest, AdminUser, AdminStats, AdminNotification } from '../types';

export const campaigns: BloodCampaign[] = [
  {
    id: '1',
    title: 'Bantuan Darah Untuk Korban Kecelakaan Tol',
    description: 'Dibutuhkan segera donor darah untuk korban kecelakaan beruntun di Tol Jakarta-Cikampek. Korban membutuhkan transfusi darah segera untuk operasi darurat.',
    hospital: 'RS Mitra Keluarga Bekasi',
    location: 'Bekasi, Jawa Barat',
    targetDonors: 20,
    currentDonors: 7,
    bloodType: ['O+', 'O-', 'A+'],
    urgencyLevel: 'critical',
    deadline: '2024-12-25',
    contactPerson: 'Dr. Sarah Wijaya',
    contactPhone: '021-8899-7766',
    url_file: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    createdAt: '2024-12-20',
    organizer: {
      name: 'Tim Medis RS Mitra Keluarga',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      verified: true,
      role: 'Rumah Sakit'
    }
  },
];

export const donors: Donor[] = [
  {
    id: '1',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@email.com',
    phone: '0812-3456-7890',
    bloodType: 'O+',
    age: 28,
    weight: 70,
    lastDonation: '2024-11-15',
    totalDonations: 12,
    emergencyContact: '0813-9876-5432',
    isAvailable: true,
    location: 'Jakarta Selatan, DKI Jakarta',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    verified: true
  },
  {
    id: '2',
    name: 'Sari Dewi',
    email: 'sari.dewi@email.com',
    phone: '0821-5678-9012',
    bloodType: 'A+',
    age: 25,
    weight: 55,
    lastDonation: '2024-10-20',
    totalDonations: 8,
    emergencyContact: '0822-1234-5678',
    isAvailable: true,
    location: 'Bandung, Jawa Barat',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    verified: true
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    phone: '0813-4567-8901',
    bloodType: 'B+',
    age: 35,
    weight: 75,
    lastDonation: '2024-12-01',
    totalDonations: 25,
    emergencyContact: '0814-8765-4321',
    isAvailable: false,
    location: 'Surabaya, Jawa Timur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    verified: false
  }
];

export const donationRequests: DonationRequest[] = [
  {
    id: '1',
    campaignId: '1',
    donorId: '1',
    status: 'approved',
    requestedDate: '2024-12-21',
    notes: 'Siap datang besok pagi'
  },
  {
    id: '2',
    campaignId: '2',
    donorId: '2',
    status: 'pending',
    requestedDate: '2024-12-22'
  },
  {
    id: '3',
    campaignId: '3',
    donorId: '3',
    status: 'completed',
    requestedDate: '2024-12-19',
    completedDate: '2024-12-20',
    notes: 'Donasi berhasil dilakukan'
  }
];

// Admin data
export const adminUsers: AdminUser[] = [
  {
    id: 'admin1',
    name: 'Dr. Andi Wijaya',
    email: 'admin@darahconnect.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-20T08:30:00Z',
    permissions: []
  },
  {
    id: 'admin2',
    name: 'Siti Nurhaliza',
    email: 'siti.admin@darahconnect.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-19T14:15:00Z',
    permissions: []
  }
];

export const adminStats: AdminStats = {
  totalCampaigns: 4,
  activeCampaigns: 3,
  totalDonors: 3,
  verifiedDonors: 2,
  totalRequests: 3,
  pendingRequests: 1,
  completedDonations: 1,
  urgentCampaigns: 2
};

export const adminNotifications: AdminNotification[] = [
  {
    id: '1',
    title: 'Campaign Baru Membutuhkan Persetujuan',
    message: 'Campaign "Bantuan Darah Untuk Korban Kecelakaan Tol" membutuhkan verifikasi admin',
    type: 'warning',
    createdAt: '2024-12-20T10:30:00Z',
    read: false,
    actionUrl: '/admin/campaigns/1'
  },
  {
    id: '2',
    title: 'Donor Baru Mendaftar',
    message: '5 donor baru telah mendaftar dan menunggu verifikasi',
    type: 'info',
    createdAt: '2024-12-20T09:15:00Z',
    read: false,
    actionUrl: '/admin/donors'
  },
  {
    id: '3',
    title: 'Campaign Urgent',
    message: 'Campaign "Bantu Anak Thalasemia" memiliki tingkat urgensi tinggi',
    type: 'error',
    createdAt: '2024-12-19T16:45:00Z',
    read: true,
    actionUrl: '/admin/campaigns/3'
  }
]; 