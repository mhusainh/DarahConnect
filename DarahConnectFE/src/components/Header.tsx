import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshakeIcon, 
  MenuIcon, 
  XIcon, 
  SearchIcon,
  LogOutIcon,
  HeartIcon,
  UserIcon,
  AwardIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  Settings,
  User,
  FileTextIcon,
  BellIcon
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { HoverScale, FadeIn } from './ui/AnimatedComponents';
import { MagneticButton } from './ui/AdvancedAnimations';
import { useApi } from '../hooks/useApi';

type Notification = {
  id: string | number;
  title: string;
  message: string;
  unread: boolean;
  time?: string;
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDetail, setNotifDetail] = useState<Notification | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName') || 'User';
    setIsLoggedIn(loggedIn);
    setUserName(name);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate('/');
  };

  const handleDonateNow = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      navigate('/donor-register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleClosePrompt = () => {
    setShowLoginPrompt(false);
  };

  const handleGoToLogin = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const handleGoToRegister = () => {
    setShowLoginPrompt(false);
    navigate('/register');
  };

  const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Kampanye', href: '/campaigns' },
    { name: 'Permintaan Darah', href: '/blood-requests' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tentang Kita', href: '/about' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Generate user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch notifications from API
  const { get: getNotificationsApi, patch: patchNotificationApi } = useApi<any>();
  const { get: getUnreadCountApi } = useApi<any>();
  const { get: getProfileApi } = useApi<any>();

  // Fetch notifications list
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

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotifications();
    fetchUnreadCount();
    getProfileApi('/user/profile').then((res) => {
      if (res && res.data) setUserProfile(res.data);
    });
  }, [isLoggedIn, getNotificationsApi, getUnreadCountApi, getProfileApi]);

  // Mark notification as read and show detail
  const handleNotifClick = (notif: Notification) => {
    setNotifDetail(notif);
    if (notif.unread) {
      patchNotificationApi(`/user/notifications/${notif.id}`).then(() => {
        fetchNotifications();
        fetchUnreadCount();
      });
    }
  };

  // Tutup dropdown jika klik di luar area
  type ClickEvent = MouseEvent & { target: HTMLElement };
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleClick = (e: any) => {
      if (!document.getElementById('notif-bell')?.contains(e.target) &&
          !document.getElementById('notif-dropdown')?.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifDropdown]);

  return (
    <FadeIn direction="down">
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo - More compact */}
            <HoverScale scale={1.02} duration={0.2}>
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-red-200/50 transition-all duration-300">
                  <HeartIcon className="w-5 h-5 text-white fill-current" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                    DarahConnect
                  </h1>
                  <p className="text-xs text-gray-500 font-medium leading-tight">Komunitas Donor Darah</p>
                </div>
              </Link>
            </HoverScale>

            {/* Desktop Navigation - More compact and clean */}
            <nav className="hidden md:flex items-center space-x-0.5 bg-gray-50/60 backdrop-blur-sm rounded-xl p-0.5 border border-gray-200/50">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    isActive(item.href) 
                      ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-white/80'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons - More compact */}
            <div className="hidden md:flex items-center space-x-3">
              {!isLoggedIn ? (
                <>
                  <HoverScale scale={1.02}>
                    <MagneticButton
                      onClick={handleDonateNow}
                      className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-red-200/50"
                      strength={0.3}
                    >
                      <div className="flex items-center space-x-1.5">
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </div>
                    </MagneticButton>
                  </HoverScale>
                  
                  <HoverScale scale={1.02}>
                    <MagneticButton
                      onClick={handleLogin}
                      className="group flex items-center space-x-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
                      strength={0.2}
                    >
                      <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>Masuk</span>
                    </MagneticButton>
                  </HoverScale>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <HoverScale scale={1.02}>
                    <MagneticButton
                      onClick={handleDonateNow}
                      className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-red-200/50"
                      strength={0.3}
                    >
                      <div className="flex items-center space-x-1.5">
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </div>
                    </MagneticButton>
                  </HoverScale>
                  
                  {/* Enhanced User Menu - More compact */}
                  <div className="relative">
                    <HoverScale scale={1.02}>
                      <MagneticButton
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="group flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
                        strength={0.2}
                      >
                        <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-sm overflow-hidden">
                          {userProfile && userProfile.url_file ? (
                            <img src={userProfile.url_file} alt="Profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            getUserInitials(userName)
                          )}
                        </div>
                        <div className="hidden lg:block text-left">
                          <p className="text-xs font-semibold text-gray-900 leading-tight">Halo!</p>
                          <p className="text-xs text-gray-500 truncate max-w-20">{userName}</p>
                        </div>
                        <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                      </MagneticButton>
                    </HoverScale>

                    {/* User Dropdown Menu - Improved styling */}
                    {showUserMenu && (
                      <FadeIn direction="down" delay={0.1}>
                        <div className="absolute right-0 mt-2 w-42 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
                          <div className="px-3 py-2.5 border-b border-gray-100">
                            <div className="flex items-center space-x-2.5">                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                                {userProfile && userProfile.url_file ? (
                                  <img src={userProfile.url_file} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  getUserInitials(userName)
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500">Donor Aktif</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/profile');
                              }}
                              className="flex items-center space-x-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>Profil Saya</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/my-blood-requests');
                              }}
                              className="flex items-center space-x-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FileTextIcon className="w-4 h-4" />
                              <span>Permintaan Saya</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/settings');
                              }}
                              className="flex items-center space-x-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Pengaturan</span>
                            </button>
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2.5 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOutIcon className="w-4 h-4" />
                              <span>Keluar</span>
                            </button>
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </div>

                  {/* Tambahkan icon notifikasi di desktop */}
                  {isLoggedIn && (
                    <div className="relative ml-2">
                      <button
                        id="notif-bell"
                        className="relative focus:outline-none"
                        title="Notifikasi"
                        onClick={() => setShowNotifDropdown((v) => !v)}
                      >
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {showNotifDropdown && (
                        <div
                          id="notif-dropdown"
                          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b font-semibold text-gray-800">Notifikasi</div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifLoading ? (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">Memuat notifikasi...</div>
                            ) : notifications.length === 0 ? (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">Tidak ada notifikasi</div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  onClick={() => handleNotifClick(notif)}
                                  className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors ${notif.unread ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                                >
                                  <div className="font-medium text-gray-900 truncate">{notif.title}</div>
                                  <div className="text-xs text-gray-600 mb-1 truncate">{notif.message}</div>
                                  {notif.time && <div className="text-xs text-gray-400">{notif.time}</div>}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      {/* Modal untuk detail notifikasi */}
                      {notifDetail && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40">
                          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
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
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button - More compact */}
            <div className="md:hidden">
              <MagneticButton
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl text-gray-600 hover:text-red-600 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50 transition-all duration-300 shadow-sm"
                strength={0.2}
              >
                {isMenuOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Improved styling */}
        {isMenuOpen && (
          <FadeIn direction="down" delay={0.1}>
            <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
              <div className="px-4 py-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-3 border-t border-gray-200/50 space-y-2">
                  {!isLoggedIn ? (
                    <>
                      <MagneticButton
                        onClick={() => {
                          handleDonateNow();
                          setIsMenuOpen(false);
                        }}
                        className="group flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md"
                        strength={0.3}
                      >
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </MagneticButton>
                      
                      <MagneticButton
                        onClick={() => {
                          handleLogin();
                          setIsMenuOpen(false);
                        }}
                        className="group flex items-center justify-center space-x-2 w-full bg-white/90 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
                        strength={0.2}
                      >
                        <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span>Masuk</span>
                      </MagneticButton>
                    </>
                  ) : (
                    <>
                      <MagneticButton
                        onClick={() => {
                          handleDonateNow();
                          setIsMenuOpen(false);
                        }}
                        className="group flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md"
                        strength={0.3}
                      >
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </MagneticButton>
                      
                      {/* Mobile User Info - More compact */}
                      <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                        <div className="flex items-center space-x-2.5 mb-2.5">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm overflow-hidden">
                            {userProfile && userProfile.url_file ? (
                              <img src={userProfile.url_file} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              getUserInitials(userName)
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Halo, {userName}!</p>
                            <p className="text-xs text-gray-500">Donor Aktif</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-2.5 w-full px-2.5 py-2 text-sm text-gray-700 hover:bg-white/70 rounded-lg transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profil Saya</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/my-blood-requests');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-2.5 w-full px-2.5 py-2 text-sm text-gray-700 hover:bg-white/70 rounded-lg transition-colors"
                          >
                            <FileTextIcon className="w-4 h-4" />
                            <span>Permintaan Saya</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/settings');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-2.5 w-full px-2.5 py-2 text-sm text-gray-700 hover:bg-white/70 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Pengaturan</span>
                          </button>
                          
                          <div className="border-t border-gray-200/50 my-1.5"></div>
                          
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-2.5 w-full px-2.5 py-2 text-sm text-red-600 hover:bg-red-50/70 rounded-lg transition-colors"
                          >
                            <LogOutIcon className="w-4 h-4" />
                            <span>Keluar</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </header>

      {/* Login Prompt Modal - Improved styling */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <FadeIn>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Login Diperlukan</h3>
                  <p className="text-sm text-gray-500">Untuk mendaftar sebagai donor</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                Anda harus memiliki akun terlebih dahulu untuk mendaftar sebagai donor darah. 
                Silakan login jika sudah punya akun, atau buat akun baru.
              </p>
              
              <div className="flex space-x-2.5 mb-3">
                <button
                  onClick={handleGoToLogin}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-red-200/50 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={handleGoToRegister}
                  className="flex-1 bg-white/90 border border-red-200 text-red-700 py-2.5 px-4 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-sm text-sm"
                >
                  Daftar Akun
                </button>
              </div>
              
              <button
                onClick={handleClosePrompt}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          </FadeIn>
        </div>
      )}
    </FadeIn>
  );
};

export default Header; 