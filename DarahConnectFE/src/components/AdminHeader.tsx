import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Search,
  Menu,
  ChevronDown,
  Award,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sample notifications data
  const notifications = [
    {
      id: '1',
      type: 'certificate',
      title: 'Sertifikat Baru Menunggu Approval',
      message: 'Ahmad Suryadi telah mengajukan sertifikat donor darah',
      timestamp: '5 menit lalu',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'urgent',
      title: 'Campaign Darurat',
      message: 'RS Hasan Sadikin membutuhkan donor O+',
      timestamp: '15 menit lalu',
      read: false,
      priority: 'critical'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Admin profile data
  const adminProfile = {
    name: 'Dr. Andi Wijaya',
    email: 'admin@darahconnect.com',
    role: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Award className="w-4 h-4 text-yellow-600" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'donor': return <User className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu toggle and search */}
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search bar */}
            <div className="hidden md:block max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
                      <Link
                        to="/admin/notifications"
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        Lihat Semua
                      </Link>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                            <div className="flex items-center mt-1">
                              <Clock className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{notification.timestamp}</span>
                              {!notification.read && (
                                <span className="ml-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {notifications.length === 0 && (
                    <div className="p-6 text-center">
                      <Bell className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs">Tidak ada notifikasi</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={adminProfile.avatar}
                  alt={adminProfile.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{adminProfile.name}</p>
                  <p className="text-xs text-gray-500">{adminProfile.role}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={adminProfile.avatar}
                        alt={adminProfile.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{adminProfile.name}</h3>
                        <p className="text-xs text-gray-600">{adminProfile.email}</p>
                        <p className="text-xs text-gray-500">{adminProfile.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Profil Admin</span>
                    </Link>
                    
                    <Link
                      to="/admin/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Pengaturan</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 