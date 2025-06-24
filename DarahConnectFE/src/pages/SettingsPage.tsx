import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Lock,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { FadeIn, HoverScale } from '../components/ui/AnimatedComponents';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface SettingsState {
  security: {
    sessionTimeout: number;
  };
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('security');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [settings, setSettings] = useState<SettingsState>({
    security: {
      sessionTimeout: 30,
    },
  });

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  const handleSettingChange = (category: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setSaveStatus('saved');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000);
  };

  const exportData = () => {
    const userData = {
      profile: {
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
      },
      settings: settings,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'darahconnect-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    // This would typically involve API calls to delete user data
    localStorage.clear();
    navigate('/');
  };

  const tabs = [
    { id: 'security', label: 'Keamanan', icon: Lock },
    { id: 'account', label: 'Akun', icon: AlertTriangle },
  ];

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sesi & Kata Sandi</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeout Sesi (menit)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 menit</option>
              <option value={30}>30 menit</option>
              <option value={60}>1 jam</option>
              <option value={120}>2 jam</option>
            </select>
          </div>

          <HoverScale scale={1.02}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5" />
                <span className="font-medium">Ubah Kata Sandi</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </HoverScale>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Informasi Penting</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Tindakan di bagian ini bersifat permanen dan tidak dapat dibatalkan. 
              Harap berhati-hati sebelum melanjutkan.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privasi</h3>
        <div className="space-y-3">
          <HoverScale scale={1.02}>
            <button
              onClick={exportData}
              className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Ekspor Data</p>
                  <p className="text-sm text-green-600">Unduh semua data akun Anda</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </HoverScale>

          <HoverScale scale={1.02}>
            <button
              onClick={() => {}}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Impor Data</p>
                  <p className="text-sm text-blue-600">Impor data dari file backup</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </HoverScale>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-red-900 mb-4">Zona Bahaya</h3>
        <div className="space-y-3">
          <HoverScale scale={1.02}>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Hapus Akun</p>
                  <p className="text-sm text-red-600">Hapus akun dan semua data secara permanen</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </HoverScale>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return renderSecuritySettings();
      case 'account':
        return renderAccountSettings();
      default:
        return renderSecuritySettings();
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <FadeIn direction="down">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
                <p className="text-gray-600 mt-1">Kelola pengaturan keamanan dan akun Anda</p>
              </div>
              
              <HoverScale scale={1.05}>
                <button
                  onClick={saveSettings}
                  disabled={saveStatus === 'saving'}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                    saveStatus === 'saved' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                      : saveStatus === 'saving'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersimpan</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      <span>Simpan Pengaturan</span>
                    </>
                  )}
                </button>
              </HoverScale>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <FadeIn direction="right" delay={0.1}>
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200/50 sticky top-8">
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <HoverScale key={tab.id} scale={1.02}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <tab.icon className="w-5 h-5" />
                          <span>{tab.label}</span>
                        </button>
                      </HoverScale>
                    ))}
                  </nav>
                </div>
              </div>
            </FadeIn>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <FadeIn direction="up" delay={0.2}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
                  {renderTabContent()}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <FadeIn>
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Hapus Akun</h3>
                    <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun? Semua data termasuk riwayat donasi, 
                  pencapaian, dan informasi pribadi akan dihapus secara permanen.
                </p>
                
                <div className="flex space-x-3 mb-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-200/50"
                  >
                    Ya, Hapus Akun
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-white/90 border border-gray-300 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <FadeIn>
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Ubah Kata Sandi</h3>
                    <p className="text-sm text-gray-600">Masukkan kata sandi baru</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Masukkan kata sandi saat ini"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Masukkan kata sandi baru"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Konfirmasi kata sandi baru"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
                  >
                    Ubah Kata Sandi
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-white/90 border border-gray-300 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SettingsPage; 