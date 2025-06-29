import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  CalendarIcon, 
  TrophyIcon, 
  PlusCircleIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  BellIcon,
  TrendingUpIcon,
  AwardIcon,
  ActivityIcon,
  GiftIcon,
  StarIcon,
  TargetIcon,
  AlertTriangle,
  Database,
  Shield,
  UserCheckIcon,
  BadgeIcon,
  ZapIcon,
  UserPlusIcon
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, CountUp, Floating, HoverScale } from '../components/ui/AnimatedComponents';
import { MorphingShape, GradientBackground } from '../components/ui/AdvancedAnimations';
import { HeartBeatLoader, DotsLoader } from '../components/ui/LoadingComponents';
import { AchievementBadge, CertificateCard } from '../components/ui/CertificateComponents';
import { QuickScheduleWidget, DonationScheduleCalendar } from '../components/ui/ScheduleComponents';
import { BloodRequestList, BloodRequestStats } from '../components/ui/BloodRequestComponents';
import { 
  MonthlyDonationChart, 
  BloodTypeChart, 
  WeeklyGoalsChart, 
  DonationTrendChart,
  HospitalPartnershipChart 
} from '../components/ui/ChartComponents';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WalletConnectBanner from '../components/WalletConnectBanner';
import { campaigns, donationRequests } from '../data/dummy';
import { BloodCampaign, DonationRequest } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // All hooks must be called at the top level
  const [userName] = useState(localStorage.getItem('userName') || 'Donor');
  const [userDonations, setUserDonations] = useState<DonationRequest[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<BloodCampaign[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'certificate' | 'requests' | 'achievements' | 'analytics'>('overview');
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'Campaign Mendesak!',
      message: 'RS Hasan Sadikin membutuhkan donor O+ untuk operasi darurat',
      time: '5 menit yang lalu',
      unread: true
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Pencapaian Baru!',
      message: 'Anda telah mencapai 10 kali donasi darah',
      time: '2 jam yang lalu',
      unread: true
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Pengingat Donasi',
      message: 'Sudah waktunya untuk donasi rutin Anda',
      time: '1 hari yang lalu',
      unread: false
    }
  ]);

  const [monthlyGoal, setMonthlyGoal] = useState({
    target: 2,
    current: 1,
    percentage: 50
  });

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          from: '/dashboard',
          message: 'Silakan login terlebih dahulu untuk mengakses dashboard.' 
        } 
      });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter donations for current user (simulate)
    setUserDonations(donationRequests);
    setActiveCampaigns(campaigns.slice(0, 3)); // Show first 3 campaigns
  }, []);

  // Don't render dashboard if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <WalletConnectBanner />
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <HeartBeatLoader size={60} />
            <p className="mt-4 text-gray-600 text-lg">Mengalihkan ke halaman login...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const quickStats = {
    totalDonations: 12,
    livesSaved: 36,
    level: 5,
    badges: 8,
    points: 2450
  };

  // Generate realistic schedule dates for current and next month
  const getRealisticSchedules = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return [
      {
        id: 'SCH-001',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`,
        time: '08:00 - 12:00',
        location: 'Jl. Sudirman No. 123',
        hospital: 'RS Hasan Sadikin',
        capacity: 50,
        registered: 35,
        bloodTypesNeeded: ['O+', 'A+', 'B+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Berat minimal 45kg']
      },
      {
        id: 'SCH-002',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08`,
        time: '09:00 - 15:00',
        location: 'Jl. Asia Afrika No. 456',
        hospital: 'RS Santo Borromeus',
        capacity: 30,
        registered: 28,
        bloodTypesNeeded: ['AB+', 'O-'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Tidak sedang sakit']
      },
      {
        id: 'SCH-003',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
        time: '07:30 - 14:00',
        location: 'Jl. Dago No. 789',
        hospital: 'RS Al Islam',
        capacity: 40,
        registered: 25,
        bloodTypesNeeded: ['A-', 'B-', 'O+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Puasa minimal 4 jam']
      },
      {
        id: 'SCH-004',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
        time: '08:30 - 13:00',
        location: 'Jl. Pasteur No. 38',
        hospital: 'RS Advent Bandung',
        capacity: 35,
        registered: 20,
        bloodTypesNeeded: ['O+', 'A-', 'B+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Tidak sedang hamil']
      },
      {
        id: 'SCH-005',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-18`,
        time: '09:00 - 14:30',
        location: 'Jl. Cihampelas No. 161',
        hospital: 'RS Hermina Arcamanik',
        capacity: 45,
        registered: 32,
        bloodTypesNeeded: ['AB-', 'O-', 'A+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Berat minimal 45kg']
      },
      {
        id: 'SCH-006',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22`,
        time: '08:00 - 13:30',
        location: 'Jl. Soekarno Hatta No. 644',
        hospital: 'RS Immanuel',
        capacity: 25,
        registered: 18,
        bloodTypesNeeded: ['B-', 'AB+', 'O+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Tidak minum alkohol 24 jam sebelumnya']
      },
      {
        id: 'SCH-007',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25`,
        time: '07:00 - 12:00',
        location: 'Jl. Djuanda No. 95',
        hospital: 'RS Rajawali',
        capacity: 60,
        registered: 45,
        bloodTypesNeeded: ['O+', 'A+', 'B+', 'AB+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Istirahat cukup']
      },
      {
        id: 'SCH-008',
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-28`,
        time: '09:30 - 15:00',
        location: 'Jl. Buah Batu No. 212',
        hospital: 'RS Santosa',
        capacity: 38,
        registered: 30,
        bloodTypesNeeded: ['A-', 'B-', 'O-'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Sarapan ringan sebelum donor']
      },
      // Next month schedules
      {
        id: 'SCH-009',
        date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-03`,
        time: '08:00 - 13:00',
        location: 'Jl. Riau No. 88',
        hospital: 'RS Advent Bandung',
        capacity: 42,
        registered: 15,
        bloodTypesNeeded: ['O+', 'A+'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Berat minimal 45kg']
      },
      {
        id: 'SCH-010',
        date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-07`,
        time: '09:00 - 14:00',
        location: 'Jl. Dipatiukur No. 35',
        hospital: 'RS Al Islam',
        capacity: 55,
        registered: 20,
        bloodTypesNeeded: ['AB+', 'AB-', 'O-'],
        status: 'upcoming' as const,
        requirements: ['Usia 17-65 tahun', 'Tidak sedang menstruasi']
      }
    ];
  };

  const sampleSchedules = getRealisticSchedules();

  const sampleBloodRequests = [
    {
      id: 'REQ-001',
      patientName: 'Siti Nurhaliza',
      bloodType: 'A+',
      unitsNeeded: 3,
      urgency: 'critical' as const,
      hospital: 'RS Advent Bandung',
      location: 'Jl. Cihampelas No. 161',
      contactPerson: 'Dr. Budi Santoso',
      contactPhone: '08123456789',
      neededBy: '2024-02-10T18:00',
      description: 'Pasien mengalami kecelakaan lalu lintas dan membutuhkan transfusi darah segera untuk operasi darurat.',
      status: 'active' as const,
      createdAt: '2024-02-08T10:30:00Z',
      donors: ['donor1', 'donor2']
    },
    {
      id: 'REQ-002',
      patientName: 'Muhammad Fadli',
      bloodType: 'O-',
      unitsNeeded: 2,
      urgency: 'urgent' as const,
      hospital: 'RS Al Islam',
      location: 'Jl. Soekarno Hatta No. 644',
      contactPerson: 'Nurse Ani',
      contactPhone: '08198765432',
      neededBy: '2024-02-12T12:00',
      description: 'Pasien thalasemia membutuhkan transfusi rutin untuk menjaga kondisi kesehatannya.',
      status: 'active' as const,
      createdAt: '2024-02-07T15:45:00Z',
      donors: ['donor3']
    },
    {
      id: 'REQ-003',
      patientName: 'Dewi Sartika',
      bloodType: 'B+',
      unitsNeeded: 1,
      urgency: 'normal' as const,
      hospital: 'RS Hasan Sadikin',
      location: 'Jl. Pasteur No. 38',
      contactPerson: 'Dr. Indira',
      contactPhone: '08187654321',
      neededBy: '2024-02-14T10:00',
      description: 'Persiapan operasi jantung yang dijadwalkan minggu depan.',
      status: 'active' as const,
      createdAt: '2024-02-06T14:20:00Z',
      donors: []
    }
  ];

  const blockchainCertificate = {
    id: 'CERT-2024-001',
    blockchainId: 'BC-CERT-0x9F8E7D6C5B4A',
    transactionHash: '0x7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
    timestamp: '20 Desember 2023, 09:15 WIB',
    verified: true
  };

  const achievements = [
    {
      title: 'Hero Sejati',
      description: 'Donasi 10 kali',
      icon: <StarIcon className="w-6 h-6" />,
      earned: true
    },
    {
      title: 'Konsisten',
      description: 'Donasi rutin 6 bulan',
      icon: <CalendarIcon className="w-6 h-6" />,
      earned: true
    },
    {
      title: 'Life Saver',
      description: 'Selamatkan 50 nyawa',
      icon: <HeartIcon className="w-6 h-6" />,
      earned: false,
      progress: 72
    },
    {
      title: 'Donor Pertama',
      description: 'Menyelesaikan donasi darah pertama',
      icon: <GiftIcon className="w-6 h-6" />,
      earned: true
    },
    {
      title: 'Super Hero',
      description: 'Melakukan 20 kali donasi darah',
      icon: <TrophyIcon className="w-6 h-6" />,
      earned: false,
      progress: 60
    },
    {
      title: 'Hadiah Spesial',
      description: 'Mencapai 25 kali donasi darah',
      icon: <AwardIcon className="w-6 h-6" />,
      earned: false,
      progress: 48
    }
  ];

  // Chart Data
  const monthlyDonationData = [
    { month: 'Jan', donations: 45, volunteers: 12, bloodUnits: 180 },
    { month: 'Feb', donations: 52, volunteers: 15, bloodUnits: 208 },
    { month: 'Mar', donations: 38, volunteers: 10, bloodUnits: 152 },
    { month: 'Apr', donations: 67, volunteers: 18, bloodUnits: 268 },
    { month: 'May', donations: 71, volunteers: 20, bloodUnits: 284 },
    { month: 'Jun', donations: 58, volunteers: 16, bloodUnits: 232 },
  ];

  const bloodTypeData = [
    { bloodType: 'O+', count: 156, percentage: 35 },
    { bloodType: 'A+', count: 134, percentage: 30 },
    { bloodType: 'B+', count: 89, percentage: 20 },
    { bloodType: 'AB+', count: 45, percentage: 10 },
    { bloodType: 'O-', count: 12, percentage: 3 },
    { bloodType: 'A-', count: 6, percentage: 1.5 },
    { bloodType: 'B-', count: 2, percentage: 0.5 },
  ];

  const weeklyGoalsData = [
    { week: 'Week 1', target: 20, achieved: 18 },
    { week: 'Week 2', target: 25, achieved: 27 },
    { week: 'Week 3', target: 22, achieved: 19 },
    { week: 'Week 4', target: 30, achieved: 32 },
  ];

  const donationTrendData = [
    { date: '1 Jan', donations: 12, emergencyRequests: 3 },
    { date: '8 Jan', donations: 15, emergencyRequests: 5 },
    { date: '15 Jan', donations: 18, emergencyRequests: 2 },
    { date: '22 Jan', donations: 22, emergencyRequests: 4 },
    { date: '29 Jan', donations: 25, emergencyRequests: 6 },
    { date: '5 Feb', donations: 20, emergencyRequests: 3 },
  ];

  const hospitalData = [
    { hospital: 'RS Hasan Sadikin', donations: 145, rating: 4.8 },
    { hospital: 'RS Advent', donations: 132, rating: 4.7 },
    { hospital: 'RS Al Islam', donations: 98, rating: 4.6 },
    { hospital: 'RS Santo Borromeus', donations: 87, rating: 4.5 },
    { hospital: 'RS Hermina', donations: 76, rating: 4.4 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      default: return 'Unknown';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'achievement': return 'border-yellow-500 bg-yellow-50';
      case 'reminder': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const handleBloodRequestRespond = (requestId: string) => {
    alert(`Terima kasih! Anda akan dihubungi untuk koordinasi donor darah (Request ID: ${requestId})`);
  };

  const handleDonateNow = () => {
    navigate('/donor-register');
  };

  const handleJoinNow = () => {
    navigate('/register');
  };

  const handleScheduleDonation = () => {
    setActiveTab('schedule');
  };

  const handleViewCertificate = () => {
    setActiveTab('certificate');
  };

  const handleViewAchievements = () => {
    setActiveTab('achievements');
  };

  const handleCreateBloodRequest = () => {
    navigate('/create-blood-request');
  };

  const handleHealthPassport = () => {
    navigate('/health-passport');
  };

  const handleScheduleSelect = (schedule: any) => {
    alert(`Anda akan diarahkan ke form pendaftaran untuk jadwal donor di ${schedule.hospital} pada ${schedule.date}`);
    navigate('/donor-register');
  };

  if (!isPageLoaded) {
    return (
      <>
        <WalletConnectBanner />
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <HeartBeatLoader size={60} />
            <p className="mt-4 text-gray-600 text-lg">Memuat Dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <WalletConnectBanner />
      <Header />
      <FadeIn direction="up" duration={0.8}>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <FadeIn direction="up">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Dashboard Donor
                    </h1>
                    <p className="text-gray-600">
                      Selamat datang kembali, {userName}! Mari lanjutkan perjalanan mulia Anda.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Floating intensity={5} duration={3}>
                      <div className="relative">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        {notifications.filter(n => n.unread).length > 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {notifications.filter(n => n.unread).length}
                            </span>
                          </div>
                        )}
                      </div>
                    </Floating>
                    
                    <HeartBeatLoader size={30} />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Quick Stats */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8" staggerDelay={0.1}>
              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">Total Donasi</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={quickStats.totalDonations} duration={2} delay={0.2} />
                        </p>
                      </div>
                      <HeartIcon className="w-10 h-10 text-red-200" />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>

              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Nyawa Diselamatkan</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={quickStats.livesSaved} duration={2} delay={0.4} />
                        </p>
                      </div>
                      <UserCheckIcon className="w-10 h-10 text-green-200" />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>

              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Level Donor</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={quickStats.level} duration={2} delay={0.6} />
                        </p>
                      </div>
                      <TrophyIcon className="w-10 h-10 text-blue-200" />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>

              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Badge Diraih</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={quickStats.badges} duration={2} delay={0.8} />
                        </p>
                      </div>
                      <BadgeIcon className="w-10 h-10 text-purple-200" />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>

              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Poin Reward</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={quickStats.points} duration={2} delay={0.8} />
                        </p>
                      </div>
                      <GiftIcon className="w-10 h-10 text-yellow-200" />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>
            </StaggerContainer>

            {/* Navigation Tabs */}
            <FadeIn direction="up" delay={0.3}>
              <div className="bg-white rounded-lg shadow-sm p-1 mb-8">
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'overview', label: 'Overview', icon: <TargetIcon className="w-5 h-5" /> },
                    { key: 'schedule', label: 'Jadwal Donor', icon: <CalendarIcon className="w-5 h-5" /> },
                    { key: 'certificate', label: 'Sertifikat', icon: <Database className="w-5 h-5" /> },
                    { key: 'requests', label: 'Request Darah', icon: <AlertTriangle className="w-5 h-5" /> },
                    { key: 'achievements', label: 'Pencapaian', icon: <AwardIcon className="w-5 h-5" /> },
                    { key: 'analytics', label: 'Analytics', icon: <TrendingUpIcon className="w-5 h-5" /> }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                        activeTab === tab.key
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Monthly Goal */}
                    <FadeIn direction="up" delay={0.2}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Target Bulanan</h3>
                          <TargetIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium text-gray-900">
                                {monthlyGoal.current}/{monthlyGoal.target} donasi
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${monthlyGoal.percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {monthlyGoal.percentage}% dari target bulanan
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600 mb-1">
                              <CountUp end={monthlyGoal.percentage} suffix="%" duration={2} />
                            </div>
                            <p className="text-sm text-gray-600">Tercapai</p>
                          </div>
                        </div>
                      </div>
                    </FadeIn>

                    {/* Quick Emergency Preview */}
                    <FadeIn direction="up" delay={0.4}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Request Darurat Terbaru</h3>
                          <button
                            onClick={() => setActiveTab('requests')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors hover:scale-105"
                          >
                            Lihat Semua →
                          </button>
                        </div>
                        
                        <BloodRequestStats requests={sampleBloodRequests} />
                      </div>
                    </FadeIn>

                    {/* Recent Achievements */}
                    <FadeIn direction="up" delay={0.6}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Pencapaian</h3>
                          <button
                            onClick={handleViewAchievements}
                            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors hover:scale-105"
                          >
                            Lihat Semua →
                          </button>
                        </div>
                        
                        {/* Achievement Stats Grid - Similar to BloodRequestStats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <TrophyIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">Badge Diraih</p>
                                <p className="text-xl font-bold text-yellow-800">{achievements.filter(a => a.earned).length}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                                <TargetIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-green-700">Dalam Progress</p>
                                <p className="text-xl font-bold text-green-800">{achievements.filter(a => !a.earned).length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Latest Achievement Preview */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Pencapaian Terbaru</h4>
                          {achievements.filter(a => a.earned).slice(-1).map((achievement, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white">
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                                <p className="text-xs text-gray-600">{achievement.description}</p>
                              </div>
                              <div className="text-green-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Notifications */}
                    <FadeIn direction="right" delay={0.2}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Notifikasi</h3>
                          <div className="relative">
                            <BellIcon className="w-6 h-6 text-gray-600" />
                            {notifications.filter(n => n.unread).length > 0 && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {notifications.map((notification, index) => (
                            <div 
                              key={notification.id}
                              className={`border-l-4 rounded-lg p-3 ${getNotificationColor(notification.type)} ${
                                notification.unread ? 'font-medium' : 'opacity-75'
                              }`}
                            >
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>

                    {/* Quick Actions */}
                    <FadeIn direction="left" delay={0.4}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Aksi Cepat</h3>
                          <ZapIcon className="w-6 h-6 text-orange-500" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={handleScheduleDonation}
                              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg text-center hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-105"
                            >
                              <CalendarIcon className="w-6 h-6 mx-auto mb-2" />
                              <span className="text-sm font-medium">Jadwalkan Donasi</span>
                            </button>
                            
                            <button
                              onClick={handleJoinNow}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105"
                            >
                              <UserPlusIcon className="w-6 h-6 mx-auto mb-2" />
                              <span className="text-sm font-medium">Bergabung Sekarang</span>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={handleCreateBloodRequest}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg text-center hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105"
                            >
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <HeartIcon className="w-5 h-5" />
                                <PlusCircleIcon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">Buat Request</span>
                            </button>
                            
                            <button
                              onClick={handleHealthPassport}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105"
                            >
                              <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium">Health Passport</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Jadwal Donor Darah</h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Temukan jadwal donor darah terdekat dan daftar langsung untuk berkontribusi menyelamatkan nyawa.
                      </p>
                    </div>
                    
                    <DonationScheduleCalendar 
                      schedules={sampleSchedules}
                      onScheduleSelect={handleScheduleSelect}
                    />
                  </div>
                </FadeIn>
              )}

              {activeTab === 'certificate' && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Sertifikat Donor Darah</h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Lihat dan kelola sertifikat donor darah Anda yang terverifikasi blockchain
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Certificate Card 1 */}
                      <FadeIn direction="up" delay={0.2}>
                        <CertificateCard
                          donorName={userName}
                          bloodType="O+"
                          donationDate="2024-01-15"
                          donationCount={12}
                          certificateId="CERT-2024-001"
                          blockchainId="BC-CERT-0x9F8E7D6C5B4A"
                          type="main"
                          title="Sertifikat Donor"
                          onClick={() => navigate('/certificates')}
                        />
                      </FadeIn>

                      {/* Certificate Card 2 */}
                      <FadeIn direction="up" delay={0.3}>
                        <CertificateCard
                          donorName={userName}
                          bloodType="O+"
                          donationDate="2024-01-15"
                          donationCount={10}
                          certificateId="CERT-2024-002"
                          blockchainId="BC-BADGE-0x8E7D6C5B4A"
                          type="achievement"
                          title="Hero Donor"
                          onClick={() => navigate('/certificates')}
                        />
                      </FadeIn>

                      {/* Add More Certificate Card */}
                      <FadeIn direction="up" delay={0.4}>
                        <HoverScale scale={1.02}>
                          <div 
                            onClick={() => navigate('/donor-register')}
                            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px]"
                          >
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                              <PlusCircleIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Dapatkan Sertifikat Baru</h3>
                            <p className="text-gray-500 text-center text-sm mb-4">
                              Daftar donor darah untuk mendapatkan sertifikat digital baru
                            </p>
                            <div className="flex items-center space-x-2 text-red-600 font-medium">
                              <HeartIcon className="w-4 h-4" />
                              <span>Donor Sekarang</span>
                            </div>
                          </div>
                        </HoverScale>
                      </FadeIn>
                    </div>

                    {/* View All Certificates Button */}
                    <div className="text-center">
                      <HoverScale scale={1.05}>
                        <button
                          onClick={() => navigate('/certificates')}
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
                        >
                          <AwardIcon className="w-5 h-5" />
                          <span>Lihat Semua Sertifikat</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </HoverScale>
                    </div>
                  </div>
                </FadeIn>
              )}

              {activeTab === 'achievements' && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Pencapaian & Badge</h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Kumpulan pencapaian dan badge yang telah Anda raih dalam perjalanan donor darah.
                      </p>
                    </div>
                    
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                      {achievements.map((achievement, index) => (
                        <StaggerItem key={index}>
                          <AchievementBadge {...achievement} />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                </FadeIn>
              )}

              {activeTab === 'requests' && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Darah Darurat</h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Sistem permintaan darah darurat untuk respons cepat menyelamatkan nyawa.
                      </p>
                    </div>
                    
                    <BloodRequestStats requests={sampleBloodRequests} />
                    <BloodRequestList 
                      requests={sampleBloodRequests} 
                      onRespond={handleBloodRequestRespond}
                      onCreateRequest={handleCreateBloodRequest}
                    />
                  </div>
                </FadeIn>
              )}

              {activeTab === 'analytics' && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics & Statistik</h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Analisis mendalam tentang aktivitas donasi darah dan tren komunitas.
                      </p>
                    </div>
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <MonthlyDonationChart data={monthlyDonationData} />
                      <BloodTypeChart data={bloodTypeData} />
                      <WeeklyGoalsChart data={weeklyGoalsData} />
                      <DonationTrendChart data={donationTrendData} />
                    </div>
                    
                    {/* Full Width Chart */}
                    <div className="mt-8">
                      <HospitalPartnershipChart data={hospitalData} />
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
      <Footer />
    </>
  );
};

export default DashboardPage; 