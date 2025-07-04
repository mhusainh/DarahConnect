  import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  User
} from 'lucide-react';
import { BloodCampaign, AdminBloodRequestResponse } from '../types/index';
import { adminBloodRequestsApi } from '../services/fetchApi';
import AdminLayout from '../components/AdminLayout';

const AdminCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaignsList, setCampaignsList] = useState<BloodCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<BloodCampaign | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch campaigns from API with search and pagination
  const fetchCampaigns = async (page: number = 1, search: string = '', status: string = 'all', urgency: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for server-side filtering
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString()
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (status !== 'all') {
        params.append('status', status);
      }
      
      if (urgency !== 'all') {
        params.append('urgency', urgency);
      }      
      const response = await adminBloodRequestsApi.getCampaigns(page, perPage);
      
      if (response.success && response.data) {
        // Handle both direct array and nested response structure
        let campaignsData: BloodCampaign[] = [];
        let paginationData = null;
        
        if (Array.isArray(response.data)) {
          campaignsData = response.data as BloodCampaign[];
          paginationData = response.pagination;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          campaignsData = response.data.data as BloodCampaign[];
          paginationData = response.data.pagination;
        }
        
        // Client-side filtering for now (until API supports server-side filtering)
        const filtered = campaignsData.filter(campaign => {
          if (!campaign || !campaign.event_name) return false;
          
          const matchesSearch = !search || 
            campaign.event_name.toLowerCase().includes(search.toLowerCase()) ||
            campaign.hospital?.name.toLowerCase().includes(search.toLowerCase()) ||
            campaign.user?.name.toLowerCase().includes(search.toLowerCase());
          
          const matchesUrgency = urgency === 'all' || campaign.urgency_level === urgency;
          
          const expired = new Date(campaign.event_date) < new Date();
          const matchesStatus = status === 'all' || 
                               (status === 'active' && !expired && campaign.status !== 'completed') ||
                               (status === 'expired' && expired) ||
                               (status === 'completed' && campaign.status === 'completed') ||
                               (status === 'pending' && campaign.status === 'pending') ||
                               (status === 'verified' && campaign.status === 'verified');

          return matchesSearch && matchesUrgency && matchesStatus;
        });
        
        // Client-side pagination
        // const startIndex = (page - 1) * perPage;
        // const endIndex = startIndex + perPage;
        // const paginatedData = filtered.slice(startIndex, endIndex);
        // setCampaignsList(paginatedData);
        // setTotalItems(filtered.length);
        // setTotalPages(Math.ceil(filtered.length / perPage));
        // setCurrentPage(page);
        setCampaignsList(campaignsData);
        setTotalItems(paginationData.total_items);
        setTotalPages(paginationData.total_pages);
        setCurrentPage(page);
        
        console.log("campaignsData", campaignsData);
        console.log("paginationData", paginationData);
        console.log("currentPage", currentPage);
        
      } else {
        setError(response.error || 'Failed to fetch campaigns');
        setCampaignsList([]);
      }
    } catch (err) {
      setError('Failed to fetch campaigns');
      setCampaignsList([]);
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCampaigns(currentPage, searchTerm, filterStatus, filterUrgency);
  }, [currentPage, filterStatus, filterUrgency]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchCampaigns(1, searchTerm, filterStatus, filterUrgency);
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  // Use server-side filtered data directly
  const filteredCampaigns = campaignsList || [];

  // Handler functions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleUrgencyFilter = (urgency: string) => {
    setFilterUrgency(urgency);
    setCurrentPage(1);
  };

  const handleApproveCampaign = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'verified');
      if (response.success) {
        setCampaignsList(prev => prev.map(campaign => 
          campaign.id === id ? { ...campaign, status: 'verified' as const } : campaign
        ));
      } else {
        setError(response.error || 'Failed to approve campaign');
      }
    } catch (err) {
      setError('Failed to approve campaign');
      console.error('Error approving campaign:', err);
    }
  };

  const handleRejectCampaign = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.updateStatus(id, 'rejected');
      if (response.success) {
        setCampaignsList(prev => prev.map(campaign => 
          campaign.id === id ? { ...campaign, status: 'rejected' as const } : campaign
        ));
      } else {
        setError(response.error || 'Failed to reject campaign');
      }
    } catch (err) {
      setError('Failed to reject campaign');
      console.error('Error rejecting campaign:', err);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    try {
      const response = await adminBloodRequestsApi.delete(id);
      if (response.success) {
        setCampaignsList(prev => prev.filter(campaign => campaign.id !== id));
        setShowDeleteConfirm(false);
        setSelectedCampaign(null);
      } else {
        setError(response.error || 'Failed to delete campaign');
      }
    } catch (err) {
      setError('Failed to delete campaign');
      console.error('Error deleting campaign:', err);
    }
  };

  const handleViewDetails = (campaign: BloodCampaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Kelola Campaign" subtitle="Verifikasi dan kelola campaign donor darah">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Loading campaigns...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Kelola Campaign" subtitle="Verifikasi dan kelola campaign donor darah">
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
    <AdminLayout title="Kelola Campaign" subtitle="Verifikasi dan kelola campaign donor darah">
      {/* Header with Add Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-4">
            <button 
              onClick={handleCreateCampaign}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
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
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={filterUrgency}
                onChange={(e) => handleUrgencyFilter(e.target.value)}
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
              {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all' ? (
                <>
                  Menampilkan {filteredCampaigns.length} hasil dari {totalItems} total campaign
                </>
              ) : (
                <>
                  Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalItems)} dari {totalItems} campaign
                </>
              )}
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="relative">
                {campaign.url_file ? (
                  <img 
                    src={campaign.url_file} 
                    alt={campaign.event_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-100">
                    <Heart className="h-12 w-12 text-red-400 mb-2" />
                    <span className="text-gray-500 font-semibold">Campaign Donor Darah</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(campaign.urgency_level)}`}>
                    {campaign.urgency_level}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {campaign.event_name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{campaign.hospital.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{new Date(campaign.event_date).toLocaleDateString('id-ID')}</span>
                    {isExpired(campaign.event_date) && (
                      <span className="ml-2 text-red-600 text-xs font-medium">EXPIRED</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{campaign.user.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{campaign.user.name}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress Slot</span>
                    <span className="text-sm text-gray-600">
                      {campaign.slots_booked}/{campaign.slots_available}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(campaign.slots_booked, campaign.slots_available)}%` }}
                    />
                  </div>
                </div>

                {/* Blood Type and Quantity */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Golongan Darah:</span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 text-xs font-medium rounded border border-red-200">
                      {campaign.blood_type}
                    </span>
                  </div>
                  {campaign.quantity > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <span className="text-sm text-gray-600">{campaign.quantity} unit</span>
                    </div>
                  )}
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
                  {campaign.status === 'pending' && (
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

        {filteredCampaigns.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada campaign ditemukan</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Belum ada campaign yang tersedia'
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
        {filteredCampaigns.length > 0 && (
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
                  <span className="font-medium">{totalItems}</span> total campaign
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
                    src={selectedCampaign.url_file || '/api/placeholder/400/300'} 
                    alt={selectedCampaign.event_name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedCampaign.event_name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedCampaign.diagnosis}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Campaign</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rumah Sakit:</span>
                        <span className="font-medium">{selectedCampaign.hospital.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alamat:</span>
                        <span className="font-medium">{selectedCampaign.hospital.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kota:</span>
                        <span className="font-medium">{selectedCampaign.hospital.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Slot Tersedia:</span>
                        <span className="font-medium">{selectedCampaign.slots_available} slot</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Slot Terboking:</span>
                        <span className="font-medium">{selectedCampaign.slots_booked} slot</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Event:</span>
                        <span className="font-medium">{new Date(selectedCampaign.event_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgensi:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedCampaign.urgency_level)}`}>
                          {selectedCampaign.urgency_level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCampaign.status)}`}>
                          {selectedCampaign.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Kontak Person</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium">{selectedCampaign.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedCampaign.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telepon:</span>
                        <span className="font-medium">{selectedCampaign.user.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Golongan Darah Dibutuhkan</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-red-100 text-red-600 px-3 py-1 text-sm font-medium rounded-full border border-red-200">
                        {selectedCampaign.blood_type}
                      </span>
                    </div>
                    {selectedCampaign.quantity > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Quantity: {selectedCampaign.quantity} unit</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Organizer</h4>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={selectedCampaign.user.url_file || '/api/placeholder/40/40'} 
                        alt={selectedCampaign.user.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{selectedCampaign.user.name}</p>
                        <p className="text-sm text-gray-600">{selectedCampaign.user.role}</p>
                      </div>
                      {selectedCampaign.user.is_verified && (
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
              Apakah Anda yakin ingin menghapus campaign "{selectedCampaign.event_name}"? 
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

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Tambah Campaign Baru</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Untuk membuat campaign baru, silakan gunakan halaman Create Campaign yang sudah tersedia.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                   onClick={() => {
                     setShowCreateModal(false);
                     navigate('/create-campaign');
                   }}
                   className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                 >
                   Buat Campaign
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCampaignsPage;