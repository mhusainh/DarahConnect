import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  UserPlusIcon,
  Heart,
  User,
  Phone,
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useNotification } from "../hooks/useNotification";
import { useCampaignService } from "../services/campaignService";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
  Floating,
  HoverScale,
} from "../components/ui/AnimatedComponents";
import DonorOptionModal from "../components/DonorOptionModal";
import {
  MorphingShape,
  GradientBackground,
} from "../components/ui/AdvancedAnimations";
import {
  HeartBeatLoader,
  DotsLoader,
} from "../components/ui/LoadingComponents";
import {
  AchievementBadge,
  CertificateCard,
} from "../components/ui/CertificateComponents";
import {
  QuickScheduleWidget,
  DonationScheduleCalendar,
} from "../components/ui/ScheduleComponents";
import {
  BloodRequestList,
  BloodRequestStats,
} from "../components/ui/BloodRequestComponents";
import { 
  MonthlyDonationChart, 
  BloodTypeChart, 
  WeeklyGoalsChart, 
  DonationTrendChart,
  HospitalPartnershipChart,
} from "../components/ui/ChartComponents";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletConnectBanner from "../components/WalletConnectBanner";
import { campaigns, donationRequests } from "../data/dummy";
import { BloodCampaign, DonationRequest } from "../types";
import { debugConsole } from "../config/api";
import { fetchApi } from '../services/fetchApi';

interface BloodRequestsResponse {
  meta: {
    code: number;
    message: string;
  };
  data: BloodRequest[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

interface DashboardResponse {
  last_donation: string;
  total_donor: number;
  total_sertifikat: number;
}

interface BloodRequest {
  id: number;
  user_id: number;
  user: {
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
    url_file: string;
  };
  hospital_id: number;
  hospital: {
    id: number;
    name: string;
    address: string;
    city: string;
    province: string;
    latitude: number;
    longitude: number;
  };
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency_level: string;
  diagnosis: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
  status: string;
  event_type: string;
  created_at: string;
  updated_at: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const campaignService = useCampaignService();
  
  // All hooks must be called at the top level
  const [userName] = useState(localStorage.getItem("userName") || "Donor");
  const [userDonations, setUserDonations] = useState<DonationRequest[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<BloodCampaign[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "year"
  >("month");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "schedule"
    | "certificate"
    | "requests"
    | "health-passport"
  >("overview");
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDetail, setNotifDetail] = useState<any | null>(null);

  const [monthlyGoal, setMonthlyGoal] = useState({
    target: 2,
    current: 1,
    percentage: 50,
  });

  const [certificates, setCertificates] = useState<any[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  const [certError, setCertError] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<any[]>([]);
  
  // Modal state for blood request donor option
  const [isBloodRequestModalOpen, setIsBloodRequestModalOpen] = useState(false);
  const [selectedBloodRequest, setSelectedBloodRequest] = useState<BloodRequest | null>(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  // Handle login redirect in useEffect to avoid conditional hook calls
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: "/dashboard",
          message: "Silakan login terlebih dahulu untuk mengakses dashboard.",
        },
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

  // Add API hooks
  const {
    data: bloodRequestsData,
    loading: bloodRequestsLoading,
    error: bloodRequestsError,
    get: getBloodRequests,
  } = useApi<BloodRequestsResponse>();
  const {
    data: dashboardApiData,
    loading: dashboardLoading,
    error: dashboardError,
    get: getDashboard,
  } = useApi<DashboardResponse>();
  
  // Notification API hooks
  const { get: getNotificationsApi } = useApi<any>();
  const { get: getUnreadCountApi } = useApi<any>();
  const { get: patchNotificationApi } = useApi<any>();

  // Fetch notifications from API
  const fetchNotifications = () => {
    setNotifLoading(true);
    getNotificationsApi('/user/notifications/').then((res) => {
      setNotifLoading(false);
      if (res && res.data && Array.isArray(res.data)) {
        setNotifications(
          res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            unread: !n.is_read,
            time: n.created_at,
          }))
        );
      } else {
        setNotifications([]);
      }
    });
  };

  // Fetch unread count
  const fetchUnreadCount = () => {
    getUnreadCountApi('/user/notifications/count').then((res) => {
      if (res && typeof res.data === 'number') {
        setUnreadCount(res.data);
      } else if (res && res.data && typeof res.data.count === 'number') {
        setUnreadCount(res.data.count);
      } else {
        setUnreadCount(0);
      }
    });
  };

  // Mark notification as read and show detail
  const handleNotifClick = (notif: any) => {
    setNotifDetail(notif);
    if (notif.unread) {
      patchNotificationApi(`/user/notifications/${notif.id}`).then(() => {
        fetchNotifications();
        fetchUnreadCount();
      });
    }
  };

  // Fetch dashboard data and notifications
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboard("/user/dashboard");
        if (response.data) {
          debugConsole.log("Dashboard Data:", response.data);
          setDashboardData(response.data);
        }
        getBloodRequests("/blood-request");
        fetchNotifications();
        fetchUnreadCount();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn, getDashboard, getNotificationsApi, getUnreadCountApi]);

  // Fetch blood requests for dashboard
  useEffect(() => {
    if (activeTab === "requests") {
      getBloodRequests("/blood-request");
    }
  }, [activeTab, getBloodRequests]);

  // Extract blood requests data
  const bloodRequests = Array.isArray(bloodRequestsData)
    ? bloodRequestsData
    : bloodRequestsData?.data || [];

  // Schedules API integration
  const {
    data: schedulesApiData,
    loading: schedulesLoading,
    error: schedulesError,
    get: getSchedules,
  } = useApi<any[]>();

  useEffect(() => {
    getSchedules("/user/schedules").then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setSchedules(res.data);
      }
    });
  }, [getSchedules]);

  // Map API response to DonationScheduleCalendar's expected format
  const mappedSchedules = schedules.map((item) => {
    // Defensive: fallback to BloodRequest if available
    const bloodRequest = item.BloodRequest || {};
    const hospital = item.Hospital || bloodRequest.hospital || {};
    // Parse date and time
    let date = bloodRequest.event_date || item.created_at;
    let time = "";
    if (bloodRequest.start_time && bloodRequest.end_time) {
      // Format: "08:00 - 12:00"
      const start = new Date(bloodRequest.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const end = new Date(bloodRequest.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      time = `${start} - ${end}`;
    } else if (bloodRequest.event_date) {
      // Fallback: show only event time if available
      const event = new Date(bloodRequest.event_date);
      time = event.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    return {
      id: String(item.id),
      date: date ? new Date(date).toISOString().split("T")[0] : "",
      time,
      location: hospital.address || "-",
      hospital: hospital.name || "-",
      capacity: bloodRequest.slots_available || 0,
      registered: bloodRequest.slots_booked || 0,
      bloodTypesNeeded: bloodRequest.blood_type ? [bloodRequest.blood_type] : [],
      status: item.status || "upcoming",
      requirements: [bloodRequest.diagnosis || ""],
    };
  });

  // Mapping for BloodRequestStats (BloodRequestComponents)
  const mappedBloodRequests = bloodRequests.map((req: any) => ({
    id: String(req.id),
    patientName: req.patient_name || (req.user && req.user.name) || "-",
    bloodType: req.blood_type || "-",
    unitsNeeded: req.quantity || 0,
    urgency: req.urgency_level === "critical"
      ? "critical"
      : req.urgency_level === "high"
      ? "high"
      : "normal" as "critical" | "high" | "normal",
    hospital: (req.hospital && req.hospital.name) || "-",
    location: (req.hospital && req.hospital.address) || "-",
    contactPerson: (req.user && req.user.name) || "-",
    contactPhone: (req.user && req.user.phone) || "-",
    neededBy: req.event_date || req.created_at,
    description: req.diagnosis || "",
    status: req.status || "verified",
    createdAt: req.created_at,
    donors: req.donors || [],
  }));
  
  const quickStats = {
    totalDonor: dashboardData?.total_donor,
    lastDonation: dashboardData?.last_donation || null,
    totalSertifikat: dashboardData?.total_sertifikat,
  };
  
  const handleBloodRequestRespond = (requestId: string) => {
    alert(
      `Terima kasih! Anda akan dihubungi untuk koordinasi donor darah (Request ID: ${requestId})`
    );
  };

  const handleDonateNow = () => {
    navigate("/donor-register");
  };

  const handleJoinNow = () => {
    navigate("/register");
  };

  const handleScheduleDonation = () => {
    setActiveTab("schedule");
  };

  const handleViewCertificate = () => {
    setActiveTab("certificate");
  };

  const handleViewHealthPassport = () => {
    setActiveTab("health-passport");
  };

  const handleCreateBloodRequest = () => {
    navigate("/create-blood-request");
  };

  const handleHealthPassport = () => {
    navigate("/health-passport");
  };

  const handleScheduleSelect = (schedule: any) => {
    alert(
      `Anda akan diarahkan ke form pendaftaran untuk jadwal donor di ${schedule.hospital} pada ${schedule.date}`
    );
    navigate("/donor-register");
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      "A+": "bg-red-500",
      "A-": "bg-red-400",
      "B+": "bg-blue-500",
      "B-": "bg-blue-400",
      "AB+": "bg-purple-500",
      "AB-": "bg-purple-400",
      "O+": "bg-green-500",
      "O-": "bg-green-400",
    };
    return colors[bloodType as keyof typeof colors] || "bg-gray-500";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical":
        return "Sangat Mendesak";
      case "high":
        return "Mendesak";
      case "medium":
        return "Sedang";
      case "low":
        return "Normal";
      default:
        return urgency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Menunggu Verifikasi";
      case "verified":
        return "Terverifikasi";
      case "completed":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      case "active":
        return "Aktif";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert BloodRequest to BloodCampaign format for modal
  const convertBloodRequestToCampaign = (request: BloodRequest): BloodCampaign => {
    return {
      id: request.id.toString(),
      title: request.event_name,
      description: request.diagnosis,
      organizer: {
        name: request.user.name,
        avatar: request.user.url_file || '/api/placeholder/32/32',
        verified: request.user.is_verified,
        role: request.user.role
      },
      hospital: request.hospital.name,
      location: `${request.hospital.city}, ${request.hospital.province}`,
      bloodType: [request.blood_type as any],
      targetDonors: request.quantity || 1,
      currentDonors: 0,
      urgencyLevel: request.urgency_level as any,
      contactPerson: request.user.name,
      contactPhone: request.user.phone,
      deadline: request.event_date,
      createdAt: request.created_at,
      imageUrl: '',
      url_file: ''
    };
  };

  const handleDonateToRequest = (request: BloodRequest) => {
    setSelectedBloodRequest(request);
    setIsBloodRequestModalOpen(true);
  };

  const handleBloodRequestDonorNow = async (notes: string, hospitalId: number, description: string) => {
    if (!selectedBloodRequest) return;
    
    try {
      const success = await campaignService.donorNowWithSchedule(selectedBloodRequest.id, hospitalId, description, notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran dan Jadwal Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor untuk permintaan darah ini. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        setIsBloodRequestModalOpen(false);
        setSelectedBloodRequest(null);
      } else {
        addNotification({
          type: 'error',
          title: 'Pendaftaran Gagal',
          message: 'Terjadi kesalahan saat mendaftar sebagai donor dan membuat jadwal. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleBloodRequestScheduleOnly = async (hospitalId: number, description: string) => {
    if (!selectedBloodRequest) return;
    
    try {
      const success = await campaignService.createSchedule(selectedBloodRequest.id, hospitalId, description);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Jadwal Berhasil Dibuat!',
          message: 'Jadwal donor darah untuk permintaan ini telah berhasil dibuat. Tim akan menghubungi Anda untuk konfirmasi.',
          duration: 5000
        });
        setIsBloodRequestModalOpen(false);
        setSelectedBloodRequest(null);
      } else {
        addNotification({
          type: 'error',
          title: 'Pembuatan Jadwal Gagal',
          message: 'Terjadi kesalahan saat membuat jadwal. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleViewAllRequests = () => {
    navigate("/blood-requests");
  };

  useEffect(() => {
    if (activeTab === 'certificate') {
      setCertLoading(true);
      setCertError(null);
      fetchApi('/user/certificates').then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCertificates(res.data.map((item: any, idx: number) => ({
            id: item.id,
            type: 'Sertifikat Donor',
            status: 'Disetujui',
            name: item.user?.name || '-',
            role: item.user?.role || '-',
            bloodType: item.user?.blood_type || '-',
            totalDonations: item.donation?.amount || 1,
            blockchainId: item.digital_signature || '-',
            digitalSignature: item.digital_signature || '-',
            color: idx % 2 === 0 ? 'red' : 'blue',
            bgGradient: idx % 2 === 0 ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600',
            createdAt: item.created_at,
            rawData: item
          })));
        } else {
          setCertificates([]);
          setCertError(res.message || 'Gagal mengambil data sertifikat');
        }
        setCertLoading(false);
      }).catch((err) => {
        setCertError(err.message || 'Gagal mengambil data sertifikat');
        setCertLoading(false);
      });
    }
  }, [activeTab]);

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

  // Show loading state while redirecting to login
  if (!isLoggedIn) {
    return (
      <>
        <WalletConnectBanner />
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <HeartBeatLoader size={60} />
            <p className="mt-4 text-gray-600 text-lg">
              Mengalihkan ke halaman login...
            </p>
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
                      Selamat datang kembali, {userName}! Mari lanjutkan
                      perjalanan mulia Anda.
                    </p>
                  </div>
                  
                  {/* <div className="flex items-center space-x-4">
                    <Floating intensity={5} duration={3}>
                      <div className="relative">
                        {notifications.filter((n) => n.unread).length > 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {notifications.filter((n) => n.unread).length}
                            </span>
                          </div>
                        )}
                      </div>
                    </Floating>
                    
                    <HeartBeatLoader size={30} />
                  </div> */}
                </div>
              </div>
            </FadeIn>

            {/* Quick Stats */}
            <StaggerContainer
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              staggerDelay={0.1}
            >
              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">Total Donor</p>
                        <p className="text-3xl font-bold">
                          {quickStats.totalDonor !== null && 
                           quickStats.totalDonor !== undefined && 
                           !isNaN(quickStats.totalDonor) && 
                           quickStats.totalDonor > 0 ? (
                            <CountUp
                              end={quickStats.totalDonor}
                              duration={0}
                              delay={0.2}
                            />
                          ) : (
                            "Belum Ada"
                          )}
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
                        <p className="text-green-100 text-sm">Last Donation</p>
                        <p className="text-3xl font-bold">
                          {quickStats.lastDonation
                            ? formatDate(quickStats.lastDonation)
                            : "Belum Ada"}
                        </p>
                      </div>
                      <CalendarIcon className="w-10 h-10 text-green-200" />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>

              <StaggerItem>
                <HoverScale scale={1.05}>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">
                          Total Sertifikat
                        </p>
                        <p className="text-3xl font-bold">
                          {quickStats.totalSertifikat !== null && 
                           quickStats.totalSertifikat !== undefined && 
                           !isNaN(quickStats.totalSertifikat) && 
                           quickStats.totalSertifikat > 0 ? (
                            <CountUp
                              end={quickStats.totalSertifikat}
                              duration={0}
                              delay={0}
                            />
                          ) : (
                            "Belum Ada"
                          )}
                        </p>
                      </div>
                      <Database className="w-10 h-10 text-blue-200" />
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
                    {
                      key: "overview",
                      label: "Overview",
                      icon: <TargetIcon className="w-5 h-5" />,
                    },
                    {
                      key: "schedule",
                      label: "Jadwal Donor",
                      icon: <CalendarIcon className="w-5 h-5" />,
                    },
                    {
                      key: "certificate",
                      label: "Sertifikat",
                      icon: <Database className="w-5 h-5" />,
                    },
                    // {
                    //   key: "requests",
                    //   label: "Request Darah",
                    //   icon: <AlertTriangle className="w-5 h-5" />,
                    // },
                    {
                      key: "health-passport",
                      label: "Health Passport",
                      icon: <AwardIcon className="w-5 h-5" />,
                      onClick: () => navigate("/health-passport"),
                    },
                  ].map((tab) => (
                    tab.key === "health-passport" ? (
                      <button
                        key={tab.key}
                        onClick={tab.onClick}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-gray-600 hover:bg-gray-50"
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ) : (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                          activeTab === tab.key
                            ? "bg-primary-600 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Last Donation Info */}
                    {quickStats.lastDonation && (
                      <FadeIn direction="up" delay={0.1}>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                              Donasi Terakhir
                            </h3>
                            <ClockIcon className="w-6 h-6 text-blue-600" />
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                              <HeartIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-semibold text-gray-900">
                                {new Date(
                                  quickStats.lastDonation
                                ).toLocaleDateString("id-ID", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(
                                  quickStats.lastDonation
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                WIB
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-blue-600 font-medium">
                                {Math.floor(
                                  (new Date().getTime() -
                                    new Date(
                                      quickStats.lastDonation
                                    ).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                hari yang lalu
                              </p>
                            </div>
                          </div>

                          {dashboardLoading && (
                            <div className="mt-4 flex items-center justify-center">
                              <DotsLoader className="scale-75" />
                              <span className="ml-2 text-sm text-gray-600">
                                Memuat data...
                              </span>
                            </div>
                          )}
                        </div>
                      </FadeIn>
                    )}

                    {/* Loading state for dashboard data */}
                    {dashboardLoading && !quickStats.lastDonation && (
                      <FadeIn direction="up" delay={0.1}>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex items-center justify-center space-x-2">
                            <HeartBeatLoader size={30} />
                            <span className="text-gray-600">
                              Memuat data dashboard...
                            </span>
                          </div>
                        </div>
                      </FadeIn>
                    )}

                    {/* Error state for dashboard data */}
                    {dashboardError && (
                      <FadeIn direction="up" delay={0.1}>
                        <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <span className="text-red-700">
                              Gagal memuat data dashboard: {dashboardError}
                            </span>
                          </div>
                        </div>
                      </FadeIn>
                    )}

                    {/* Quick Emergency Preview */}
                    <FadeIn direction="up" delay={0.4}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">
                            Request Darurat Terbaru
                          </h3>
                          <button
                            onClick={() => setActiveTab("requests")}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors hover:scale-105"
                          >
                            Lihat Semua →
                          </button>
                        </div>
                        
                        <BloodRequestStats requests={mappedBloodRequests} />
                      </div>
                    </FadeIn>

                    {/* Recent Achievements */}
                  
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Notifications */}
                    <FadeIn direction="right" delay={0.2}>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">
                            Notifikasi
                          </h3>
                          <div className="relative">
                            <BellIcon className="w-6 h-6 text-gray-600" />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {notifLoading ? (
                            <div className="text-center text-gray-500 text-sm py-6">
                              <DotsLoader className="mx-auto scale-75 mb-2" />
                              Memuat notifikasi...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-6">
                              Tidak ada notifikasi
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div 
                                key={notification.id}
                                onClick={() => handleNotifClick(notification)}
                                className={`border-l-4 rounded-lg p-3 cursor-pointer transition-colors ${
                                  notification.unread 
                                    ? 'bg-red-50 hover:bg-red-100 border-red-400' 
                                    : 'hover:bg-gray-50 border-gray-300'
                                }`}
                              >
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2 truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {notification.time}
                                </p>
                                {notification.unread && (
                                  <div className="mt-1">
                                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* View All Notifications Button */}
                        {notifications.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button 
                              onClick={() => navigate('/notifications')}
                              className="w-full text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                              Lihat Semua Notifikasi
                            </button>
                          </div>
                        )}
                      </div>
                    </FadeIn>

                 
                  </div>
                </div>
              )}

              {activeTab === "schedule" && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Jadwal Donor Darah
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Temukan jadwal donor darah terdekat dan daftar langsung
                        untuk berkontribusi menyelamatkan nyawa.
                      </p>
                    </div>
                    {schedulesLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <HeartBeatLoader size={60} />
                      </div>
                    ) : schedulesError ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Gagal Memuat Jadwal
                        </h3>
                        <p className="text-gray-600 mb-4">{schedulesError}</p>
                        <button
                          onClick={() => getSchedules("/user/schedules")}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : (
                      <DonationScheduleCalendar
                        schedules={mappedSchedules}
                        onScheduleSelect={handleScheduleSelect}
                      />
                    )}
                  </div>
                </FadeIn>
              )}

              {activeTab === "certificate" && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Sertifikat Donor Darah
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Lihat dan kelola sertifikat donor darah Anda yang
                        terverifikasi blockchain
                      </p>
                    </div>
                    {certLoading ? (
                      <div className="text-center py-12 text-gray-500">Memuat data sertifikat...</div>
                    ) : certError ? (
                      <div className="text-center py-12 text-red-500">{certError}</div>
                    ) : certificates.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">Belum ada sertifikat donor darah.</div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {certificates.slice(0,3).map((cert) => (
                        <FadeIn key={cert.id} direction="up">
                          <CertificateCard
                            donorName={cert.name}
                            bloodType={cert.bloodType}
                            donationDate={cert.createdAt}
                            donationCount={cert.totalDonations}
                            certificateId={cert.id}
                            blockchainId={cert.blockchainId}
                            type="main"
                            title={cert.type}
                            onClick={() => navigate("/certificates")}
                          />
                        </FadeIn>
                      ))}
                    </div>
                    )}
                    {/* View All Certificates Button */}
                    <div className="text-center">
                      <HoverScale scale={1.05}>
                        <button
                          onClick={() => navigate("/certificates")}
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
                        >
                          <AwardIcon className="w-5 h-5" />
                          <span>Lihat Semua Sertifikat</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </HoverScale>
                    </div>
                  </div>
                </FadeIn>
              )}

              {activeTab === "health-passport" && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Health Passport
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Lihat dan kelola Health Passport Anda
                      </p>
                    </div>
                    
                    {/* Health Passport Content */}
                    {/* Add your Health Passport content here */}
                  </div>
                </FadeIn>
              )}

              {activeTab === "requests" && (
                <FadeIn direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Request Darah Darurat
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Sistem permintaan darah darurat untuk respons cepat
                        menyelamatkan nyawa.
                      </p>
                    </div>
                    
                    {/* Stats Overview */}
                    <FadeIn direction="up" delay={0.2}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {bloodRequests.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Permintaan
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {
                              bloodRequests.filter(
                                (r) => r.urgency_level === "critical"
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Sangat Mendesak
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {
                              bloodRequests.filter(
                                (r) => r.urgency_level === "high"
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">Mendesak</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {
                              bloodRequests.filter(
                                (r) => r.urgency_level === "low"
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">Normal</div>
                        </div>
                      </div>
                    </FadeIn>

                    {/* Action Header */}
                    <FadeIn direction="up" delay={0.3}>
                      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white mb-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-2">
                              Permintaan Darah Mendesak
                            </h3>
                            <p className="text-red-100">
                              Bantuan segera dibutuhkan untuk menyelamatkan
                              nyawa
                            </p>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handleCreateBloodRequest}
                              className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center space-x-2"
                            >
                              <PlusCircleIcon className="w-5 h-5" />
                              <span>Buat Request</span>
                            </button>
                            <button
                              onClick={handleViewAllRequests}
                              className="bg-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-800 transition-colors flex items-center space-x-2"
                            >
                              <span>Lihat Semua</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                  </div>
                </FadeIn>

                    {/* Blood Requests Grid */}
                    {bloodRequestsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <HeartBeatLoader size={60} />
                      </div>
                    ) : bloodRequestsError ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Gagal Memuat Data
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {bloodRequestsError}
                        </p>
                        <button
                          onClick={() => getBloodRequests("/blood-request")}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : bloodRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Tidak Ada Permintaan Saat Ini
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Belum ada permintaan darah darurat yang membutuhkan
                          bantuan
                        </p>
                        <button
                          onClick={handleCreateBloodRequest}
                          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
                        >
                          Buat Permintaan Pertama
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                        {bloodRequests.slice(0, 6).map((request, index) => (
                          <FadeIn
                            key={request.id}
                            direction="up"
                            delay={0.1 * index}
                          >
                            <HoverScale scale={1.02}>
                              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white flex-shrink-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className={`w-8 h-8 ${getBloodTypeColor(
                                          request.blood_type
                                        )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                                      >
                                        {request.blood_type}
                                      </div>
                                      <span className="font-semibold">
                                        {request.quantity} Kantong
                                      </span>
                                    </div>
                                    <div
                                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(
                                        request.urgency_level
                                      )}`}
                                    >
                                      {getUrgencyText(request.urgency_level)}
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-lg">
                                    {request.event_name}
                                  </h3>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-4 flex-grow flex flex-col">
                                  {/* Patient Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <UserCheckIcon className="w-4 h-4 text-gray-500" />
                                      <span className="font-semibold text-gray-900">
                                        {request.patient_name ||
                                          "Tidak disebutkan"}
                                      </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5" />
                                      <span className="text-sm text-gray-600">
                                        {request.diagnosis}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Hospital Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Database className="w-4 h-4 text-gray-500" />
                                      <span className="font-medium text-gray-900">
                                        {request.hospital.name}
                                      </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                                      <span className="text-sm text-gray-600">
                                        {request.hospital.city},{" "}
                                        {request.hospital.province}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Request Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <UserCheckIcon className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">
                                        Diminta oleh: {request.user.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm text-gray-600">
                                        {formatDate(request.event_date)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Urgency Level and Status */}
                                  <div className="space-y-2 mt-auto pt-2">
                                    <div className="flex justify-between items-center">
                                      <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-600">Urgency Level:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency_level)} inline-flex items-center`}>
                                          <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-60"></span>
                                          {getUrgencyText(request.urgency_level)}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-gray-500">Dibuat:</div>
                                        <span className="text-xs text-gray-700 font-medium">
                                          {formatDate(request.created_at)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs text-gray-600">Status:</span>
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)} inline-flex items-center`}>
                                        <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-60"></span>
                                        {getStatusText(request.status)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-gray-50 border-t flex-shrink-0">
                                  <button
                                    onClick={() =>
                                      handleDonateToRequest(request)
                                    }
                                    disabled={
                                      request.status !== "verified"
                                    }
                                    className={`w-full py-2 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                                      request.status === "verified"
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    }`}
                                    title={
                                      request.status !== "verified"
                                        ? `Tidak dapat donor: ${getStatusText(request.status)}`
                                        : "Klik untuk mendaftar donor"
                                    }
                                  >
                                    <HeartIcon className="w-4 h-4" />
                                    <span>
                                      {request.status === "completed"
                                        ? "Sudah Selesai"
                                        : request.status === "rejected"
                                        ? "Ditolak"
                                        : request.status === "pending"
                                        ? "Menunggu Verifikasi"
                                        : request.status === "verified"
                                        ? "Saya Bisa Donor"
                                        : getStatusText(request.status)}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </HoverScale>
                          </FadeIn>
                        ))}
                      </div>
                    )}

                    {/* View More Button */}
                    {bloodRequests.length > 6 && (
                      <FadeIn direction="up" delay={0.5}>
                        <div className="text-center">
                          <button
                            onClick={handleViewAllRequests}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
                          >
                            <span>
                              Lihat Semua Permintaan ({bloodRequests.length})
                            </span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </FadeIn>
                    )}
                  </div>
                </FadeIn>
              )}

             
            </div>
          </div>
        </div>
      </FadeIn>

      {/* DonorOptionModal for Blood Requests */}
      {selectedBloodRequest && (
        <DonorOptionModal
          isOpen={isBloodRequestModalOpen}
          onClose={() => {
            setIsBloodRequestModalOpen(false);
            setSelectedBloodRequest(null);
          }}
          campaign={convertBloodRequestToCampaign(selectedBloodRequest)}
          onDonorNow={handleBloodRequestDonorNow}
          onScheduleOnly={handleBloodRequestScheduleOnly}
        />
      )}

      {/* Modal untuk detail notifikasi */}
      {notifDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative mx-4">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={() => setNotifDetail(null)}
            >
              &times;
            </button>
            <div className="mb-2 text-lg font-bold text-gray-900">{notifDetail.title}</div>
            <div className="mb-4 text-gray-700 whitespace-pre-line">{notifDetail.message}</div>
            {notifDetail.time && <div className="text-xs text-gray-400">{notifDetail.time}</div>}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default DashboardPage; 
