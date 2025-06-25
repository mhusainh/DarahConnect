import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, MapPinIcon, HeartIcon, CalendarIcon, CheckCircleIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { donors } from '../data/dummy';
import { Donor, BloodType } from '../types';

const DonorPage: React.FC = () => {
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>(donors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const locations = Array.from(new Set(donors.map(donor => donor.location)));

  useEffect(() => {
    let filtered = donors;

    // Filter by search term (name, email, location)
    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by blood type
    if (selectedBloodType) {
      filtered = filtered.filter(donor => donor.bloodType === selectedBloodType);
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(donor => donor.location === selectedLocation);
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(donor => 
        availabilityFilter === 'available' ? donor.isAvailable : !donor.isAvailable
      );
    }

    setFilteredDonors(filtered);
  }, [searchTerm, selectedBloodType, selectedLocation, availabilityFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBloodType('');
    setSelectedLocation('');
    setAvailabilityFilter('all');
  };

  const getAvailabilityStatus = (donor: Donor) => {
    if (!donor.isAvailable) {
      return { text: 'Tidak Tersedia', color: 'bg-red-100 text-red-800', icon: '🚫' };
    }
    
    const lastDonationDate = new Date(donor.lastDonation);
    const monthsAgo = Math.floor((Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsAgo >= 3) {
      return { text: 'Siap Donor', color: 'bg-green-100 text-green-800', icon: '✅' };
    } else {
      return { text: 'Belum Bisa Donor', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Komunitas Donor Darah</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan donor darah di sekitar Anda. Bergabunglah dengan komunitas hero penyelamat nyawa.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari donor berdasarkan nama, email, atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Blood Type Filter */}
            <div>
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value as BloodType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Semua Golongan Darah</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Semua Lokasi</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="available">Tersedia</option>
                <option value="unavailable">Tidak Tersedia</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredDonors.length} dari {donors.length} donor
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <HeartIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donor</p>
                <p className="text-2xl font-bold text-gray-900">{donors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Siap Donor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {donors.filter(d => d.isAvailable).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kota Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {donors.reduce((sum, d) => sum + d.totalDonations, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Donor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => {
            const status = getAvailabilityStatus(donor);
            return (
              <div key={donor.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={donor.avatar}
                      alt={donor.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                        {donor.verified && (
                          <CheckCircleIcon className="w-4 h-4 text-blue-500 ml-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{donor.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.icon} {status.text}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Golongan Darah:</span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium">
                      {donor.bloodType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Donasi:</span>
                    <span className="font-medium text-gray-900">{donor.totalDonations}x</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Donasi Terakhir:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(donor.lastDonation).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{donor.location}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    Hubungi
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center">
                    <MailIcon className="w-4 h-4 mr-1" />
                    Email
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDonors.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <SearchIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada donor ditemukan</h3>
              <p className="mt-2 text-gray-500">
                Coba ubah filter pencarian atau kata kunci yang berbeda.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ingin Bergabung Sebagai Donor?
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Menjadi donor darah adalah salah satu cara terbaik untuk membantu sesama. 
            Satu kantong darah Anda dapat menyelamatkan hingga 3 nyawa.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Daftar Sebagai Donor
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorPage; 