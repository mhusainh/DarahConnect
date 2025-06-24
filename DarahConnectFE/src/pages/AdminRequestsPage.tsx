import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  Heart,
  Building,
  MessageSquare
} from 'lucide-react';
import { donationRequests, campaigns, donors } from '../data/dummy';
import { DonationRequest, BloodCampaign, Donor } from '../types';
import AdminLayout from '../components/AdminLayout';

const AdminRequestsPage: React.FC = () => {
  const [requestsList, setRequestsList] = useState<DonationRequest[]>(donationRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'approved': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'approved': return Check;
      case 'pending': return Clock;
      case 'rejected': return X;
      default: return Clock;
    }
  };

  const getDonorByRequest = (request: DonationRequest): Donor | undefined => {
    return donors.find(donor => donor.id === request.donorId);
  };

  const getCampaignByRequest = (request: DonationRequest): BloodCampaign | undefined => {
    return campaigns.find(campaign => campaign.id === request.campaignId);
  };

  const filteredRequests = requestsList.filter(request => {
    const donor = getDonorByRequest(request);
    const campaign = getCampaignByRequest(request);
    
    const matchesSearch = donor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign?.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    const requestDate = new Date(request.requestedDate);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const matchesDate = filterDate === 'all' ||
                       (filterDate === 'today' && requestDate.toDateString() === today.toDateString()) ||
                       (filterDate === 'week' && requestDate >= weekAgo) ||
                       (filterDate === 'month' && requestDate >= monthAgo);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleApproveRequest = (id: string) => {
    setRequestsList(prev => prev.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
  };

  const handleRejectRequest = (id: string) => {
    setRequestsList(prev => prev.map(request => 
      request.id === id ? { ...request, status: 'rejected' } : request
    ));
  };

  const handleCompleteRequest = (id: string) => {
    setRequestsList(prev => prev.map(request => 
      request.id === id ? { 
        ...request, 
        status: 'completed',
        completedDate: new Date().toISOString().split('T')[0]
      } : request
    ));
  };

  const handleAddNotes = (id: string, newNotes: string) => {
    setRequestsList(prev => prev.map(request => 
      request.id === id ? { ...request, notes: newNotes } : request
    ));
    setShowNotesModal(false);
    setNotes('');
    setSelectedRequest(null);
  };

  const handleViewDetails = (request: DonationRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleOpenNotesModal = (request: DonationRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
    setShowNotesModal(true);
  };

  const getStatusStats = () => {
    return {
      total: requestsList.length,
      pending: requestsList.filter(r => r.status === 'pending').length,
      approved: requestsList.filter(r => r.status === 'approved').length,
      completed: requestsList.filter(r => r.status === 'completed').length,
      rejected: requestsList.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  return (
    <AdminLayout title="Kelola Permintaan Donasi" subtitle="Review dan proses permintaan donasi darah">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permintaan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-500" />
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
                  placeholder="Cari donor atau campaign..."
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
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredRequests.length} dari {requestsList.length} permintaan
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor & Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Permintaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const donor = getDonorByRequest(request);
                  const campaign = getCampaignByRequest(request);
                  const StatusIcon = getStatusIcon(request.status);
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={donor?.avatar || '/api/placeholder/40/40'} 
                            alt={donor?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {donor?.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {campaign?.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                                {donor?.bloodType}
                              </span>
                              <span className="text-xs text-gray-500">
                                {campaign?.hospital}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.requestedDate).toLocaleDateString('id-ID')}
                        </div>
                        {request.completedDate && (
                          <div className="text-xs text-gray-500">
                            Selesai: {new Date(request.completedDate).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.notes ? (
                            <span className="truncate max-w-xs block">{request.notes}</span>
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada catatan</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Detail</span>
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Setuju</span>
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors flex items-center space-x-1"
                              >
                                <X className="h-3 w-3" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <button
                              onClick={() => handleCompleteRequest(request.id)}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Selesai</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleOpenNotesModal(request)}
                            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors flex items-center space-x-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Catatan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada permintaan ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detail Permintaan Donasi</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(() => {
                const donor = getDonorByRequest(selectedRequest);
                const campaign = getCampaignByRequest(selectedRequest);
                const StatusIcon = getStatusIcon(selectedRequest.status);
                
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Donor</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-4 mb-4">
                          <img 
                            src={donor?.avatar || '/api/placeholder/60/60'} 
                            alt={donor?.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{donor?.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                                {donor?.bloodType}
                              </span>
                              {donor?.verified && (
                                <span className="bg-green-100 text-green-600 px-2 py-1 text-xs font-medium rounded border border-green-200">
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{donor?.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{donor?.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{donor?.location}</span>
                          </div>
                          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Total Donasi</p>
                              <p className="font-semibold">{donor?.totalDonations}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Donasi Terakhir</p>
                              <p className="font-semibold">{donor ? new Date(donor.lastDonation).toLocaleDateString('id-ID') : '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Campaign</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <img 
                          src={campaign?.imageUrl || '/api/placeholder/300/150'} 
                          alt={campaign?.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{campaign?.title}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{campaign?.hospital}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{campaign?.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{campaign?.contactPhone}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{campaign?.contactPerson}</span>
                          </div>
                          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Progress</p>
                              <p className="font-semibold">{campaign?.currentDonors}/{campaign?.targetDonors}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Deadline</p>
                              <p className="font-semibold">{campaign ? new Date(campaign.deadline).toLocaleDateString('id-ID') : '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Permintaan</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRequest.status)}`}>
                              <StatusIcon className="h-4 w-4 mr-2" />
                              {selectedRequest.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              Tanggal Permintaan: {new Date(selectedRequest.requestedDate).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        
                        {selectedRequest.completedDate && (
                          <p className="text-sm text-gray-600 mb-2">
                            Tanggal Selesai: {new Date(selectedRequest.completedDate).toLocaleDateString('id-ID')}
                          </p>
                        )}
                        
                        {selectedRequest.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Catatan:</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                              {selectedRequest.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tambah/Edit Catatan</h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan untuk permintaan donasi ini:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Masukkan catatan..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddNotes(selectedRequest.id, notes)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRequestsPage; 