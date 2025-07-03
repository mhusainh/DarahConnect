import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshakeIcon, 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  DropletIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon
} from 'lucide-react';
import Layout from '../components/Layout';
import { FadeIn, SlideIn } from '../components/ui/AnimatedComponents';
import { useApi } from '../hooks/useApi';

type User = {
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
  created_at: string;
  updated_at: string;
};

type BloodRequest = {
  id: number;
  event_name: string;
  patient_name: string;
  blood_type: string;
  urgency_level: string;
  diagnosis: string;
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
  event_type: string;
};

type DonorRegistration = {
  id: number;
  user_id: number;
  user: User;
  request_id: number;
  BloodRequest: BloodRequest;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type PaginationInfo = {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
};

type ApiResponse = {
  meta: {
    code: number;
    message: string;
  };
  data: DonorRegistration[];
  pagination: PaginationInfo;
};

const DonorRegistrationPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<DonorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0
  });

  const { get: getApi } = useApi<any>();

  const fetchDonorRegistrations = (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    getApi(`/donor-registrations?page=${page}&per_page=10`)
      .then((response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          setRegistrations(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setError('Gagal memuat data donor registrations');
        }
      })
      .catch((err: any) => {
        setError('Terjadi kesalahan saat memuat data');
        console.error('Error fetching donor registrations:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDonorRegistrations(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'registered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'registered':
        return 'Terdaftar';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'pending':
        return 'Menunggu';
      default:
        return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
      case 'darurat':
        return 'text-red-600';
      case 'high':
      case 'tinggi':
        return 'text-orange-600';
      case 'medium':
      case 'sedang':
        return 'text-yellow-600';
      case 'low':
      case 'rendah':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(pagination.total_pages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < pagination.total_pages - 1) {
      rangeWithDots.push('...', pagination.total_pages);
    } else {
      rangeWithDots.push(pagination.total_pages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <FadeIn>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data donor registrations...</p>
            </div>
          </FadeIn>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <FadeIn>
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchDonorRegistrations(currentPage)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </FadeIn>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <HeartHandshakeIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Donor Terdaftar</h1>
              <p className="text-gray-600">Daftar event donor yang sudah Anda daftarkan</p>
              {pagination.total_items > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Total: {pagination.total_items} registrasi
                </p>
              )}
            </div>
          </FadeIn>

          {registrations.length === 0 ? (
            <FadeIn delay={0.2}>
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshakeIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Registrasi</h3>
                <p className="text-gray-600 mb-6">Anda belum mendaftar ke event donor manapun</p>
                <Link
                  to="/blood-requests"
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <HeartHandshakeIcon className="w-5 h-5" />
                  <span>Lihat Event Donor</span>
                </Link>
              </div>
            </FadeIn>
          ) : (
            <>
              <div className="grid gap-6">
                {registrations.map((registration, index) => (
                  <SlideIn key={registration.id} direction="up" delay={index * 0.1}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            {/* Event Info */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <HeartHandshakeIcon className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {registration.BloodRequest?.event_name || 'Event Donor Darah'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  ID: #{registration.id}
                                </p>
                              </div>
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {registration.BloodRequest?.patient_name && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <UserIcon className="w-4 h-4" />
                                  <span>Pasien: {registration.BloodRequest.patient_name}</span>
                                </div>
                              )}
                              
                              {registration.BloodRequest?.blood_type && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <DropletIcon className="w-4 h-4" />
                                  <span>Golongan Darah: {registration.BloodRequest.blood_type}</span>
                                </div>
                              )}

                              {registration.BloodRequest?.event_date && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{formatDate(registration.BloodRequest.event_date)}</span>
                                </div>
                              )}

                              {registration.BloodRequest?.start_time && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>
                                    {formatTime(registration.BloodRequest.start_time)}
                                    {registration.BloodRequest.end_time && 
                                      ` - ${formatTime(registration.BloodRequest.end_time)}`
                                    }
                                  </span>
                                </div>
                              )}

                              {registration.BloodRequest?.urgency_level && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <AlertCircleIcon className="w-4 h-4" />
                                  <span className={getUrgencyColor(registration.BloodRequest.urgency_level)}>
                                    Prioritas: {registration.BloodRequest.urgency_level}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Didaftar: {formatDate(registration.created_at)}</span>
                              </div>
                            </div>

                            {/* Notes */}
                            {registration.notes && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  <span className="font-medium">Catatan:</span> {registration.notes}
                                </p>
                              </div>
                            )}

                            {/* Diagnosis */}
                            {registration.BloodRequest?.diagnosis && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                  <span className="font-medium">Diagnosis:</span> {registration.BloodRequest.diagnosis}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status and Actions */}
                          <div className="lg:ml-6 mt-4 lg:mt-0">
                            <div className="flex flex-col space-y-3">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                                {getStatusText(registration.status)}
                              </span>
                              
                              {registration.BloodRequest?.event_type && (
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  {registration.BloodRequest.event_type}
                                </span>
                              )}

                              <div className="text-xs text-gray-500 text-right">
                                <p>Request ID: #{registration.request_id}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SlideIn>
                ))}
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <FadeIn delay={0.4}>
                  <div className="mt-8 flex items-center justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Sebelumnya
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {getPaginationNumbers().map((page, index) => (
                          <span key={index}>
                            {page === '...' ? (
                              <span className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(Number(page))}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                              >
                                {page}
                              </button>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.total_pages}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pagination.total_pages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Selanjutnya
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </button>
                    </nav>
                  </div>

                  {/* Pagination Info */}
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Menampilkan halaman {currentPage} dari {pagination.total_pages} 
                    ({pagination.total_items} total registrasi)
                  </div>
                </FadeIn>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DonorRegistrationPage; 