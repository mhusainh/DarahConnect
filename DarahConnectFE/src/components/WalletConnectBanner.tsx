import React, { useState, useEffect } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { walletService } from '../services/walletService';
import { Wallet, X, Shield, TrendingUp, Gift } from 'lucide-react';
import { HoverScale, FadeIn } from './ui/AnimatedComponents';
import { MagneticButton } from './ui/AdvancedAnimations';
import MetaMaskInstallModal from './MetaMaskInstallModal';
import { parseJwt } from '../utils/jwt';
import CustomAlert from './CustomAlert';

export const WalletConnectBanner: React.FC = () => {
  const { isConnected, connect, isConnecting, account, balance, network, isMetaMaskInstalled } = useMetaMask();
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = localStorage.getItem('walletBannerDismissed');
    return dismissed === 'true';
  });
  const [isApiCalling, setIsApiCalling] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Cek login dan status metamask dari JWT
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      const user = parseJwt(token);
      setIsMetamaskConnected(user?.metamask === true);
    } else {
      setIsLoggedIn(false);
      setIsMetamaskConnected(false);
    }
  }, []);

  // Monitor login status changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
        const user = parseJwt(token);
        setIsMetamaskConnected(user?.metamask === true);
      } else {
        setIsLoggedIn(false);
        setIsMetamaskConnected(false);
      }
      // Reset dismiss state when user logs out
      if (!token) {
        setIsDismissed(false);
        localStorage.removeItem('walletBannerDismissed');
      }
    };
    // Check initial status
    checkLoginStatus();
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkLoginStatus();
      }
    };
    // Listen for custom login/logout events
    const handleLoginEvent = () => checkLoginStatus();
    const handleLogoutEvent = () => checkLoginStatus();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleLoginEvent);
    window.addEventListener('userLogout', handleLogoutEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLoginEvent);
      window.removeEventListener('userLogout', handleLogoutEvent);
    };
  }, []);

  // Handle wallet connection with API call
  const handleConnectWallet = async () => {
    try {
      setIsApiCalling(true);
      
      // Check if MetaMask is installed first
      if (!isMetaMaskInstalled) {
        // Show MetaMask installation modal
        setShowInstallModal(true);
        setIsApiCalling(false);
        return;
      }
      
      // First, connect to MetaMask
      await connect();
      
      // Check if connection was successful
      if (!account) {
        // alert('❌ Gagal terhubung ke MetaMask. Pastikan akun sudah dipilih di MetaMask.');
        setIsApiCalling(false);
        return;
      }

      console.log('✅ MetaMask connected:', { account, network, balance });
      
      // Call API to sync wallet address
      try {
        const result = await walletService.connectWallet({
          address: account,
          network: network?.name || 'Unknown',
          balance: balance || '0',
          timestamp: Date.now(),
        });
        // setSuccessAlertMessage(
        //   `Address: ${account}\nNetwork: ${network?.name || 'Unknown'}\nBalance: ${balance || '0'} ETH`
        // );
        // setShowSuccessAlert(true);
        if (result.success) {
          console.log('✅ Wallet synced to API:', result);
          <CustomAlert
          type="success"
          title="🎉 Wallet berhasil terhubung!"
          message={successAlertMessage}
          isVisible={showSuccessAlert}
          onClose={() => {
            setShowSuccessAlert(false);
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }}
        />
          setSuccessAlertMessage(
            `Address: ${account}\nNetwork: ${network?.name || 'Unknown'}\nBalance: ${balance || '0'} ETH`
          );
          setShowSuccessAlert(true);
          setIsDismissed(true);
          localStorage.setItem('walletBannerDismissed', 'true');
          return;
        } else {
        }
      } catch (apiError) {
      }
      
    } catch (error: any) {
      console.error('❌ Connect wallet error:', error);
      
      // Show specific error messages
      if (error.message?.includes('MetaMask is not installed')) {
        setShowInstallModal(true);
      } else if (error.message?.includes('User rejected')) {
        alert('❌ Koneksi dibatalkan oleh user.');
      } else {
        alert(`❌ Gagal terhubung ke MetaMask:\n${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsApiCalling(false);
    }
  };

  // Banner hanya muncul jika user login, metamask: false, dan belum dismissed
  if (!isLoggedIn || isMetamaskConnected || isDismissed) {
    return null;
  }

  return (
    <>
      <MetaMaskInstallModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />

      <FadeIn direction="down" delay={0.1}>
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Content */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      🔗 Hubungkan Wallet untuk Sertifikat Digital
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Selamat datang! Hubungkan MetaMask Anda untuk mendapatkan sertifikat donasi yang aman dan terverifikasi
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits Icons */}
              <div className="hidden lg:flex items-center space-x-8 mr-8">
                <div className="flex items-center space-x-2 text-blue-100">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-medium">Secure</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Permanent</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <Gift className="w-4 h-4" />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 ml-4">
              {/* Connect Button */}
              <HoverScale scale={1.05}>
                <MagneticButton
                  onClick={handleConnectWallet}
                  disabled={isConnecting || isApiCalling}
                  className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-75 flex items-center space-x-2"
                  strength={0.3}
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isApiCalling ? 'Menyinkron...' : isConnecting ? 'Menghubungkan...' : 'Hubungkan Wallet'}
                  </span>
                </MagneticButton>
              </HoverScale>

              {/* Dismiss Button */}
              <button
                onClick={() => {
                  setIsDismissed(true);
                  localStorage.setItem('walletBannerDismissed', 'true');
                }}
                className="text-blue-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Debug Reset Button - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    localStorage.removeItem('walletBannerDismissed');
                    setIsDismissed(false);
                    console.log('🔄 Banner state reset for debugging');
                  }}
                  className="text-orange-300 hover:text-orange-100 transition-colors p-2 rounded-lg hover:bg-white/10 text-xs"
                  title="Reset banner state for testing"
                >
                  🔄
                </button>
              )}
            </div>
          </div>

          {/* Mobile Benefits */}
          <div className="lg:hidden mt-4 pt-4 border-t border-blue-500/30">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2 text-blue-100">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Penyimpanan Aman</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Catatan Permanen</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-medium">Sertifikat Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>
    </FadeIn>
    </>
  );
};

export default WalletConnectBanner; 