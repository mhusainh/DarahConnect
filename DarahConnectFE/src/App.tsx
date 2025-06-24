import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import CampaignsList from './components/CampaignsList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import DonorPage from './pages/DonorPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DonationModal from './components/DonationModal';
import { HomepageLoader } from './components/ui/LoadingComponents';
import { campaigns } from './data/dummy';
import { BloodCampaign } from './types';
import CertificatePage from './pages/CertificatePage';
import EnhancedDonorRegisterPage from './pages/EnhancedDonorRegisterPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCampaignsPage from './pages/AdminCampaignsPage';
import AdminDonorsPage from './pages/AdminDonorsPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminCertificatesPage from './pages/AdminCertificatesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';

// Homepage Component
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const handleViewDetails = (campaign: BloodCampaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDonationSubmit = (data: any) => {
    console.log('Donation submitted:', data);
    alert('Pendaftaran donasi berhasil! Kami akan menghubungi Anda segera.');
    setIsModalOpen(false);
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

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
      <Header />
      <HeroSection />
      <CampaignsList 
        campaigns={campaigns}
        onViewDetails={handleViewDetails}
        onDonate={handleDonate}
      />
      <Footer />
      
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSubmit={handleDonationSubmit}
      />
    </>
  );
};

// Campaigns Page Component
const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (campaign: BloodCampaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleDonate = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDonationSubmit = (data: any) => {
    console.log('Donation submitted:', data);
    alert('Pendaftaran donasi berhasil! Kami akan menghubungi Anda segera.');
    setIsModalOpen(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Campaign Donor Darah</h1>
            <p className="text-gray-600">Temukan campaign yang membutuhkan bantuan Anda</p>
          </div>
          <CampaignsList 
            campaigns={campaigns}
            onViewDetails={handleViewDetails}
            onDonate={handleDonate}
          />
        </div>
      </div>
      <Footer />
      
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSubmit={handleDonationSubmit}
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
    <Router>
      <div className="App relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={
            <>
              <Header />
              <CampaignDetailPage />
              <Footer />
            </>
          } />
          <Route path="/donors" element={
            <>
              <Header />
              <DonorPage />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <AboutPage />
              <Footer />
            </>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/certificates" element={
            <ProtectedRoute>
              <CertificatePage />
            </ProtectedRoute>
          } />
          <Route path="/donor-register" element={<EnhancedDonorRegisterPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/create-campaign" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateCampaignPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/campaigns" element={
            <AdminProtectedRoute>
              <AdminCampaignsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/donors" element={
            <AdminProtectedRoute>
              <AdminDonorsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <AdminProtectedRoute>
              <AdminRequestsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/certificates" element={
            <AdminProtectedRoute>
              <AdminCertificatesPage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminProtectedRoute>
              <AdminReportsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminProtectedRoute>
              <AdminSettingsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <AdminProtectedRoute>
              <AdminProfilePage />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <AdminProtectedRoute>
              <AdminNotificationsPage />
            </AdminProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
