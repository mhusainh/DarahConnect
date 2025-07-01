import React, { useState, useEffect } from 'react';
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
import { BloodRequest, AdminBloodRequestResponse } from '../types/index';
import { adminBloodRequestsApi } from '../services/fetchApi';
import AdminLayout from '../components/AdminLayout';

const AdminRequestsPage: React.FC = () => {
  const [requestsList, setRequestsList] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch blood requests from API
  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminBloodRequestsApi.getBloodRequests();
        
        if (response.success && response.data) {
          // Handle both direct array and nested response structure
          let requestsData: BloodRequest[] = [];
          
          if (Array.isArray(response.data)) {
            requestsData = response.data as BloodRequest[];
          } else if (response.data.data && Array.isArray(response.data.data)) {
            requestsData = response.data.data as BloodRequest[];
          }
          
          setRequestsList(requestsData);
        } else {
          setError(response.error || 'Failed to fetch blood requests');
          setRequestsList([]);
        }
      } catch (err) {
        setError('Failed to fetch blood requests');
        setRequestsList([]);
        console.error('Error fetching blood requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBloodRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'verified': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'verified': return Check;
      case 'pending': return Clock;
      case 'rejected': return X;
      default: return Clock;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const filteredRequests = (requestsList || []).filter(request => {
    // Safety check - ensure request has all required properties
    if (!request || !request.user || !request.hospital || !request.patient_name) {
      return false;
    }
    
    const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    const requestDate = new Date(request.created_at);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const matchesDate = filterDate === 'all' ||
                       (filterDate === 'today' && requestDate.toDateString() === today.toDateString()) ||
                       (filterDate === 'week' && requestDate >= weekAgo) ||
                       (filterDate === 'month' && requestDate >= monthAgo);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleApproveRequest = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'verified');
      if (response.success) {
        setRequestsList(prev => prev.map(request => 
          request.id === id ? { ...request, status: 'verified' as const } : request
        ));
      } else {
        setError(response.error || 'Failed to approve request');
      }
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'rejected');
      if (response.success) {
        setRequestsList(prev => prev.map(request => 
          request.id === id ? { ...request, status: 'rejected' as const } : request
        ));
      } else {
        setError(response.error || 'Failed to reject request');
      }
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  const handleCompleteRequest = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'completed');
      if (response.success) {
        setRequestsList(prev => prev.map(request => 
          request.id === id ? { ...request, status: 'completed' as const } : request
        ));
      } else {
        setError(response.error || 'Failed to complete request');
      }
    } catch (err) {
      setError('Failed to complete request');
      console.error('Error completing request:', err);
    }
  };

  const handleAddNotes = (id: number, newNotes: string) => {
    // For now, this would just update local state
    // In a real app, you'd probably want an API endpoint for notes
    setRequestsList(prev => prev.map(request => 
      request.id === id ? { ...request, diagnosis: newNotes } : request
    ));
    setShowNotesModal(false);
    setNotes('');
    setSelectedRequest(null);
  };

  const handleViewDetails = (request: BloodRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleOpenNotesModal = (request: BloodRequest) => {
    setSelectedRequest(request);
    setNotes(request.diagnosis || '');
    setShowNotesModal(true);
  };

  const getStatusStats = () => {
    const list = requestsList || [];
    return {
      total: list.length,
      pending: list.filter(r => r.status === 'pending').length,
      approved: list.filter(r => r.status === 'verified').length,
      completed: list.filter(r => r.status === 'completed').length,
      rejected: list.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <AdminLayout title="Kelola Permintaan Donasi" subtitle="Review dan proses permintaan donasi darah">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Loading blood requests...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Kelola Permintaan Donasi" subtitle="Review dan proses permintaan donasi darah">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
                  placeholder="Cari user, pasien, atau rumah sakit..."
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
                <option value="verified">Disetujui</option>
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
              Menampilkan {filteredRequests.length} dari {requestsList?.length || 0} permintaan
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
                  const StatusIcon = getStatusIcon(request.status);
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={request.user.url_file || '/api/placeholder/40/40'} 
                            alt={request.user.name}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {request.user.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {request.patient_name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                                {request.blood_type}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getUrgencyColor(request.urgency_level)}`}>
                                {request.urgency_level}
                              </span>
                              <span className="text-xs text-gray-500">
                                {request.hospital.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.created_at).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Event: {new Date(request.event_date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.diagnosis ? (
                            <span className="truncate max-w-xs block">{request.diagnosis}</span>
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
                          
                          {request.status === 'verified' && (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi User</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={selectedRequest.user.url_file || '/api/placeholder/60/60'} 
                        alt={selectedRequest.user.name}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{selectedRequest.user.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                            {selectedRequest.user.blood_type}
                          </span>
                          {selectedRequest.user.is_verified && (
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
                        <span>{selectedRequest.user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedRequest.user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedRequest.user.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Permintaan</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedRequest.url_file && (
                      <img 
                        src={selectedRequest.url_file} 
                        alt="Blood request"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedRequest.patient_name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Golongan Darah:</span>
                        <span className="font-medium">{selectedRequest.blood_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedRequest.quantity} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgensi:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getUrgencyColor(selectedRequest.urgency_level)}`}>
                          {selectedRequest.urgency_level}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedRequest.hospital.name}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{selectedRequest.hospital.address}</span>
                      </div>
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Tanggal Event</p>
                          <p className="font-semibold">{new Date(selectedRequest.event_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Slot Tersedia</p>
                          <p className="font-semibold">{selectedRequest.slots_available}</p>
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
                          <span className="h-4 w-4 mr-2" />
                          {selectedRequest.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          Tanggal Permintaan: {new Date(selectedRequest.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                    
                    {selectedRequest.diagnosis && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Diagnosis/Catatan:</h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {selectedRequest.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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