import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { adminStats, adminNotifications, campaigns, donors, donationRequests } from '../data/dummy';
import { AdminNotification } from '../types';
import AdminLayout from '../components/AdminLayout';
import { getApi } from '../services/fetchApi';

// Define the interface locally if there's an import issue
interface AdminDashboardData {
  campaign_active: number;
  donor_terverifikasi: number;
  request_pending: number;
  total_campaign: number;
  total_donor: number;
  urgent_campaigns?: number;
}

const AdminDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(adminNotifications);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getApi<AdminDashboardData>('/admin/dashboard');
        
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Use API data if available, otherwise fallback to dummy data
  const statsData = dashboardData || {
    total_campaign: adminStats.totalCampaigns,
    campaign_active: adminStats.activeCampaigns,
    total_donor: adminStats.totalDonors,
    donor_terverifikasi: adminStats.verifiedDonors,
    request_pending: adminStats.pendingRequests,
    urgent_campaigns: adminStats.urgentCampaigns
  };

  const stats = [
    {
      title: 'Total Campaign', 
      value: statsData.total_campaign,
      icon: Heart,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Campaign Aktif', 
      value: statsData.campaign_active,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Donor', 
      value: statsData.total_donor,
      icon: Users,
      color: 'bg-purple-500',
      change: '+25%',
      changeType: 'positive'
    },
    {
      title: 'Donor Terverifikasi', 
      value: statsData.donor_terverifikasi,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Permintaan Pending', 
      value: statsData.request_pending,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Campaign Urgent', 
      value: statsData.urgent_campaigns || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+2',
      changeType: 'neutral'
    }
  ];

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Overview platform DarahConnect">
      {/* Header with filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="border-gray-300 rounded-md text-sm"
                >
                  <option value="7d">7 Hari Terakhir</option>
                  <option value="30d">30 Hari Terakhir</option>
                  <option value="90d">90 Hari Terakhir</option>
                </select>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 
                          stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs bulan lalu</span>
                      </div>
                    </div>
                    <div className={`${stat.color} p-3 rounded-full`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Campaigns */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Campaign Terbaru</h3>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-4">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {campaign.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {campaign.location}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(campaign.urgencyLevel)}`}>
                              {campaign.urgencyLevel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {campaign.currentDonors}/{campaign.targetDonors}
                          </p>
                          <p className="text-xs text-gray-500">donor</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Donation Requests */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Permintaan Donasi Terbaru</h3>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-4">
                    {donationRequests.map((request) => {
                      const donor = donors.find(d => d.id === request.donorId);
                      const campaign = campaigns.find(c => c.id === request.campaignId);
                      
                      return (
                        <div key={request.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src={donor?.avatar || '/api/placeholder/40/40'} 
                            alt={donor?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              {donor?.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {campaign?.title}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.requestedDate).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notifications & Quick Actions */}
              <div className="space-y-8">
                {/* Notifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notifikasi
                    </h3>
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                      {notifications.filter(n => !n.read).length} baru
                    </span>
                  </div>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Aksi Cepat</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Buat Campaign Baru</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Verifikasi Donor</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Approve Permintaan</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Lihat Laporan</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 