import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  HomeIcon, 
  ArrowLeftIcon,
  SearchIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon
} from 'lucide-react';
import { FadeIn, HoverScale, Floating } from '../components/ui/AnimatedComponents';
import { MagneticButton } from '../components/ui/AdvancedAnimations';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WalletConnectBanner from '../components/WalletConnectBanner';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const popularPages = [
    { 
      name: 'Beranda', 
      href: '/', 
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'Halaman utama',
      bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <HeartIcon className="w-5 h-5" />,
      description: 'Portal donor',
      bgClass: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    { 
      name: 'Kampanye', 
      href: '/campaigns', 
      icon: <SearchIcon className="w-5 h-5" />,
      description: 'Cari campaign',
      bgClass: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    { 
      name: 'Tentang Kita', 
      href: '/about', 
      icon: <MapPinIcon className="w-5 h-5" />,
      description: 'Info lengkap',
      bgClass: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
  ];

  return (
    <>
      <WalletConnectBanner />
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" duration={0.8}>
          <div className="max-w-4xl mx-auto text-center">
            {/* 404 Animation */}
            <div className="mb-12 relative">
              <Floating intensity={8} duration={4}>
                <div className="relative inline-block">
                  <div className="text-[120px] sm:text-[180px] lg:text-[220px] font-bold text-red-100 leading-none select-none">
                    404
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl">
                      <HeartIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </Floating>
            </div>

            {/* Main Content */}
            <FadeIn direction="up" delay={0.2}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Halaman Tidak Ditemukan
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
                  Maaf, halaman yang Anda cari tidak dapat ditemukan.
                </p>
                <p className="text-base text-gray-500 max-w-2xl mx-auto">
                  Tapi jangan khawatir! Masih banyak cara untuk berkontribusi menyelamatkan nyawa melalui donor darah.
                </p>
              </div>
            </FadeIn>

            {/* Action Buttons */}
            <FadeIn direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <HoverScale scale={1.05}>
                  <MagneticButton
                    onClick={handleGoHome}
                    className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-200/50 flex items-center space-x-3"
                    strength={0.3}
                  >
                    <HomeIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Kembali ke Beranda</span>
                  </MagneticButton>
                </HoverScale>

                <HoverScale scale={1.05}>
                  <MagneticButton
                    onClick={handleGoBack}
                    className="group bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-md flex items-center space-x-3"
                    strength={0.2}
                  >
                    <ArrowLeftIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Halaman Sebelumnya</span>
                  </MagneticButton>
                </HoverScale>
              </div>
            </FadeIn>

            {/* Popular Pages */}
           

            {/* Help Section */}
            <FadeIn direction="up" delay={1}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Butuh Bantuan?
                </h3>
                <p className="text-gray-600 mb-6">
                  Tim DarahConnect siap membantu Anda. Hubungi kami jika ada pertanyaan.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HoverScale scale={1.02}>
                    <a
                      href="mailto:help@darahconnect.com"
                      className="group flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MailIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-xs text-gray-500">help@darahconnect.com</p>
                      </div>
                    </a>
                  </HoverScale>

                  <HoverScale scale={1.02}>
                    <a
                      href="tel:+621234567890"
                      className="group flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <PhoneIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Telepon</p>
                        <p className="text-xs text-gray-500">+62 123 456 7890</p>
                      </div>
                    </a>
                  </HoverScale>
                </div>
              </div>
            </FadeIn>
          </div>
        </FadeIn>
      </div>

      <Footer />
    </>
  );
};

export default NotFoundPage; 