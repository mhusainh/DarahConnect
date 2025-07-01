import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  Check, 
  X, 
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Shield,
  Wallet
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getApi } from '../services/fetchApi';
import { useNotification } from '../hooks/useNotification';

// Interface untuk User dari API
interface User {
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
  url_file: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

// Interface untuk response API
interface UsersResponse {
  meta: {
    code: number;
    message: string;
  };
  data: User[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

const AdminDonorsPage: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addNotification } = useNotification();

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getApi<any>('/admin/users');
      
      console.log('🔍 Full API Response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let usersData: User[] = [];
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          usersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response.data has nested data array
          usersData = response.data.data;
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
          usersData = [];
        }
        
        console.log('📋 Users data to set:', usersData);
        console.log('📋 Is array?', Array.isArray(usersData));
        console.log('📋 Array length:', usersData.length);
        
        setUsersList(usersData);
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Gagal memuat data pengguna: ' + (error.message || 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debug usersList changes
  useEffect(() => {
    console.log('🔄 UsersList state changed:', usersList);
    console.log('📊 UsersList length:', usersList?.length);
  }, [usersList]);

  const getBloodTypeColor = (bloodType: string) => {
    if (!bloodType) return 'bg-gray-100 text-gray-600 border-gray-200';
    
    const colors = {
      'A+': 'bg-red-100 text-red-600 border-red-200',
      'A-': 'bg-red-100 text-red-600 border-red-200',
      'B+': 'bg-blue-100 text-blue-600 border-blue-200',
      'B-': 'bg-blue-100 text-blue-600 border-blue-200',
      'AB+': 'bg-purple-100 text-purple-600 border-purple-200',
      'AB-': 'bg-purple-100 text-purple-600 border-purple-200',
      'O+': 'bg-green-100 text-green-600 border-green-200',
      'O-': 'bg-green-100 text-green-600 border-green-200',
    };
    return colors[bloodType as keyof typeof colors] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate || birthDate === "0001-01-01T07:00:00+07:00") return 0;
    
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word && word[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const filteredUsers = usersList?.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone || '').includes(searchTerm) ||
                         (user.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerified = filterVerified === 'all' || 
                           (filterVerified === 'verified' && user.is_verified) ||
                           (filterVerified === 'unverified' && !user.is_verified);
    
    const matchesBloodType = filterBloodType === 'all' || user.blood_type === filterBloodType;
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesVerified && matchesBloodType && matchesRole;
  }) || [];

  // Debug filtered users
  console.log('🎯 Filtered users:', filteredUsers);
  console.log('🎯 Filtered users length:', filteredUsers?.length);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Kelola Pengguna" subtitle="Verifikasi dan kelola data pengguna">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pengguna...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Kelola Pengguna" subtitle="Verifikasi dan kelola data pengguna">
      {/* Header with Add Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={fetchUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Refresh Data</span>
            </button>
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Mode Lihat Saja</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terverifikasi</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.filter(u => u.is_verified).length || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.filter(u => u.role === 'Administrator').length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dengan Wallet</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.filter(u => u.wallet_address).length || 0}</p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Terverifikasi</option>
                <option value="unverified">Belum Terverifikasi</option>
              </select>
              <select
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Golongan Darah</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Role</option>
                <option value="User">User</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredUsers?.length || 0} dari {usersList?.length || 0} pengguna
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers?.map((user) => {
            const userAge = calculateAge(user.birth_date);
            
            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      {user.url_file ? (
                        <img 
                          src={user.url_file} 
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {getUserInitials(user.name)}
                        </div>
                      )}
                      {user.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {user.name || 'Nama tidak tersedia'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {user.blood_type && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBloodTypeColor(user.blood_type)}`}>
                            {user.blood_type}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'Administrator' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <p className="text-xs text-gray-500 mt-1">
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.address}</span>
                      </div>
                    )}
                    {user.wallet_address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Wallet className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate font-mono text-xs">{user.wallet_address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{userAge || 'N/A'}</p>
                      <p className="text-xs text-gray-600">Tahun</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.gender || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600">Gender</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Bergabung:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(filteredUsers?.length === 0 || !filteredUsers) && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detail Pengguna</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="relative inline-block">
                      {selectedUser.url_file ? (
                        <img 
                          src={selectedUser.url_file} 
                          alt={selectedUser.name}
                          className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                          {getUserInitials(selectedUser.name)}
                        </div>
                      )}
                      {selectedUser.is_verified && (
                        <div className="absolute top-0 right-0 bg-green-500 rounded-full p-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedUser.name || 'Nama tidak tersedia'}
                    </h3>
                    <div className="flex justify-center space-x-2 mb-4">
                      {selectedUser.blood_type && (
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getBloodTypeColor(selectedUser.blood_type)}`}>
                          {selectedUser.blood_type}
                        </span>
                      )}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedUser.role === 'Administrator' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${selectedUser.is_verified ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {selectedUser.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Personal</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Telepon:</span>
                        <p className="font-medium">{selectedUser.phone || 'Tidak tersedia'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Umur:</span>
                        <p className="font-medium">{calculateAge(selectedUser.birth_date) || 'Tidak tersedia'} tahun</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <p className="font-medium">{selectedUser.gender || 'Tidak tersedia'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Alamat:</span>
                        <p className="font-medium">{selectedUser.address || 'Tidak tersedia'}</p>
                      </div>
                      {selectedUser.wallet_address && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Wallet Address:</span>
                          <p className="font-medium font-mono text-xs break-all">{selectedUser.wallet_address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bergabung:</span>
                        <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Terakhir Diupdate:</span>
                        <p className="font-medium">{new Date(selectedUser.updated_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <p className="font-medium">{selectedUser.role}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status Verifikasi:</span>
                        <p className={`font-medium ${selectedUser.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 italic">
                      Data pengguna hanya dapat dilihat, tidak dapat diedit atau dihapus
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </AdminLayout>
  );
};

export default AdminDonorsPage; 