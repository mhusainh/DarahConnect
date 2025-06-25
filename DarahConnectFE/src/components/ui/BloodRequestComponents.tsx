import React, { useState } from 'react';
import { Heart, MapPin, Clock, Phone, AlertTriangle, User, Calendar, Droplet, Share2, Filter, Search, Plus } from 'lucide-react';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: string;
  unitsNeeded: number;
  urgency: 'critical' | 'urgent' | 'normal';
  hospital: string;
  location: string;
  contactPerson: string;
  contactPhone: string;
  neededBy: string;
  description: string;
  status: 'active' | 'fulfilled' | 'expired';
  createdAt: string;
  donors: string[];
}

interface BloodRequestListProps {
  requests: BloodRequest[];
  onRespond: (requestId: string) => void;
}

export const BloodRequestList: React.FC<BloodRequestListProps> = ({ requests, onRespond }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'urgent' | 'normal'>('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.urgency === filter;
    const matchesBloodType = bloodTypeFilter === 'all' || request.bloodType === bloodTypeFilter;
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesBloodType && matchesSearch && request.status === 'active';
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Kritis';
      case 'urgent': return 'Mendesak';
      case 'normal': return 'Normal';
      default: return 'Normal';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Request Darah Darurat</h2>
            <p className="text-red-100">Bantuan segera dibutuhkan untuk menyelamatkan nyawa</p>
          </div>
          <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Buat Request</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari pasien atau rumah sakit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Semua Tingkat</option>
              <option value="critical">Kritis</option>
              <option value="urgent">Mendesak</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Semua Golongan</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className={`border-l-4 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow ${
                request.urgency === 'critical' ? 'border-l-red-500 bg-red-50' :
                request.urgency === 'urgent' ? 'border-l-orange-500 bg-orange-50' :
                'border-l-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{request.patientName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                      {getUrgencyText(request.urgency)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Droplet className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-red-600 text-lg">{request.bloodType}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{request.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span>{request.unitsNeeded} kantong dibutuhkan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{request.hospital}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Dibutuhkan: {new Date(request.neededBy).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{request.contactPerson}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <a href={`tel:${request.contactPhone}`} className="text-green-600 font-medium hover:underline">
                        {request.contactPhone}
                      </a>
                    </div>
                    {request.donors.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {request.donors.length} donor merespons
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => onRespond(request.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      request.urgency === 'critical' 
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : request.urgency === 'urgent'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Saya Bisa Donor
                  </button>
                  <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada request yang ditemukan</h3>
              <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Emergency Blood Request Form
export const EmergencyBloodRequestForm: React.FC<{
  onSubmit: (request: Omit<BloodRequest, 'id' | 'status' | 'createdAt' | 'donors'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '',
    unitsNeeded: 1,
    urgency: 'urgent' as 'critical' | 'urgent' | 'normal',
    hospital: '',
    location: '',
    contactPerson: '',
    contactPhone: '',
    neededBy: '',
    description: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Request Darah Darurat</h2>
        <p className="text-red-100">Buat permintaan donor darah untuk kebutuhan mendesak</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pasien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nama lengkap pasien"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Golongan Darah <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Pilih golongan darah</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Kantong <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.unitsNeeded}
              onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat Urgensi <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Mendesak</option>
              <option value="critical">Kritis</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rumah Sakit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nama rumah sakit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Alamat rumah sakit"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kontak <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nama person yang dapat dihubungi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dibutuhkan Sebelum <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={formData.neededBy}
            onChange={(e) => setFormData({ ...formData, neededBy: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Kondisi
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Jelaskan kondisi pasien dan alasan membutuhkan donor darah..."
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Kirim Request
          </button>
        </div>
      </form>
    </div>
  );
};

// Blood Request Stats Widget
export const BloodRequestStats: React.FC<{ requests: BloodRequest[] }> = ({ requests }) => {
  const criticalCount = requests.filter(r => r.urgency === 'critical' && r.status === 'active').length;
  const urgentCount = requests.filter(r => r.urgency === 'urgent' && r.status === 'active').length;
  const totalActive = requests.filter(r => r.status === 'active').length;
  const fulfilledToday = requests.filter(r => 
    r.status === 'fulfilled' && 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Kritis</p>
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Mendesak</p>
            <p className="text-2xl font-bold text-orange-600">{urgentCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Total Aktif</p>
            <p className="text-2xl font-bold text-blue-600">{totalActive}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Terpenuhi Hari Ini</p>
            <p className="text-2xl font-bold text-green-600">{fulfilledToday}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestList; 