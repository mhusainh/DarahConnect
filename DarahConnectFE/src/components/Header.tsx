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
  User
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { HoverScale, FadeIn } from './ui/AnimatedComponents';
import { MagneticButton } from './ui/AdvancedAnimations';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  return (
    <FadeIn direction="down">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <HoverScale scale={1.05} duration={0.2}>
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-red-200/50 transition-all duration-300">
                  <HeartIcon className="w-7 h-7 text-white fill-current" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                    DarahConnect
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Komunitas Donor Darah</p>
                </div>
              </Link>
            </HoverScale>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.href}
                  className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isActive(item.href) 
                      ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-white/70'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <HoverScale scale={1.05}>
                    <MagneticButton
                      onClick={handleDonateNow}
                      className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-200/50"
                      strength={0.3}
                    >
                      <div className="flex items-center space-x-2">
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </div>
                    </MagneticButton>
                  </HoverScale>
                  
                  <HoverScale scale={1.05}>
                    <MagneticButton
                      onClick={handleLogin}
                      className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md"
                      strength={0.2}
                    >
                      <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>Masuk</span>
                    </MagneticButton>
                  </HoverScale>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <HoverScale scale={1.05}>
                    <MagneticButton
                      onClick={handleDonateNow}
                      className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-200/50"
                      strength={0.3}
                    >
                      <div className="flex items-center space-x-2">
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </div>
                    </MagneticButton>
                  </HoverScale>
                  
                  {/* Enhanced User Menu */}
                  <div className="relative">
                    <HoverScale scale={1.05}>
                      <MagneticButton
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="group flex items-center space-x-3 bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-3 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md"
                        strength={0.2}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {getUserInitials(userName)}
                        </div>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-semibold text-gray-900">Halo!</p>
                          <p className="text-xs text-gray-600 truncate max-w-24">{userName}</p>
                        </div>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                      </MagneticButton>
                    </HoverScale>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <FadeIn direction="down" delay={0.1}>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {getUserInitials(userName)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{userName}</p>
                                <p className="text-sm text-gray-600">Donor Aktif</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/profile');
                              }}
                              className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>Profil Saya</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/settings');
                              }}
                              className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Pengaturan</span>
                            </button>
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <LogOutIcon className="w-4 h-4" />
                              <span>Keluar</span>
                            </button>
                          </div>
                        </div>
                      </FadeIn>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <MagneticButton
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 rounded-2xl text-gray-600 hover:text-red-600 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50 transition-all duration-300 shadow-md"
                strength={0.2}
              >
                {isMenuOpen ? (
                  <XIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <FadeIn direction="down" delay={0.1}>
            <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
              <div className="px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-200/50 space-y-3">
                  {!isLoggedIn ? (
                    <>
                      <MagneticButton
                        onClick={() => {
                          handleDonateNow();
                          setIsMenuOpen(false);
                        }}
                        className="group flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-4 rounded-2xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
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
                        className="group flex items-center justify-center space-x-2 w-full bg-white/90 border border-gray-200 text-gray-700 px-4 py-4 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md"
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
                        className="group flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-4 rounded-2xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
                        strength={0.3}
                      >
                        <HeartIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                        <span>Daftar Donor</span>
                      </MagneticButton>
                      
                      {/* Mobile User Info */}
                      <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {getUserInitials(userName)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Halo, {userName}!</p>
                            <p className="text-xs text-gray-600">Donor Aktif</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/70 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profil Saya</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/settings');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/70 rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Pengaturan</span>
                          </button>
                          
                          <div className="border-t border-gray-200/50 my-2"></div>
                          
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50/70 rounded-xl transition-colors"
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <FadeIn>
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertCircleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Login Diperlukan</h3>
                  <p className="text-sm text-gray-600">Untuk mendaftar sebagai donor</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed">
                Anda harus memiliki akun terlebih dahulu untuk mendaftar sebagai donor darah. 
                Silakan login jika sudah punya akun, atau buat akun baru.
              </p>
              
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={handleGoToLogin}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-200/50"
                >
                  Login
                </button>
                <button
                  onClick={handleGoToRegister}
                  className="flex-1 bg-white/90 border border-red-200 text-red-700 py-3 px-6 rounded-2xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-md"
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