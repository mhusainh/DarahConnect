import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

interface Notification {
  id: string;
  type: 'system' | 'certificate' | 'campaign' | 'donor' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: {
    userId?: string;
    campaignId?: string;
    certificateId?: string;
  };
}

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'certificate',
      title: 'Sertifikat Baru Menunggu Approval',
      message: 'Ahmad Suryadi telah mengajukan sertifikat donor darah CERT-2024-001',
      timestamp: '2024-01-20T10:15:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/admin/certificates',
      metadata: { userId: 'USER-001', certificateId: 'CERT-2024-001' }
    },
    {
      id: '2',
      type: 'urgent',
      title: 'Campaign Darurat Membutuhkan Persetujuan',
      message: 'RS Hasan Sadikin membutuhkan donor O+ untuk operasi darurat',
      timestamp: '2024-01-20T09:45:00Z',
      read: false,
      priority: 'critical',
      actionUrl: '/admin/campaigns',
      metadata: { campaignId: 'CAMP-001' }
    },
    {
      id: '3',
      type: 'donor',
      title: 'Donor Baru Terdaftar',
      message: 'Siti Nurhaliza telah mendaftar sebagai donor baru',
      timestamp: '2024-01-20T09:30:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/admin/donors',
      metadata: { userId: 'USER-002' }
    },
    {
      id: '4',
      type: 'system',
      title: 'Backup Database Selesai',
      message: 'Backup database harian telah berhasil diselesaikan',
      timestamp: '2024-01-20T06:00:00Z',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'certificate',
      title: 'Sertifikat Achievement Menunggu Review',
      message: 'Budi Santoso mengajukan sertifikat achievement untuk 15 kali donasi',
      timestamp: '2024-01-19T16:20:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/admin/certificates',
      metadata: { userId: 'USER-003', certificateId: 'CERT-2024-003' }
    },
    {
      id: '6',
      type: 'campaign',
      title: 'Campaign Hampir Berakhir',
      message: 'Campaign "Donor Darah Ramadan" akan berakhir dalam 2 hari',
      timestamp: '2024-01-19T14:00:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/admin/campaigns',
      metadata: { campaignId: 'CAMP-002' }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.read) ||
                       (filterRead === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Award className="w-5 h-5 text-yellow-600" />;
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'donor': return <Users className="w-5 h-5 text-blue-600" />;
      case 'campaign': return <Heart className="w-5 h-5 text-red-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
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
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      critical: notifications.filter(n => n.priority === 'critical').length,
      today: notifications.filter(n => {
        const today = new Date().toDateString();
        return new Date(n.timestamp).toDateString() === today;
      }).length
    };
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleMarkAsUnread = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: false } : notification
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleBulkMarkAsRead = () => {
    setNotifications(prev => prev.map(notification => 
      selectedNotifications.includes(notification.id) 
        ? { ...notification, read: true } 
        : notification
    ));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    setNotifications(prev => prev.filter(notification => 
      !selectedNotifications.includes(notification.id)
    ));
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (id: string) => {
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
    <AdminLayout title="Notifikasi" subtitle="Kelola notifikasi dan peringatan sistem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifikasi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="certificate">Sertifikat</option>
                <option value="urgent">Darurat</option>
                <option value="donor">Donor</option>
                <option value="campaign">Campaign</option>
                <option value="system">Sistem</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Semua</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
              </select>
            </div>
            
            {selectedNotifications.length > 0 && (
              <div className="flex space-x-2">
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

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'border-r-4 border-r-blue-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <label className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{new Date(notification.timestamp).toLocaleString('id-ID')}</span>
                          </div>
                          {getPriorityBadge(notification.priority)}
                          {!notification.read && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              Baru
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.read ? (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Tandai sebagai dibaca"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            className="text-gray-600 hover:text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Tandai sebagai belum dibaca"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        
                        {notification.actionUrl && (
                          <button
                            onClick={() => window.open(notification.actionUrl, '_blank')}
                            className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Lihat detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus notifikasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage; 