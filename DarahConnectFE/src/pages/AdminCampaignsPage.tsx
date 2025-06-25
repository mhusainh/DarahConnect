import React, { useState } from 'react';
import { 
  Heart, 
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
  Users,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { campaigns } from '../data/dummy';
import { BloodCampaign } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminCampaignsPage: React.FC = () => {
  const [campaignsList, setCampaignsList] = useState<BloodCampaign[]>(campaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const filteredCampaigns = campaignsList.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = filterUrgency === 'all' || campaign.urgencyLevel === filterUrgency;
    
    const expired = isExpired(campaign.deadline);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !expired) ||
                         (filterStatus === 'expired' && expired) ||
                         (filterStatus === 'completed' && campaign.currentDonors >= campaign.targetDonors);

    return matchesSearch && matchesUrgency && matchesStatus;
  });

  const handleApproveCampaign = (id: string) => {
    setCampaignsList(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, verified: true } : campaign
    ));
  };

  const handleRejectCampaign = (id: string) => {
    // In real app, this would mark as rejected instead of deleting
    setCampaignsList(prev => prev.filter(campaign => campaign.id !== id));
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaignsList(prev => prev.filter(campaign => campaign.id !== id));
    setShowDeleteConfirm(false);
    setSelectedCampaign(null);
  };

  const handleViewDetails = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  return (
    <AdminLayout title="Kelola Campaign" subtitle="Verifikasi dan kelola campaign donor darah">
      {/* Header with Add Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Campaign</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari campaign..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="expired">Expired</option>
                <option value="completed">Tercapai</option>
              </select>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Urgensi</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredCampaigns.length} dari {campaignsList.length} campaign
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="relative">
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(campaign.urgencyLevel)}`}>
                    {campaign.urgencyLevel}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  {campaign.organizer.verified ? (
                    <span className="bg-green-100 text-green-600 px-2 py-1 text-xs font-medium rounded-full border border-green-200">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 text-xs font-medium rounded-full border border-yellow-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {campaign.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{campaign.hospital}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{new Date(campaign.deadline).toLocaleDateString('id-ID')}</span>
                    {isExpired(campaign.deadline) && (
                      <span className="ml-2 text-red-600 text-xs font-medium">EXPIRED</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{campaign.contactPhone}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress Donor</span>
                    <span className="text-sm text-gray-600">
                      {campaign.currentDonors}/{campaign.targetDonors}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(campaign.currentDonors, campaign.targetDonors)}%` }}
                    />
                  </div>
                </div>

                {/* Blood Types */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Golongan Darah:</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.bloodType.map((type) => (
                      <span key={type} className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(campaign)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Detail</span>
                  </button>
                  {!campaign.organizer.verified && (
                    <>
                      <button
                        onClick={() => handleApproveCampaign(campaign.id)}
                        className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectCampaign(campaign.id)}
                        className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setShowDeleteConfirm(true);
                    }}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada campaign ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detail Campaign</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <img 
                    src={selectedCampaign.imageUrl} 
                    alt={selectedCampaign.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedCampaign.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedCampaign.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Campaign</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rumah Sakit:</span>
                        <span className="font-medium">{selectedCampaign.hospital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lokasi:</span>
                        <span className="font-medium">{selectedCampaign.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Donor:</span>
                        <span className="font-medium">{selectedCampaign.targetDonors} orang</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donor Terkumpul:</span>
                        <span className="font-medium">{selectedCampaign.currentDonors} orang</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{new Date(selectedCampaign.deadline).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgensi:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedCampaign.urgencyLevel)}`}>
                          {selectedCampaign.urgencyLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Kontak Person</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium">{selectedCampaign.contactPerson}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telepon:</span>
                        <span className="font-medium">{selectedCampaign.contactPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Golongan Darah Dibutuhkan</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.bloodType.map((type) => (
                        <span key={type} className="bg-red-100 text-red-600 px-3 py-1 text-sm font-medium rounded-full border border-red-200">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Organizer</h4>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={selectedCampaign.organizer.avatar} 
                        alt={selectedCampaign.organizer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{selectedCampaign.organizer.name}</p>
                        <p className="text-sm text-gray-600">{selectedCampaign.organizer.role}</p>
                      </div>
                      {selectedCampaign.organizer.verified && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Campaign</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus campaign "{selectedCampaign.title}"? 
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
                onClick={() => handleDeleteCampaign(selectedCampaign.id)}
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

export default AdminCampaignsPage; 