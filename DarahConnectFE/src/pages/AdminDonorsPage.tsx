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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotification();

  // Fetch users from API with search and pagination
  const fetchUsers = async (page: number = 1, search: string = '', verified: string = 'all', bloodType: string = 'all', role: string = 'all') => {
    try {
      setLoading(true);
      
      // Build query parameters for server-side filtering
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString()
      });
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (verified !== 'all') {
        params.append('verified', verified === 'verified' ? 'true' : 'false');
      }
      
      if (bloodType !== 'all') {
        params.append('blood_type', bloodType);
      }
      
      if (role !== 'all') {
        params.append('role', role);
      }
      
      console.log('🔍 Users API Params:', params.toString());
      const endpoint = `/admin/users?${params.toString()}`;
      const response = await getApi<any>(endpoint);
      
      console.log('🔍 Full API Response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let usersData: User[] = [];
        let paginationData = null;
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          usersData = response.data;
          paginationData = response.pagination;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response.data has nested data array
          usersData = response.data.data;
          paginationData = response.pagination;
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
          usersData = [];
        }
        
        // Client-side filtering for now (until API supports server-side filtering)
        const filtered = usersData.filter(user => {
          if (!user) return false;
          
          const matchesSearch = !search || 
            (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (user.phone || '').includes(search) ||
            (user.address || '').toLowerCase().includes(search.toLowerCase());
          
          const matchesVerified = verified === 'all' || 
                                 (verified === 'verified' && user.is_verified) ||
                                 (verified === 'unverified' && !user.is_verified);
          
          const matchesBloodType = bloodType === 'all' || user.blood_type === bloodType;
          
          const matchesRole = role === 'all' || user.role === role;

          return matchesSearch && matchesVerified && matchesBloodType && matchesRole;
        });
        
        
        setUsersList(usersData);
        setTotalItems(paginationData.total_items);
        setTotalPages(paginationData.total_pages);
        setCurrentPage(page);
        
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

  // Initial data fetch
  useEffect(() => {
    fetchUsers(currentPage, searchTerm, filterVerified, filterBloodType, filterRole);
  }, [currentPage, filterVerified, filterBloodType, filterRole]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm, filterVerified, filterBloodType, filterRole);
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

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

  // Use server-side filtered data directly
  const filteredUsers = usersList || [];

  // Handler functions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleVerifiedFilter = (verified: string) => {
    setFilterVerified(verified);
    setCurrentPage(1);
  };

  const handleBloodTypeFilter = (bloodType: string) => {
    setFilterBloodType(bloodType);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

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
              onClick={() => fetchUsers(currentPage, searchTerm, filterVerified, filterBloodType, filterRole)}
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
                <p className="text-sm font-medium text-gray-600">
                  {searchTerm || filterVerified !== 'all' || filterBloodType !== 'all' || filterRole !== 'all' 
                    ? 'Hasil Filter' : 'Total Pengguna'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                {(searchTerm || filterVerified !== 'all' || filterBloodType !== 'all' || filterRole !== 'all') && (
                  <p className="text-xs text-gray-500">halaman ini</p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terverifikasi</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.filter(u => u.is_verified).length || 0}</p>
                <p className="text-xs text-gray-500">halaman ini</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.filter(u => u.role === 'Administrator').length || 0}</p>
                <p className="text-xs text-gray-500">halaman ini</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dengan Wallet</p>
                <p className="text-2xl font-bold text-gray-900">{usersList?.filter(u => u.wallet_address).length || 0}</p>
                <p className="text-xs text-gray-500">halaman ini</p>
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                />
                {!loading && searchTerm && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <select
                value={filterVerified}
                onChange={(e) => handleVerifiedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Terverifikasi</option>
                <option value="unverified">Belum Terverifikasi</option>
              </select>
              <select
                value={filterBloodType}
                onChange={(e) => handleBloodTypeFilter(e.target.value)}
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
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Role</option>
                <option value="User">User</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {searchTerm || filterVerified !== 'all' || filterBloodType !== 'all' || filterRole !== 'all' ? (
                <>
                  Menampilkan {filteredUsers.length} hasil dari {totalItems} total pengguna
                </>
              ) : (
                <>
                  Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalItems)} dari {totalItems} pengguna
                </>
              )}
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
            <p className="text-gray-600">
              {searchTerm || filterVerified !== 'all' || filterBloodType !== 'all' || filterRole !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Belum ada pengguna yang tersedia'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="mt-8 bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan{' '}
                  <span className="font-medium">
                    {((currentPage - 1) * perPage) + 1}
                  </span>{' '}
                  sampai{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * perPage, totalItems)}
                  </span>{' '}
                  dari{' '}
                  <span className="font-medium">{totalItems}</span> total pengguna
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {(() => {
                    const pages = [];
                    const maxPages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                    let endPage = Math.min(totalPages, startPage + maxPages - 1);
                    
                    if (endPage - startPage + 1 < maxPages) {
                      startPage = Math.max(1, endPage - maxPages + 1);
                    }
                    
                    // Add first page if not in range
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Add page numbers in range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                              ? 'z-10 bg-red-50 border-red-500 text-red-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Add last page if not in range
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
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