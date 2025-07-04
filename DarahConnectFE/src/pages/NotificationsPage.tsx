import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BellIcon, 
  SearchIcon, 
  FilterIcon, 
  CheckIcon, 
  XIcon,
  TrashIcon,
  MailIcon,
  MailOpenIcon,
  ArrowLeftIcon,
  CalendarIcon,
  AlertTriangleIcon,
  InfoIcon,
  GiftIcon,
  HeartIcon,
  RefreshCwIcon
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
} from '../components/ui/AnimatedComponents';
import {
  HeartBeatLoader,
  DotsLoader,
} from '../components/ui/LoadingComponents';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WalletConnectBanner from '../components/WalletConnectBanner';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  unread: boolean;
  time: string;
  type?: string;
  created_at: string;
  is_read: boolean;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string | number>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1
  });

  // API hooks
  const { get: getNotifications } = useApi<any>();
  const { get: getUnreadCount } = useApi<any>();
  const { get: markAsRead } = useApi<any>();
  const { delete: deleteNotification } = useApi<any>();

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: { 
          from: '/notifications',
          message: 'Silakan login terlebih dahulu untuk melihat notifikasi.',
        },
      });
    }
  }, [isLoggedIn, navigate]);

  // Fetch notifications with pagination
  const fetchNotifications = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const response = await getNotifications(`/user/notifications/?page=${page}&limit=${limit}`);
      if (response && response.data) {
        let notificationData: any[] = [];
        let paginationData: PaginationInfo = {
          current_page: page,
          per_page: limit,
          total_items: 0,
          total_pages: 1
        };

        // Handle different response structures
        if (Array.isArray(response.data)) {
          notificationData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          if ('data' in response.data && Array.isArray(response.data.data)) {
            notificationData = response.data.data;
            if (response.data.pagination) {
              paginationData = response.data.pagination;
            }
          } else if ('notifications' in response.data && Array.isArray(response.data.notifications)) {
            notificationData = response.data.notifications;
          }
        }

        // Handle pagination info from response
        if (response.pagination) {
          paginationData = {
            current_page: response.pagination.page || response.pagination.current_page,
            per_page: response.pagination.per_page,
            total_items: response.pagination.total_items,
            total_pages: response.pagination.total_pages
          };
        }

        const mappedNotifications = notificationData.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          unread: !n.is_read,
          time: n.created_at,
          type: n.type || 'info',
          created_at: n.created_at,
          is_read: n.is_read,
        }));

        setNotifications(mappedNotifications);
        setFilteredNotifications(mappedNotifications);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount('/user/notifications/count');
      if (response && typeof response.data === 'number') {
        setUnreadCount(response.data);
      } else if (response && response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchNotifications(pagination.current_page), fetchUnreadCount()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isLoggedIn]);

  // Filter notifications based on search and status
  useEffect(() => {
    let filtered = notifications;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'unread') {
      filtered = filtered.filter(notif => notif.unread);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(notif => !notif.unread);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterStatus]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string | number) => {
    try {
      await markAsRead(`/user/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, unread: false, is_read: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string | number) => {
    try {
      await deleteNotification(`/user/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle bulk actions
  const handleSelectNotification = (notificationId: string | number) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(notif => notif.id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id =>
      markAsRead(`/user/notifications/${id}`)
    );
    
    try {
      await Promise.all(promises);
      setNotifications(prev =>
        prev.map(notif =>
          selectedNotifications.has(notif.id) ? { ...notif, unread: false, is_read: true } : notif
        )
      );
      setSelectedNotifications(new Set());
      fetchUnreadCount();
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus notifikasi yang dipilih?')) {
      return;
    }

    const promises = Array.from(selectedNotifications).map(id =>
      deleteNotification(`/user/notifications/${id}`)
    );
    
    try {
      await Promise.all(promises);
      setNotifications(prev => prev.filter(notif => !selectedNotifications.has(notif.id)));
      setSelectedNotifications(new Set());
      fetchUnreadCount();
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <GiftIcon className="w-5 h-5 text-yellow-500" />;
      case 'donation':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} hari yang lalu`;
      } else {
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
  };

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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <FadeIn direction="up">
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <HoverScale scale={1.05}>
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                  </HoverScale>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifikasi</h1>
                    <p className="text-gray-600">
                      Kelola semua notifikasi Anda ({unreadCount} belum dibaca)
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Controls */}
            <FadeIn direction="up" delay={0.1}>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari notifikasi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center space-x-2">
                    <FilterIcon className="w-5 h-5 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="all">Semua</option>
                      <option value="unread">Belum Dibaca</option>
                      <option value="read">Sudah Dibaca</option>
                    </select>
                  </div>

                  {/* Refresh Button */}
                  <HoverScale scale={1.05}>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </HoverScale>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.size > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {selectedNotifications.size} notifikasi dipilih
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleBulkMarkAsRead}
                        className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <MailOpenIcon className="w-4 h-4" />
                        <span>Tandai Dibaca</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Select All */}
                {filteredNotifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <div className={`w-4 h-4 border-2 rounded ${
                        selectedNotifications.size === filteredNotifications.length
                          ? 'bg-red-600 border-red-600'
                          : 'border-gray-300'
                      } flex items-center justify-center`}>
                        {selectedNotifications.size === filteredNotifications.length && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span>
                        {selectedNotifications.size === filteredNotifications.length
                          ? 'Batalkan Pilih Semua'
                          : 'Pilih Semua'
                        }
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Notifications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <HeartBeatLoader size={60} />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <FadeIn direction="up" delay={0.2}>
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'Tidak Ada Hasil' 
                        : 'Tidak Ada Notifikasi'
                      }
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Coba ubah filter atau kata kunci pencarian Anda.'
                        : 'Anda belum memiliki notifikasi apapun.'
                      }
                    </p>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span>Kembali ke Dashboard</span>
                    </Link>
                  </div>
                </FadeIn>
              ) : (
                <StaggerContainer className="space-y-3" staggerDelay={0.05}>
                  {filteredNotifications.map((notification, index) => (
                    <StaggerItem key={notification.id}>
                      <HoverScale scale={1.01}>
                        <div className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all duration-300 ${
                          notification.unread 
                            ? 'border-red-400 bg-red-50/30' 
                            : 'border-gray-300 hover:shadow-md'
                        }`}>
                          <div className="p-6">
                            <div className="flex items-start space-x-4">
                              {/* Checkbox */}
                              <button
                                onClick={() => handleSelectNotification(notification.id)}
                                className="mt-1 flex-shrink-0"
                              >
                                <div className={`w-4 h-4 border-2 rounded ${
                                  selectedNotifications.has(notification.id)
                                    ? 'bg-red-600 border-red-600'
                                    : 'border-gray-300 hover:border-gray-400'
                                } flex items-center justify-center transition-colors`}>
                                  {selectedNotifications.has(notification.id) && (
                                    <CheckIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </button>

                              {/* Icon */}
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type || 'info')}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className={`text-lg font-semibold ${
                                      notification.unread ? 'text-gray-900' : 'text-gray-700'
                                    } mb-1`}>
                                      {notification.title}
                                      {notification.unread && (
                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                                      )}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatTime(notification.time)}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center space-x-2 ml-4">
                                    {notification.unread && (
                                      <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Tandai sebagai dibaca"
                                      >
                                        <MailOpenIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                    {/* <button
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Hapus notifikasi"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverScale>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <FadeIn direction="up" delay={0.3}>
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total_items)} dari {pagination.total_items} notifikasi
                    </div>
                    <div className="text-sm text-gray-600">
                      Halaman {pagination.current_page} dari {pagination.total_pages}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => fetchNotifications(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sebelumnya
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(pagination.total_pages, 10) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => fetchNotifications(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              page === pagination.current_page
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
                      onClick={() => fetchNotifications(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Back to Dashboard */}
            <FadeIn direction="up" delay={0.4}>
              <div className="mt-8 text-center">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Kembali ke Dashboard</span>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </FadeIn>
      <Footer />
    </>
  );
};

export default NotificationsPage; 