import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnectBanner from "../components/WalletConnectBanner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Award,
  Edit3,
  Save,
  X,
  Camera,
  Droplets,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Gift,
  Wallet,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useMetaMask } from '../hooks/useMetaMask';
import MetaMaskWallet from '../components/MetaMaskWallet';
import { FadeIn, HoverScale } from '../components/ui/AnimatedComponents';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LocationPicker from '../components/LocationPicker';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import { calculateAge } from '../utils/dateUtils';
import { connectWalletAddress } from '../services/walletService';

interface UserProfile {
  id: number;
  name: string;
  gender: string;
  email: string;
  phone: string;
  blood_type: string;
  birth_date: string;
  address: string;
  role: string;
  is_verified: boolean;
  last_donation_date: string;
  donation_count: number;
  url_file: string;
  created_at: string;
  updated_at: string;
}

interface EditableProfile {
  name: string; // Read-only, not editable
  email: string; // Read-only, not editable
  phone: string;
  blood_type: string;
  address: string;
  gender: string;
  birth_date: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { isConnected, account, balance, network, disconnect } = useMetaMask();
  const { addNotification } = useNotification();
  const { data: profileData, loading, error, get, put, post } = useApi<UserProfile>();
  
  const [editedProfile, setEditedProfile] = useState<EditableProfile>({
    name: '',
    email: '',
    phone: '',
    blood_type: '',
    address: '',
    gender: '',
    birth_date: ''
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);



  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      // Fetch profile data
      get('/user/profile');
    }
  }, [navigate, get]);

  useEffect(() => {
    if (profileData && profileData.name) {
      console.log('✅ ProfilePage: Data profil berhasil dimuat:', profileData);
      setEditedProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        blood_type: profileData.blood_type || 'O+',
        address: profileData.address || '',
        gender: profileData.gender || 'Male',
        birth_date: profileData.birth_date || ''
      });


    } else {
      console.log('⏳ ProfilePage: Data profil belum tersedia:', { profileData, loading, error });
    }
  }, [profileData, loading, error]);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowImageModal(false);
    }
  }, []);

  useEffect(() => {
    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal, handleKeyDown]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      console.log('📋 EditedProfile data before FormData:', editedProfile);
      
      // Format birth_date to simple date format (YYYY-MM-DD)
      let formattedBirthDate = '';
      if (editedProfile.birth_date) {
        try {
          // Handle different date formats
          if (editedProfile.birth_date.includes('T')) {
            // Format: "2003-06-27T07:00:00+07:00"
            formattedBirthDate = editedProfile.birth_date.split('T')[0];
          } else if (editedProfile.birth_date.includes('-')) {
            // Format: "2003-06-27"
            formattedBirthDate = editedProfile.birth_date;
          } else {
            // Fallback: try to parse as date
            const date = new Date(editedProfile.birth_date);
            formattedBirthDate = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('❌ Date formatting error:', error);
          formattedBirthDate = editedProfile.birth_date.split('T')[0]; // fallback
        }
      }
      
      console.log('📅 Original birth_date:', editedProfile.birth_date);
      console.log('📅 Formatted birth_date:', formattedBirthDate);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('gender', editedProfile.gender);
      formData.append('phone', editedProfile.phone);
      formData.append('birth_date', formattedBirthDate);
      formData.append('address', editedProfile.address);

      console.log('📤 FormData entries:', Array.from(formData.entries()));
      console.log('📤 FormData object:', formData);

      const response = await put('/user/profile', formData);
      
      if (response.success) {
        setIsEditing(false);
        addNotification({
          type: 'success',
          title: 'Profil Berhasil Diperbarui',
          message: 'Data profil Anda telah berhasil disimpan'
        });
        // Refresh data after successful update
        get('/user/profile');
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      addNotification({
        type: 'error',
        title: 'Gagal Memperbarui Profil',
        message: error.message || 'Terjadi kesalahan saat menyimpan data profil'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData && profileData.name) {
      const resetData = {
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        blood_type: profileData.blood_type || 'O+',
        address: profileData.address || '',
        gender: profileData.gender || 'Male',
        birth_date: profileData.birth_date || ''
      };
      console.log('🔄 Resetting edited profile to:', resetData);
      setEditedProfile(resetData);
    }
  };

  const handleInputChange = (field: keyof EditableProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        addNotification({
          type: 'error',
          title: 'Format File Tidak Didukung',
          message: 'Harap pilih file gambar (JPG, PNG, atau GIF)'
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        addNotification({
          type: 'error',
          title: 'File Terlalu Besar',
          message: 'Ukuran file maksimal 5MB'
        });
        return;
      }

      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      console.log('📸 Selected image file:', file);

      // Auto upload immediately
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file?: File) => {
    const imageFile = file || profileImage;
    
    if (!imageFile) {
      addNotification({
        type: 'warning',
        title: 'Pilih Gambar',
        message: 'Harap pilih gambar terlebih dahulu'
      });
      return;
    }

    try {
      // Show uploading notification
      addNotification({
        type: 'info',
        title: 'Mengupload Foto...',
        message: 'Sedang mengupload foto profil Anda'
      });

      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('📤 Uploading profile image:', imageFile);
      console.log('📦 FormData contents:', Array.from(formData.entries()));
      console.log('🔍 File details:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        lastModified: imageFile.lastModified
      });

      const response = await post('/user/profile/picture', formData);

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Foto Profil Berhasil Diperbarui',
          message: 'Foto profil Anda telah berhasil diubah'
        });
        
        // Clear selected image
        setProfileImage(null);
        setProfileImagePreview('');
        
        // Refresh profile data to get updated image URL
        get('/user/profile');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      addNotification({
        type: 'error',
        title: 'Gagal Mengupload Foto',
        message: error.message || 'Terjadi kesalahan saat mengupload foto profil'
      });
      
      // Clear preview on error
      setProfileImage(null);
      setProfileImagePreview('');
    }
  };



  const getUserInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default initial
    }
    return name
      .split(' ')
      .map(word => word && word[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'from-red-500 to-red-600',
      'A-': 'from-red-600 to-red-700',
      'B+': 'from-blue-500 to-blue-600',
      'B-': 'from-blue-600 to-blue-700',
      'AB+': 'from-purple-500 to-purple-600',
      'AB-': 'from-purple-600 to-purple-700',
      'O+': 'from-green-500 to-green-600',
      'O-': 'from-green-600 to-green-700'
    };
    return colors[bloodType as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getAchievements = (donationCount: number) => {
    const achievements = [];
    if (donationCount >= 1) achievements.push('First Donation');
    if (donationCount >= 3) achievements.push('Regular Donor');
    if (donationCount >= 5) achievements.push('Life Saver');
    if (donationCount >= 10) achievements.push('Hero Donor');
    if (donationCount >= 20) achievements.push('Community Champion');
    return achievements;
  };

  const achievementIcons = {
    'First Donation': <Heart className="w-5 h-5" />,
    'Regular Donor': <Clock className="w-5 h-5" />,
    'Life Saver': <Shield className="w-5 h-5" />,
    'Hero Donor': <Award className="w-5 h-5" />,
    'Community Champion': <Gift className="w-5 h-5" />
  };

  const handleConnectWalletToBackend = async () => {
    if (!account) {
      addNotification({
        type: 'error',
        title: 'Wallet Tidak Terhubung',
        message: 'Harap hubungkan wallet MetaMask terlebih dahulu'
      });
      return;
    }

    setIsConnectingWallet(true);
    try {
      const response = await connectWalletAddress(account);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Wallet Terhubung',
          message: 'Alamat wallet berhasil dihubungkan ke akun Anda'
        });
      } else {
        throw new Error(response.message || 'Gagal menghubungkan wallet');
      }
    } catch (error: any) {
      console.error('Error connecting wallet to backend:', error);
      addNotification({
        type: 'error',
        title: 'Gagal Menghubungkan Wallet',
        message: error.message || 'Terjadi kesalahan saat menghubungkan wallet ke akun'
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat profil...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !profileData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Profil</h2>
            <p className="text-gray-600 mb-4">Terjadi kesalahan saat memuat data profil</p>
            <button
              onClick={() => get('/profil')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const userAge = profileData?.birth_date ? calculateAge(profileData.birth_date) : 0;
  const achievements = getAchievements(profileData?.donation_count || 0);

  return (
    <>
    <WalletConnectBanner />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <FadeIn direction="down">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
                <p className="text-gray-600 mt-1">Kelola informasi dan riwayat donor Anda</p>
              </div>
              
              {!isEditing ? (
                <HoverScale scale={1.05}>
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profil</span>
                  </button>
                </HoverScale>
              ) : (
                <div className="flex space-x-3">
                  <HoverScale scale={1.05}>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                  </HoverScale>
                  
                  <HoverScale scale={1.05}>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md"
                    >
                      <X className="w-4 h-4" />
                      <span>Batal</span>
                    </button>
                  </HoverScale>
                </div>
              )}
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <FadeIn direction="up" delay={0.1}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
                  <div className="flex items-start space-x-6">
                    {/* Profile Image */}
                    <div className="relative group">
                      {profileImagePreview || profileData?.url_file ? (
                                                  <img
                            src={profileImagePreview || profileData?.url_file}
                            alt="Profile"
                            onClick={() => setShowImageModal(true)}
                            className="w-24 h-24 rounded-3xl object-cover shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                          />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {getUserInitials(isEditing ? editedProfile.name : profileData?.name)}
                        </div>
                      )}
                      
                      {/* Camera Button - Only show in edit mode */}
                      {isEditing && (
                        <div className="absolute -bottom-3 -right-3">
                          <input
                            type="file"
                            id="profile-image-input"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="profile-image-input"
                            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg cursor-pointer"
                          >
                            <Camera className="w-5 h-5" />
                          </label>
                        </div>
                      )}
                      
                      {/* Loading indicator when uploading */}
                      {profileImage && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg whitespace-nowrap">
                            ⏳ Uploading...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Basic Details */}
                    <div className="flex-1 space-y-4">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Nama Lengkap
                          </label>
                          <p className="text-lg font-semibold text-gray-900">{profileData?.name || 'Loading...'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                          </label>
                          <p className="text-gray-900">{profileData?.email || 'Loading...'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Nomor Telepon
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editedProfile.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-gray-900">{profileData?.phone || 'Loading...'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Jenis Kelamin
                          </label>
                          {isEditing ? (
                            <select
                              value={editedProfile.gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            >
                              <option value="Male">Laki-laki</option>
                              <option value="Female">Perempuan</option>
                            </select>
                          ) : (
                            <p className="text-gray-900">{profileData?.gender === 'Male' ? 'Laki-laki' : profileData?.gender === 'Female' ? 'Perempuan' : 'Loading...'}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Alamat
                          </label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <LocationPicker
                                value={editedProfile.address}
                                onChange={(location) => handleInputChange('address', location)}
                                layout="horizontal"
                                required={true}
                              />
                            </div>
                          ) : (
                            <p className="text-gray-900">{profileData?.address || 'Loading...'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Medical Info Card */}
              <FadeIn direction="up" delay={0.2}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Droplets className="w-5 h-5 mr-2" />
                    Informasi Medis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Golongan Darah</label>
                      {isEditing ? (
                        <select
                          value={editedProfile.blood_type}
                          onChange={(e) => handleInputChange('blood_type', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      ) : (
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r ${getBloodTypeColor(profileData?.blood_type || 'O+')} text-white font-bold text-lg shadow-lg`}>
                          {profileData?.blood_type || 'Loading...'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usia</label>
                      <p className="text-lg font-semibold text-gray-900">{userAge} tahun</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedProfile.birth_date.split('T')[0]}
                          onChange={(e) => handleInputChange('birth_date', e.target.value + 'T07:00:00+07:00')}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">
                          {profileData?.birth_date ? new Date(profileData.birth_date).toLocaleDateString('id-ID') : 'Loading...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Verifikasi */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Verifikasi</label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl ${profileData?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-semibold`}>
                      {profileData?.is_verified ? '✅ Terverifikasi' : '⏳ Belum Terverifikasi'}
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Achievements Card */}
              {achievements.length > 0 && (
                <FadeIn direction="up" delay={0.3}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Pencapaian
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {achievements.map((achievement, index) => (
                        <HoverScale key={index} scale={1.05}>
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 text-center text-white shadow-lg">
                            <div className="flex justify-center mb-2">
                              {achievementIcons[achievement as keyof typeof achievementIcons] || <Award className="w-5 h-5" />}
                            </div>
                            <p className="text-sm font-semibold">{achievement}</p>
                          </div>
                        </HoverScale>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Crypto Wallet Card */}
              <FadeIn direction="up" delay={0.4}>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    💎 Crypto Wallet
                  </h3>
                  
                  <div className="space-y-4">
                    <MetaMaskWallet showBalance={true} />
                    
                    {isConnected && account && (
                      <div className="space-y-3 pt-4 border-t border-blue-200">
                        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                          <span className="text-sm text-gray-600">Network</span>
                          <span className="font-semibold text-gray-900 text-sm">
                            {network?.name || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                          <span className="text-sm text-gray-600">Balance</span>
                          <span className="font-semibold text-gray-900 text-sm">
                            {parseFloat(balance).toFixed(4)} ETH
                          </span>
                        </div>
                        
                        <div className="p-3 bg-white/50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Wallet Address</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(account);
                                addNotification({
                                  type: 'success',
                                  title: 'Alamat Disalin',
                                  message: 'Alamat wallet berhasil disalin ke clipboard'
                                });
                              }}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs font-mono text-gray-700 break-all bg-white/70 p-2 rounded">
                            {account}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={handleConnectWalletToBackend}
                            disabled={isConnectingWallet}
                            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>{isConnectingWallet ? 'Menghubungkan...' : 'Hubungkan ke Akun'}</span>
                          </button>
                          
                          <a
                            href={`https://etherscan.io/address/${account}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View on Etherscan</span>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {!isConnected && (
                      <div className="text-center py-6">
                        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm mb-4">
                          Connect your wallet to view crypto donation features
                        </p>
                        <p className="text-xs text-gray-500">
                          Use the banner at the top to connect your MetaMask wallet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Column - Stats & Quick Actions */}
            <div className="space-y-6">
              {/* Donation Stats */}
              <FadeIn direction="left" delay={0.1}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Statistik Donor
                  </h3>
                  
                  <div className="space-y-4">
                    {/* <div className="text-center p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white">
                      <p className="text-3xl font-bold">{profileData?.donation_count || 0}</p>
                      <p className="text-sm opacity-90">Total Donasi</p>
                    </div> */}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Bergabung Sejak</span>
                        <span className="font-semibold text-gray-900">
                          {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID') : 'Loading...'}
                        </span>
                      </div>
                      
                      {profileData?.last_donation_date && profileData.last_donation_date !== "0001-01-01T07:00:00+07:00" && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-sm text-gray-600">Donor Terakhir</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(profileData.last_donation_date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm text-green-600">Role</span>
                                                  <span className="font-semibold text-green-700">
                            {profileData?.role || 'Loading...'}
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Quick Actions */}
              <FadeIn direction="left" delay={0.2}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
                  
                  <div className="space-y-3">
                    <HoverScale scale={1.02}>
                      <button
                        onClick={() => navigate('/campaigns')}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Daftar Donor Lagi</span>
                      </button>
                    </HoverScale>
                    
                    <HoverScale scale={1.02}>
                      <button
                        onClick={() => navigate('/certificates')}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
                      >
                        <Award className="w-4 h-4" />
                        <span>Lihat Sertifikat</span>
                      </button>
                    </HoverScale>

                    <HoverScale scale={1.02}>
                      <button
                        onClick={() => navigate('/health-passport')}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Health Passport</span>
                      </button>
                    </HoverScale>
                    
                    <HoverScale scale={1.02}>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Kembali ke Dashboard</span>
                      </button>
                    </HoverScale>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (profileImagePreview || profileData?.url_file) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors shadow-xl z-10"
            >
              <X className="w-7 h-7" />
            </button>
            
            {/* Image */}
            <img
              src={profileImagePreview || profileData?.url_file}
              alt="Profile - Full Size"
              className="w-full h-full object-contain rounded-3xl shadow-2xl min-w-[500px] min-h-[500px]"
              onClick={() => setShowImageModal(false)}
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 rounded-b-3xl">
              <div className="text-white text-center">
                {/* <h3 className="text-2xl font-bold mb-2">Foto Profil</h3> */}
                <p className="text-lg opacity-90">{profileData?.name || 'Loading...'}</p>
                <p className="text-sm opacity-75 mt-3">Klik di mana saja untuk menutup</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProfilePage; 