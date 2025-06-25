import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  joinDate: string;
  totalDonations: number;
  lastDonation: string;
  nextEligible: string;
  achievements: string[];
  profileImage?: string;
  age: number;
  weight: number;
  emergencyContact: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { isConnected, account, balance, network, disconnect } = useMetaMask();
  const [profile, setProfile] = useState<UserProfile>({
    name: localStorage.getItem('userName') || 'John Doe',
    email: localStorage.getItem('userEmail') || 'john.doe@email.com',
    phone: '+62 812 3456 7890',
    bloodType: 'O+',
    location: 'Jakarta, Indonesia',
    joinDate: '2023-01-15',
    totalDonations: 8,
    lastDonation: '2024-01-15',
    nextEligible: '2024-04-15',
    achievements: ['First Donation', 'Regular Donor', 'Life Saver', '5+ Donations'],
    age: 28,
    weight: 70,
    emergencyContact: '+62 812 9876 5432'
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Here you would typically save to backend
    localStorage.setItem('userName', editedProfile.name);
    localStorage.setItem('userEmail', editedProfile.email);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const achievementIcons = {
    'First Donation': <Heart className="w-5 h-5" />,
    'Regular Donor': <Clock className="w-5 h-5" />,
    'Life Saver': <Shield className="w-5 h-5" />,
    '5+ Donations': <Star className="w-5 h-5" />,
    'Hero Donor': <Award className="w-5 h-5" />,
    'Community Champion': <Gift className="w-5 h-5" />
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
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {getUserInitials(isEditing ? editedProfile.name : profile.name)}
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
                          <Camera className="w-4 h-4" />
                        </button>
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
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedProfile.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.email}</p>
                          )}
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
                            <p className="text-gray-900">{profile.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Lokasi
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.location}</p>
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
                          value={editedProfile.bloodType}
                          onChange={(e) => handleInputChange('bloodType', e.target.value)}
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
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r ${getBloodTypeColor(profile.bloodType)} text-white font-bold text-lg shadow-lg`}>
                          {profile.bloodType}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usia</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedProfile.age}
                          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">{profile.age} tahun</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedProfile.weight}
                          onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">{profile.weight} kg</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kontak Darurat</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.emergencyContact}</p>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* Achievements Card */}
              <FadeIn direction="up" delay={0.3}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Pencapaian
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.achievements.map((achievement, index) => (
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
                                alert('Address copied to clipboard!');
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
                    <div className="text-center p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white">
                      <p className="text-3xl font-bold">{profile.totalDonations}</p>
                      <p className="text-sm opacity-90">Total Donasi</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Bergabung Sejak</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(profile.joinDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Donor Terakhir</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(profile.lastDonation).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm text-green-600">Eligible Berikutnya</span>
                        <span className="font-semibold text-green-700">
                          {new Date(profile.nextEligible).toLocaleDateString('id-ID')}
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
                        onClick={() => navigate('/donor-register')}
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
      <Footer />
    </>
  );
};

export default ProfilePage; 