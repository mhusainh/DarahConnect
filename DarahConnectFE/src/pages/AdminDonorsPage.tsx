import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Heart,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Clock,
  Award,
  Shield
} from 'lucide-react';
import { donors } from '../data/dummy';
import { Donor } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminDonorsPage: React.FC = () => {
  const [donorsList, setDonorsList] = useState<Donor[]>(donors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getBloodTypeColor = (bloodType: string) => {
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

  const getDonorLevel = (totalDonations: number) => {
    if (totalDonations >= 20) return { level: 'Champion', color: 'text-yellow-600 bg-yellow-100' };
    if (totalDonations >= 10) return { level: 'Expert', color: 'text-purple-600 bg-purple-100' };
    if (totalDonations >= 5) return { level: 'Regular', color: 'text-blue-600 bg-blue-100' };
    return { level: 'Beginner', color: 'text-green-600 bg-green-100' };
  };

  const filteredDonors = donorsList.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.phone.includes(searchTerm) ||
                         donor.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerified = filterVerified === 'all' || 
                           (filterVerified === 'verified' && donor.verified) ||
                           (filterVerified === 'unverified' && !donor.verified);
    
    const matchesBloodType = filterBloodType === 'all' || donor.bloodType === filterBloodType;
    
    const matchesAvailability = filterAvailability === 'all' ||
                              (filterAvailability === 'available' && donor.isAvailable) ||
                              (filterAvailability === 'unavailable' && !donor.isAvailable);

    return matchesSearch && matchesVerified && matchesBloodType && matchesAvailability;
  });

  const handleVerifyDonor = (id: string) => {
    setDonorsList(prev => prev.map(donor => 
      donor.id === id ? { ...donor, verified: true } : donor
    ));
  };

  const handleUnverifyDonor = (id: string) => {
    setDonorsList(prev => prev.map(donor => 
      donor.id === id ? { ...donor, verified: false } : donor
    ));
  };

  const handleToggleAvailability = (id: string) => {
    setDonorsList(prev => prev.map(donor => 
      donor.id === id ? { ...donor, isAvailable: !donor.isAvailable } : donor
    ));
  };

  const handleDeleteDonor = (id: string) => {
    setDonorsList(prev => prev.filter(donor => donor.id !== id));
    setShowDeleteConfirm(false);
    setSelectedDonor(null);
  };

  const handleViewDetails = (donor: Donor) => {
    setSelectedDonor(donor);
    setShowDetailModal(true);
  };

  const calculateNextDonationDate = (lastDonation: string) => {
    const lastDate = new Date(lastDonation);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 84); // 12 weeks
    return nextDate;
  };

  const canDonateNow = (lastDonation: string) => {
    const nextDonation = calculateNextDonationDate(lastDonation);
    return new Date() >= nextDonation;
  };

  return (
    <AdminLayout title="Kelola Donor" subtitle="Verifikasi dan kelola data donor darah">
      {/* Header with Add Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Donor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donor</p>
                <p className="text-2xl font-bold text-gray-900">{donorsList.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terverifikasi</p>
                <p className="text-2xl font-bold text-gray-900">{donorsList.filter(d => d.verified).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{donorsList.filter(d => d.isAvailable).length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{donorsList.filter(d => !d.verified).length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
                  placeholder="Cari donor..."
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
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Ketersediaan</option>
                <option value="available">Tersedia</option>
                <option value="unavailable">Tidak Tersedia</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredDonors.length} dari {donorsList.length} donor
            </div>
          </div>
        </div>

        {/* Donors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => {
            const donorLevel = getDonorLevel(donor.totalDonations);
            const canDonate = canDonateNow(donor.lastDonation);
            
            return (
              <div key={donor.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img 
                        src={donor.avatar} 
                        alt={donor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {donor.verified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {donor.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBloodTypeColor(donor.bloodType)}`}>
                          {donor.bloodType}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${donorLevel.color}`}>
                          {donorLevel.level}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ${donor.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <p className="text-xs text-gray-500 mt-1">
                        {donor.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{donor.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{donor.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{donor.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{donor.totalDonations}</p>
                      <p className="text-xs text-gray-600">Total Donasi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{donor.age}</p>
                      <p className="text-xs text-gray-600">Tahun</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Donasi Terakhir:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(donor.lastDonation).toLocaleDateString('id-ID')}
                    </p>
                    {!canDonate && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Dapat mendonor lagi: {calculateNextDonationDate(donor.lastDonation).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(donor)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Detail</span>
                    </button>
                    {!donor.verified ? (
                      <button
                        onClick={() => handleVerifyDonor(donor.id)}
                        className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Verifikasi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnverifyDonor(donor.id)}
                        className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <X className="h-4 w-4" />
                        <span>Unverify</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedDonor(donor);
                        setShowDeleteConfirm(true);
                      }}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDonors.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada donor ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detail Donor</h2>
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
                      <img 
                        src={selectedDonor.avatar} 
                        alt={selectedDonor.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                      />
                      {selectedDonor.verified && (
                        <div className="absolute top-0 right-0 bg-green-500 rounded-full p-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedDonor.name}
                    </h3>
                    <div className="flex justify-center space-x-2 mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getBloodTypeColor(selectedDonor.bloodType)}`}>
                        {selectedDonor.bloodType}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDonorLevel(selectedDonor.totalDonations).color}`}>
                        {getDonorLevel(selectedDonor.totalDonations).level}
                      </span>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDonor.isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${selectedDonor.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {selectedDonor.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Personal</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{selectedDonor.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Telepon:</span>
                        <p className="font-medium">{selectedDonor.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Umur:</span>
                        <p className="font-medium">{selectedDonor.age} tahun</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Berat Badan:</span>
                        <p className="font-medium">{selectedDonor.weight} kg</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Lokasi:</span>
                        <p className="font-medium">{selectedDonor.location}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Kontak Darurat:</span>
                        <p className="font-medium">{selectedDonor.emergencyContact}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Donasi</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Donasi:</span>
                        <p className="font-medium text-2xl text-red-600">{selectedDonor.totalDonations}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Donasi Terakhir:</span>
                        <p className="font-medium">{new Date(selectedDonor.lastDonation).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Status Donasi Berikutnya:</span>
                        <p className={`font-medium ${canDonateNow(selectedDonor.lastDonation) ? 'text-green-600' : 'text-yellow-600'}`}>
                          {canDonateNow(selectedDonor.lastDonation) ? 
                            'Dapat mendonor sekarang' : 
                            `Dapat mendonor pada ${calculateNextDonationDate(selectedDonor.lastDonation).toLocaleDateString('id-ID')}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleToggleAvailability(selectedDonor.id)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                        selectedDonor.isAvailable ? 
                        'bg-gray-100 text-gray-700 hover:bg-gray-200' : 
                        'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>{selectedDonor.isAvailable ? 'Set Tidak Tersedia' : 'Set Tersedia'}</span>
                    </button>
                    <button
                      className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Donor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Donor</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus donor "{selectedDonor.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteDonor(selectedDonor.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDonorsPage; 