import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Heart,
  Users,
  Settings,
  Award,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  X,
  Plus,
  Send,
  User
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getApi, putApi, deleteApi, postApi } from '../services/fetchApi';

interface Notification {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    blood_type: string;
    gender: string;
    address: string;
    role: string;
    url_file: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// API Response interface
interface NotificationApiResponse {
  meta: {
    code: number;
    message: string;
  };
  data: Notification[] | {
    data?: Notification[];
    notifications?: Notification[];
  };
  pagination?: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [filterUserId, setFilterUserId] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createNotificationForm, setCreateNotificationForm] = useState({
    title: '',
    message: '',
    notification_type: 'system',
    userId: ''
  });
  
  // Pagination states
  const [notificationsPagination, setNotificationsPagination] = useState<PaginationInfo>({
    current_page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1
  });
  
  const [usersPagination, setUsersPagination] = useState<PaginationInfo>({
    current_page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1
  });
  
  const [showUsersPagination, setShowUsersPagination] = useState(false);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  // Fetch users for dropdown with pagination
  const fetchUsers = async (page: number = 1, limit: number = 20) => {
    try {
      setLoadingUsers(true);
      const response = await getApi<{
        data: User[] | { data: User[]; pagination?: PaginationInfo },
        pagination?: PaginationInfo
      }>(`/admin/users?page=${page}&limit=${limit}`);
      
      if (response.success && response.data) {
        let userData: User[] = [];
        let paginationData: PaginationInfo = {
          current_page: page,
          per_page: limit,
          total_items: 0,
          total_pages: 1
        };
        
        if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          if ('data' in response.data && Array.isArray(response.data.data)) {
            userData = response.data.data;
            if (response.data.pagination) {
              paginationData = response.data.pagination;
            }
          }
        }
        
        if (response.pagination) {
          paginationData = response.pagination;
        }
        
        // If it's the first page, replace users, otherwise append
        if (page === 1) {
          setUsers(userData);
        } else {
          setUsers(prev => [...prev, ...userData]);
        }
        
        setUsersPagination(paginationData);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchNotifications = async (page: number = 1, limit: number = 16) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use pagination: GET /admin/notifications?page=1&limit=10
      const response = await getApi<NotificationApiResponse>(`/admin/notifications?page=${page}&limit=${limit}`);
      
      if (response.success && response.data) {
        // Handle the new API response format
        let notificationData: any[] = [];
        let paginationData: PaginationInfo = {
          current_page: page,
          per_page: limit,
          total_items: 0,
          total_pages: 1
        };
        
        if (Array.isArray(response.data)) {
          notificationData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          if ('data' in response.data && Array.isArray(response.data.data)) {
            notificationData = response.data.data;
          } else if ('notifications' in response.data && Array.isArray(response.data.notifications)) {
            notificationData = response.data.notifications;
          }
        }
        
        // Handle pagination info
        if (response.pagination) {
          paginationData = {
            current_page: response.pagination.page || response.pagination.current_page,
            per_page: response.pagination.per_page,
            total_items: response.pagination.total_items,
            total_pages: response.pagination.total_pages
          };
        }
      
        // Use the notifications directly as they match our interface
        const transformedNotifications: Notification[] = notificationData.map((notif: any) => ({
          id: notif.id,
          user_id: notif.user_id,
          user: notif.user,
          title: notif.title,
          message: notif.message,
          notification_type: notif.notification_type,
          is_read: notif.is_read,
          created_at: notif.created_at,
          updated_at: notif.updated_at
        }));
        
        setNotifications(transformedNotifications);
        setNotificationsPagination(paginationData);
      } else {
        setError(response.message || 'Failed to fetch notifications');
        // Fallback to dummy data if API fails
        setNotifications(getDummyNotifications());
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      // Fallback to dummy data
      setNotifications(getDummyNotifications());
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications by user ID
  const fetchNotificationsByUserId = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getApi<NotificationApiResponse>(`/admin/notifications/user/${userId}`);
      
      if (response.success && response.data) {
        let notificationData: any[] = [];
        
        if (Array.isArray(response.data)) {
          notificationData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          if ('data' in response.data && Array.isArray(response.data.data)) {
            notificationData = response.data.data;
          } else if ('notifications' in response.data && Array.isArray(response.data.notifications)) {
            notificationData = response.data.notifications;
          }
        }
      
        const transformedNotifications: Notification[] = notificationData.map((notif: any) => ({
          id: notif.id,
          user_id: notif.user_id,
          user: notif.user,
          title: notif.title,
          message: notif.message,
          notification_type: notif.notification_type,
          is_read: notif.is_read,
          created_at: notif.created_at,
          updated_at: notif.updated_at
        }));
        
        setNotifications(transformedNotifications);
      } else {
        setError(response.message || 'Failed to fetch user notifications');
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching user notifications:', err);
      setError('Failed to load user notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new notification
  const handleCreateNotification = async () => {
    try {
      const notificationData = {
        user_id: parseInt(createNotificationForm.userId),
        title: createNotificationForm.title,
        message: createNotificationForm.message,
        notification_type: createNotificationForm.notification_type
      };

      const response = await postApi('/admin/notification', notificationData);
      
      if (response.success) {
        setShowCreateModal(false);
        setCreateNotificationForm({
          title: '',
          message: '',
          notification_type: 'system',
          userId: ''
        });
        // Refresh notifications
        fetchNotifications(1);
      } else {
        setError(response.message || 'Failed to create notification');
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Failed to create notification');
    }
  };

  // Dummy data as fallback
  const getDummyNotifications = (): Notification[] => [
    {
      id: 1,
      user_id: 1,
      user: {
        id: 1,
        name: 'Ahmad Suryadi',
        email: 'ahmad@example.com',
        phone: '081234567890',
        blood_type: 'A+',
        gender: 'Male',
        address: 'Jakarta',
        role: 'User',
        url_file: '',
        is_verified: true,
        created_at: '2024-01-20T10:15:00Z',
        updated_at: '2024-01-20T10:15:00Z'
      },
      title: 'Sertifikat Donor Darah Approved',
      message: 'Sertifikat donor darah CERT-2024-001 telah disetujui',
      notification_type: 'certificate',
      is_read: false,
      created_at: '2024-01-20T10:15:00Z',
      updated_at: '2024-01-20T10:15:00Z'
    },
    {
      id: 2,
      user_id: 2,
      user: {
        id: 2,
        name: 'Siti Nurhaliza',
        email: 'siti@example.com',
        phone: '081234567891',
        blood_type: 'O+',
        gender: 'Female',
        address: 'Bandung',
        role: 'User',
        url_file: '',
        is_verified: true,
        created_at: '2024-01-20T09:45:00Z',
        updated_at: '2024-01-20T09:45:00Z'
      },
      title: 'Campaign Darurat Tersedia',
      message: 'RS Hasan Sadikin membutuhkan donor O+ untuk operasi darurat',
      notification_type: 'urgent',
      is_read: false,
      created_at: '2024-01-20T09:45:00Z',
      updated_at: '2024-01-20T09:45:00Z'
    },
    {
      id: 3,
      user_id: 3,
      user: {
        id: 3,
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '081234567892',
        blood_type: 'B-',
        gender: 'Male',
        address: 'Surabaya',
        role: 'User',
        url_file: '',
        is_verified: true,
        created_at: '2024-01-20T09:30:00Z',
        updated_at: '2024-01-20T09:30:00Z'
      },
      title: 'Profil Berhasil Diupdate',
      message: 'Profil donor Anda telah berhasil diperbarui',
      notification_type: 'system',
      is_read: true,
      created_at: '2024-01-20T09:30:00Z',
      updated_at: '2024-01-20T09:30:00Z'
    }
  ];

  // Handle filter change for user
  const handleUserFilterChange = (userId: string) => {
    setFilterUserId(userId);
    if (userId === 'all') {
      fetchNotifications(1);
    } else {
      fetchNotificationsByUserId(userId);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.notification_type === filterType;
    const matchesPriority = filterPriority === 'all'; // Priority filter not used with new structure
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.is_read) ||
                       (filterRead === 'unread' && !notification.is_read);
    const matchesUser = filterUserId === 'all' || notification.user_id.toString() === filterUserId;
    
    return matchesSearch && matchesType && matchesPriority && matchesRead && matchesUser;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Award className="w-5 h-5 text-yellow-600" />;
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'donor': return <Users className="w-5 h-5 text-blue-600" />;
      case 'campaign': return <Heart className="w-5 h-5 text-red-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
      case 'donation': return <Heart className="w-5 h-5 text-green-600" />;
      case 'Donor Registration': return <Users className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getStats = () => {
    const filtered = filteredNotifications;
    return {
      total: filtered.length,
      unread: filtered.filter(n => !n.is_read).length,
      critical: filtered.filter(n => n.notification_type === 'urgent').length,
      today: filtered.filter(n => {
        const today = new Date().toDateString();
        return new Date(n.created_at).toDateString() === today;
      }).length
    };
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      // Using GET method to get notification details: GET /admin/notification/{id}
      const response = await getApi(`/admin/notification/${id}`);
      
      if (response.success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, is_read: true } : notification
        ));
      } else {
        console.error('Failed to mark notification as read:', response.message);
        // Still update UI optimistically
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, is_read: true } : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still update UI optimistically
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    }
  };

  const handleMarkAsUnread = async (id: number) => {
    try {
      // Using PUT method to mark as unread (endpoint not specified, keeping original)
      const response = await getApi(`/admin/notification/${id}`);
      
      if (response.success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, is_read: false } : notification
        ));
      } else {
        console.error('Failed to mark notification as unread:', response.message);
        // Still update UI optimistically
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, is_read: false } : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      // Still update UI optimistically
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, is_read: false } : notification
      ));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Using DELETE method: DELETE /admin/notification/{id}
      const response = await deleteApi(`/admin/notification/${id}`);
      
      if (response.success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
      } else {
        console.error('Failed to delete notification:', response.message);
        // Still update UI optimistically
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Still update UI optimistically
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      // Using bulk mark as read endpoint (may need adjustment based on actual API)
      const response = await getApi(`/admin/notification/${selectedNotifications.join(',')}`);
      
      if (response.success) {
        setNotifications(prev => prev.map(notification => 
          selectedNotifications.includes(notification.id) 
            ? { ...notification, is_read: true } 
            : notification
        ));
        setSelectedNotifications([]);
      } else {
        console.error('Failed to bulk mark as read:', response.message);
        // Still update UI optimistically
        setNotifications(prev => prev.map(notification => 
          selectedNotifications.includes(notification.id) 
            ? { ...notification, is_read: true } 
            : notification
        ));
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error bulk marking as read:', error);
      // Still update UI optimistically
      setNotifications(prev => prev.map(notification => 
        selectedNotifications.includes(notification.id) 
          ? { ...notification, is_read: true } 
          : notification
      ));
      setSelectedNotifications([]);
    }
  };

  const handleBulkDelete = async () => {
    try {
      // Using bulk delete endpoint (may need adjustment based on actual API)
      const response = await deleteApi('/admin/notification/bulk-delete', {
        notification_ids: selectedNotifications
      });
      
      if (response.success) {
        setNotifications(prev => prev.filter(notification => 
          !selectedNotifications.includes(notification.id)
        ));
        setSelectedNotifications([]);
      } else {
        console.error('Failed to bulk delete notifications:', response.message);
        // Still update UI optimistically
        setNotifications(prev => prev.filter(notification => 
          !selectedNotifications.includes(notification.id)
        ));
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      // Still update UI optimistically
      setNotifications(prev => prev.filter(notification => 
        !selectedNotifications.includes(notification.id)
      ));
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const stats = getStats();

  return (
    <AdminLayout title="Notifikasi User" subtitle="Kelola notifikasi untuk pengguna aplikasi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Memuat notifikasi...</span>
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
              onClick={() => fetchNotifications()} 
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifikasi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    {notificationsPagination.total_items > 0 && (
                      <p className="text-xs text-gray-500">dari {notificationsPagination.total_items} total</p>
                    )}
                  </div>
                  <Bell className="h-8 w-8 text-gray-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Belum Dibaca</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Kritis</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Create Notification Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Buat Notifikasi Baru</span>
              </button>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Cari notifikasi atau user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterUserId}
                    onChange={(e) => handleUserFilterChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="all">Semua User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id} title={user.name + ' (' + user.email + ')'}>
                        {user.name.length > 20 ? user.name.substring(0, 20) + '...' : user.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="certificate">Sertifikat</option>
                    <option value="urgent">Darurat</option>
                    <option value="donor">Donor</option>
                    <option value="campaign">Campaign</option>
                    <option value="system">Sistem</option>
                    <option value="donation">Donation</option>
                    <option value="Donor Registration">Donor Registration</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">Semua Prioritas</option>
                    <option value="critical">Kritis</option>
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                  
                  <select
                    value={filterRead}
                    onChange={(e) => setFilterRead(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">Semua</option>
                    <option value="unread">Belum Dibaca</option>
                    <option value="read">Sudah Dibaca</option>
                  </select>
                </div>
                
                {selectedNotifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Tandai Dibaca</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
              
              {filteredNotifications.length > 0 && (
                <div className="mt-4 flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Pilih Semua ({filteredNotifications.length})
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Notifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${
                    notification.notification_type === 'urgent' ? 'border-l-red-500' : 
                    notification.notification_type === 'certificate' ? 'border-l-yellow-500' : 
                    'border-l-blue-500'
                  } ${!notification.is_read ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!notification.is_read ? (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Tandai sebagai dibaca"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-50 rounded transition-colors"
                            title="Tandai sebagai belum dibaca"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Hapus notifikasi"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className={`text-sm font-medium mb-2 truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 break-words">{notification.message}</p>
                      
                      {/* User Info */}
                      <div className="flex items-center space-x-2 mb-3 text-xs text-gray-500 min-w-0">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{notification.user.name || 'Unknown User'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center text-xs text-gray-500 min-w-0">
                          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{new Date(notification.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full truncate max-w-20 ${
                            notification.notification_type === 'urgent' ? 'bg-red-100 text-red-800' :
                            notification.notification_type === 'certificate' ? 'bg-yellow-100 text-yellow-800' :
                            notification.notification_type === 'donation' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.notification_type.length > 8 ? notification.notification_type.substring(0, 8) + '...' : notification.notification_type}
                          </span>
                          
                          {!notification.is_read && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              Baru
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada notifikasi</h3>
                <p className="text-gray-500">Tidak ada notifikasi yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
          </>
        )}

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Buat Notifikasi Baru</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih User
                  </label>
                  <div className="relative">
                    <select
                      value={createNotificationForm.userId}
                      onChange={(e) => setCreateNotificationForm(prev => ({ ...prev, userId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 truncate"
                      required
                      onFocus={() => setShowUsersPagination(true)}
                    >
                      <option value="">Pilih User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name.length > 30 ? user.name.substring(0, 30) + '...' : user.name}
                        </option>
                      ))}
                    </select>
                    {showUsersPagination && usersPagination.current_page < usersPagination.total_pages && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-2 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            fetchUsers(usersPagination.current_page + 1);
                            setShowUsersPagination(false);
                          }}
                          disabled={loadingUsers}
                          className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {loadingUsers ? 'Loading...' : 'Load More Users'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={createNotificationForm.title}
                    onChange={(e) => setCreateNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                    placeholder="Masukkan judul notifikasi"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                  </label>
                  <textarea
                    value={createNotificationForm.message}
                    onChange={(e) => setCreateNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                    rows={4}
                    placeholder="Masukkan pesan notifikasi"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe
                  </label>
                  <select
                    value={createNotificationForm.notification_type}
                    onChange={(e) => setCreateNotificationForm(prev => ({ ...prev, notification_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="system">Sistem</option>
                    <option value="certificate">Sertifikat</option>
                    <option value="urgent">Darurat</option>
                    <option value="donor">Donor</option>
                    <option value="campaign">Campaign</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNotification}
                  disabled={!createNotificationForm.title || !createNotificationForm.message || !createNotificationForm.userId}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Notifikasi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination for Notifications */}
        {notificationsPagination.total_pages > 1 && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0">
              <div className="text-sm text-gray-600 text-center md:text-left">
                Menampilkan {((notificationsPagination.current_page - 1) * notificationsPagination.per_page) + 1} - {Math.min(notificationsPagination.current_page * notificationsPagination.per_page, notificationsPagination.total_items)} dari {notificationsPagination.total_items} notifikasi
              </div>
              <div className="text-sm text-gray-600">
                Halaman {notificationsPagination.current_page} dari {notificationsPagination.total_pages}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2">
              <button
                onClick={() => fetchNotifications(notificationsPagination.current_page - 1)}
                disabled={notificationsPagination.current_page === 1}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: Math.min(notificationsPagination.total_pages, 10) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => fetchNotifications(page)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        page === notificationsPagination.current_page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => fetchNotifications(notificationsPagination.current_page + 1)}
                disabled={notificationsPagination.current_page === notificationsPagination.total_pages}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage; 