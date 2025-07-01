import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import CampaignsList from './components/CampaignsList';
import DonationModal from './components/DonationModal';
import CryptoDonationModal from './components/CryptoDonationModal';
import WalletConnectBanner from './components/WalletConnectBanner';
import ChatBot from './components/ChatBot';
import ChatBotDemo from './components/ChatBotDemo';
import { HomepageLoader } from './components/ui/LoadingComponents';
import { PageLoader, DashboardLoader, CampaignListLoader, ErrorFallback } from './components/ui/LazyLoadingComponents';
import { useCampaignService } from './services/campaignService';
import { BloodCampaign } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import DonorConfirmationModal from './components/DonorConfirmationModal';
import { useNotification } from './hooks/useNotification';

// Lazy-loaded Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'));
const CreateCampaignPage = lazy(() => import('./pages/CreateCampaignPage'));
const DonorPage = lazy(() => import('./pages/DonorPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const EnhancedDonorRegisterPage = lazy(() => import('./pages/EnhancedDonorRegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage'));
const CreateBloodRequestPage = lazy(() => import('./pages/CreateBloodRequestPage'));
const BloodRequestsPage = lazy(() => import('./pages/BloodRequestsPage'));
const MyBloodRequestsPage = lazy(() => import('./pages/MyBloodRequestsPage'));
const HealthPassportPage = lazy(() => import('./pages/HealthPassportPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'));
const BloodDonationHistoryPage = lazy(() => import('./pages/BloodDonationHistoryPage'));

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCampaignsPage = lazy(() => import('./pages/AdminCampaignsPage'));
const AdminDonorsPage = lazy(() => import('./pages/AdminDonorsPage'));
const AdminHospitalsPage = lazy(() => import('./pages/AdminHospitalsPage'));
const AdminRequestsPage = lazy(() => import('./pages/AdminRequestsPage'));
const AdminCertificatesPage = lazy(() => import('./pages/AdminCertificatesPage'));
const AdminHealthPassportPage = lazy(() => import('./pages/AdminHealthPassportPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminProfilePage = lazy(() => import('./pages/AdminProfilePage'));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

// Homepage Component
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const campaignService = useCampaignService();
  const { addNotification } = useNotification();
  const [campaigns, setCampaigns] = useState<BloodCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const handleViewDetails = (campaign: BloodCampaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDonorRegistration = async (notes: string) => {
    if (!selectedCampaign) return;

    try {
      const success = await campaignService.registerAsDonor(Number(selectedCampaign.id), notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        // Refresh campaign data to update donor count
        const campaignData = await campaignService.fetchCampaigns();
        setCampaigns(campaignData);
      } else {
        addNotification({
          type: 'error',
          title: 'Pendaftaran Gagal',
          message: 'Terjadi kesalahan saat mendaftar sebagai donor. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleCryptoDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsCryptoModalOpen(true);
  };

  const handleCryptoDonationSuccess = (txHash: string) => {
    console.log('Crypto donation successful:', txHash);
    alert(`Donasi crypto berhasil! Transaction Hash: ${txHash}`);
    setIsCryptoModalOpen(false);
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

  // Load campaigns from API
  React.useEffect(() => {
    const loadCampaigns = async () => {
      setCampaignsLoading(true);
      try {
        const campaignData = await campaignService.fetchCampaigns();
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      } finally {
        setCampaignsLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Simplified loading - only show for 2 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
    return <HomepageLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <>
      <WalletConnectBanner />
      <Header />
      <HeroSection />
      <CampaignsList
        campaigns={campaigns}
        onViewDetails={handleViewDetails}
        onDonate={handleDonate}
        onCryptoDonate={handleCryptoDonate}
      />
      <Footer />

      <DonorConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onConfirm={handleDonorRegistration}
      />

      <CryptoDonationModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        campaign={selectedCampaign}
        onSuccess={handleCryptoDonationSuccess}
      />
    </>
  );
};

// Campaigns Page Component with Lazy Loading Support
const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const campaignService = useCampaignService();
  const { addNotification } = useNotification();
  const [campaigns, setCampaigns] = useState<BloodCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);

  const handleViewDetails = (campaign: BloodCampaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDonorRegistration = async (notes: string) => {
    if (!selectedCampaign) return;

    try {
      const success = await campaignService.registerAsDonor(Number(selectedCampaign.id), notes);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Pendaftaran Berhasil!',
          message: 'Anda telah berhasil mendaftar sebagai donor. Tim akan menghubungi Anda segera.',
          duration: 5000
        });
        // Refresh campaign data to update donor count
        const campaignData = await campaignService.fetchCampaigns();
        setCampaigns(campaignData);
      } else {
        addNotification({
          type: 'error',
          title: 'Pendaftaran Gagal',
          message: 'Terjadi kesalahan saat mendaftar sebagai donor. Silakan coba lagi.',
          duration: 5000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
        duration: 5000
      });
    }
  };

  const handleCryptoDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsCryptoModalOpen(true);
  };

  const handleCryptoDonationSuccess = (txHash: string) => {
    console.log('Crypto donation successful:', txHash);
    alert(`Donasi crypto berhasil! Transaction Hash: ${txHash}`);
    setIsCryptoModalOpen(false);
  };

  // Load campaigns from API
  React.useEffect(() => {
    const loadCampaigns = async () => {
      setCampaignsLoading(true);
      try {
        const campaignData = await campaignService.fetchCampaigns();
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      } finally {
        setCampaignsLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  return (
    <>
      <WalletConnectBanner />
      <Header />
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Campaign Donor Darah</h1>
            <p className="text-gray-600">Temukan campaign yang membutuhkan bantuan Anda</p>
          </div>
          <Suspense fallback={<CampaignListLoader />}>
            <CampaignsList
              campaigns={campaigns}
              onViewDetails={handleViewDetails}
              onDonate={handleDonate}
              onCryptoDonate={handleCryptoDonate}
            />
          </Suspense>
        </div>
      </div>
      <Footer />

      <DonorConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onConfirm={handleDonorRegistration}
      />

      <CryptoDonationModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        campaign={selectedCampaign}
        onSuccess={handleCryptoDonationSuccess}
      />
    </>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Protected Route Component
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // In real app, check user role

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Dashboard Layout Component
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="App relative">
          {/* ChatBot tersedia di semua halaman */}
          {/* Gunakan ChatBotDemo untuk testing tanpa n8n */}
          {/* <ChatBotDemo 
          position="bottom-right"
          primaryColor="#ef4444"
          botName="DarahConnect Assistant"
          welcomeMessage="Halo! Saya assistant DarahConnect. Ada yang bisa saya bantu hari ini? 🩸"
        /> */}

          {/* Uncomment untuk menggunakan ChatBot dengan n8n webhook */}

          <ChatBot
            position="bottom-right"
            primaryColor="#ef4444"
            botName="DarahConnect Assistant"
            welcomeMessage="Halo! Saya assistant DarahConnect. Ada yang bisa saya bantu hari ini? 🩸"
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/:id" element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <CampaignDetailPage />
                  </Suspense>
                </Layout>
              } />
              <Route path="/donors" element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DonorPage />
                  </Suspense>
                </Layout>
              } />
              <Route path="/oauth/callback" element={<Suspense fallback={<PageLoader />}><OAuthCallbackPage /></Suspense>} />
              <Route path="/about" element={
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                </Layout>
              } />
              <Route path="/blood-requests" element={
                <Suspense fallback={<PageLoader />}>
                  <BloodRequestsPage />
                </Suspense>
              } />
              <Route path="/login" element={
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              } />
              <Route path="/register" element={
                <Suspense fallback={<PageLoader />}>
                  <RegisterPage />
                </Suspense>
              } />
              <Route path="/history-donor" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <BloodDonationHistoryPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/forgot-password" element={
                <Suspense fallback={<PageLoader />}>
                  <ForgotPasswordPage />
                </Suspense>
              } />
              <Route path="/reset-password" element={
                <Suspense fallback={<PageLoader />}>
                  <ResetPasswordPage />
                </Suspense>
              } />
              <Route path="/verify-email" element={
                <Suspense fallback={<PageLoader />}>
                  <EmailVerificationPage />
                </Suspense>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardLoader />}>
                    <DashboardPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/certificates" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <CertificatePage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/donor-register" element={
                <Suspense fallback={<PageLoader />}>
                  <EnhancedDonorRegisterPage />
                </Suspense>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <NotificationsPage />
                  </Suspense>
                </ProtectedRoute>
              } />

              {/* Protected Routes */}
              <Route path="/create-campaign" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Suspense fallback={<PageLoader />}>
                      <CreateCampaignPage />
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/create-blood-request" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <CreateBloodRequestPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/my-blood-requests" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <MyBloodRequestsPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/health-passport" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <HealthPassportPage />
                  </Suspense>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<DashboardLoader />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/campaigns" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminCampaignsPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/donors" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminDonorsPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/hospitals" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminHospitalsPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/requests" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminRequestsPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/certificates" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminCertificatesPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/health-passports" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminHealthPassportPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminSettingsPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminProfilePage />
                  </Suspense>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/notifications" element={
                <AdminProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminNotificationsPage />
                  </Suspense>
                </AdminProtectedRoute>
              } />

              {/* Catch all route - 404 Page */}
              <Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <NotFoundPage />
                </Suspense>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
