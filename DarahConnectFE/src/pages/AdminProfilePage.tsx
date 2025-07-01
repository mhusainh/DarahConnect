import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity,
  Edit,
  Save,
  Camera,
  Key,
  Clock,
  Settings,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminProfileCard from '../components/AdminProfileCard';

const AdminProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [adminData, setAdminData] = useState({
    name: 'Admin Utama',
    email: 'admin@darahconnect.com',
    phone: '+62 812-3456-7890',
    position: 'Super Administrator',
    department: 'IT & Operations',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    avatar: '/api/placeholder/150/150',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan',
    bio: 'Bertanggung jawab mengelola platform DarahConnect dan memastikan operasional sistem berjalan dengan baik.'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const activityLogs = [
    {
      id: 1,
      action: 'Approved Certificate',
      details: 'Menyetujui sertifikat CERT-2024-001 untuk Ahmad Suryadi',
      timestamp: '2024-01-20T10:15:00Z',
      type: 'approval'
    },
    {
      id: 2,
      action: 'Updated Settings',
      details: 'Mengubah pengaturan notifikasi sistem',
      timestamp: '2024-01-20T09:45:00Z',
      type: 'settings'
    },
    {
      id: 3,
      action: 'Created Campaign',
      details: 'Membuat campaign baru "Donor Darah Ramadan 2024"',
      timestamp: '2024-01-20T09:30:00Z',
      type: 'campaign'
    },
    {
      id: 4,
      action: 'User Management',
      details: 'Menambahkan admin baru: Siti Nurhaliza',
      timestamp: '2024-01-19T16:20:00Z',
      type: 'user'
    },
    {
      id: 5,
      action: 'System Backup',
      details: 'Melakukan backup database sistem',
      timestamp: '2024-01-19T14:00:00Z',
      type: 'system'
    }
  ];

  const adminStats = {
    certificatesApproved: 1250,
    campaignsManaged: 89,
    usersManaged: 450,
    systemUptime: '99.9%'
  };

  const handleSave = () => {
    // Simulate API call
    setIsEditing(false);
    alert('Profil berhasil diperbarui!');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak sama!');
      return;
    }
    // Simulate API call
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password berhasil diubah!');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return <Award className="w-4 h-4 text-green-600" />;
      case 'settings': return <Settings className="w-4 h-4 text-blue-600" />;
      case 'campaign': return <Activity className="w-4 h-4 text-purple-600" />;
      case 'user': return <User className="w-4 h-4 text-orange-600" />;
      case 'system': return <Shield className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-green-100 border-green-200';
      case 'settings': return 'bg-blue-100 border-blue-200';
      case 'campaign': return 'bg-purple-100 border-purple-200';
      case 'user': return 'bg-orange-100 border-orange-200';
      case 'system': return 'bg-gray-100 border-gray-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const renderProfile = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={adminData.avatar}
                alt={adminData.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="text-white">
              <h1 className="text-3xl font-bold">{adminData.name}</h1>
              <p className="text-red-100 text-lg">{adminData.position}</p>
              <p className="text-red-200 text-sm">{adminData.department}</p>
              <div className="flex items-center mt-2 text-red-100 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Bergabung sejak {new Date(adminData.joinDate).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{adminStats.certificatesApproved}</div>
              <div className="text-sm text-gray-600">Sertifikat Disetujui</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{adminStats.campaignsManaged}</div>
              <div className="text-sm text-gray-600">Campaign Dikelola</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{adminStats.usersManaged}</div>
              <div className="text-sm text-gray-600">User Dikelola</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{adminStats.systemUptime}</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Profil</h3>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              <span>{isEditing ? 'Simpan' : 'Edit Profil'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              {isEditing ? (
                <input
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900">{adminData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900">{adminData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={adminData.phone}
                  onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900">{adminData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posisi</label>
              {isEditing ? (
                <input
                  type="text"
                  value={adminData.position}
                  onChange={(e) => setAdminData({...adminData, position: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900">{adminData.position}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              {isEditing ? (
                <input
                  type="text"
                  value={adminData.address}
                  onChange={(e) => setAdminData({...adminData, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900">{adminData.address}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={adminData.bio}
                  onChange={(e) => setAdminData({...adminData, bio: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900">{adminData.bio}</p>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Keamanan Akun</h4>
                <p className="text-sm text-gray-600">Kelola password dan pengaturan keamanan</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Ubah Password</span>
              </button>
            </div>

            {showPasswordForm && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handlePasswordChange}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Ubah Password
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Profil Admin" subtitle="Kelola informasi profil dan aktivitas">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex mb-6">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold text-sm focus:outline-none bg-red-600 text-white`}
            disabled
          >
            Profil
          </button>
        </div>
        <AdminProfileCard />
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage; 