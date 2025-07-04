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
  ExternalLinkIcon,
  XIcon,
  UploadCloudIcon,
  FileTextIcon,
  FileIcon,
  CheckCircle2Icon,
  ImageIcon
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
  url_file: string;
  urgency_level: string;
  diagnosis: string;
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
  event_type: string;
  hospital_id?: number;
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

  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState<DonorRegistration | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [printCertificate, setPrintCertificate] = useState(false);
  const [bloodType, setBloodType] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const { get: getApi, post: postApi } = useApi<any>();

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

  const handleCardClick = (registration: DonorRegistration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
    setUploadError('');
    setSuccessMsg('');
    setBloodType('');
    setPrintCertificate(false);
    setUploadFile(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRegistration(null);
    setUploadError('');
    setSuccessMsg('');
    setBloodType('');
    setPrintCertificate(false);
    setUploadFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const isEventDateReached = (eventDate: string) => {
    if (!eventDate || eventDate === '0001-01-01T00:00:00Z') return false;
    const today = new Date();
    const event = new Date(eventDate);
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    return event <= today;
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedRegistration) return;
    if (!bloodType) {
      setUploadError('Golongan darah wajib dipilih.');
      return;
    }

    setUploading(true);
    setSuccessMsg('');
    setUploadError('');

    const formData = new FormData();
    formData.append('hospital_id', String(selectedRegistration.BloodRequest?.hospital_id || ''));
    formData.append('registration_id', String(selectedRegistration.id));
    formData.append('donation_date', selectedRegistration.BloodRequest?.event_date || '');
    formData.append('blood_type', bloodType);
    formData.append('status', printCertificate ? 'pending' : 'completed');
    formData.append('image', uploadFile);

    try {
      const response = await postApi('/blood-donation', formData);
      if (response && response.success !== false) {
        setSuccessMsg('Bukti berhasil diupload!');
        setUploadFile(null);
        setBloodType('');
        setPrintCertificate(false);
        // Refresh data
        fetchDonorRegistrations(currentPage);
        // Close modal after success
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setUploadError(response?.error || 'Gagal upload bukti');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Gagal upload bukti');
    }
    setUploading(false);
  };

  const renderFilePreview = (url: string) => {
    if (!url) return null;
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={url} alt="Bukti Donor" className="w-20 h-20 object-cover rounded shadow border" />;
    }
    if (url.match(/\.pdf$/i)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-blue-600 hover:underline">
          <FileIcon className="w-10 h-10 mb-1" />
          <span className="text-xs">Lihat PDF</span>
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-blue-600 hover:underline">
        <FileTextIcon className="w-10 h-10 mb-1" />
        <span className="text-xs">Lihat File</span>
      </a>
    );
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {registrations.map((registration, index) => (
                  <SlideIn key={registration.id} direction="up" delay={index * 0.1}>
                    <div 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-full flex flex-col cursor-pointer"
                      onClick={() => handleCardClick(registration)}
                    >
                      {/* Image Header */}
                      <div className="relative h-32 bg-gradient-to-r from-red-100 to-pink-100 overflow-hidden">
                        {registration.BloodRequest?.url_file && registration.BloodRequest.url_file !== '' ? (
                          <>
                            <img 
                              src={registration.BloodRequest.url_file} 
                              alt="Event Image" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-600/30"></div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20"></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <HeartHandshakeIcon className="w-8 h-8 text-red-600" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                            {getStatusText(registration.status)}
                          </span>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <HeartHandshakeIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {registration.BloodRequest?.event_name || 'Event Donor Darah'}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-100">
                            ID: #{registration.id}
                          </span>
                          <span className="text-xs text-red-100">
                            Klik untuk detail
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Patient Info */}
                        {registration.BloodRequest?.patient_name && (
                          <div className="flex items-center space-x-2 mb-3">
                            <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {registration.BloodRequest.patient_name}
                            </span>
                          </div>
                        )}

                        {/* Blood Type */}
                        {registration.BloodRequest?.blood_type && (
                          <div className="flex items-center space-x-2 mb-3">
                            <DropletIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              {registration.BloodRequest.blood_type}
                            </span>
                            {registration.BloodRequest?.urgency_level && (
                              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                                registration.BloodRequest.urgency_level === 'urgent' || registration.BloodRequest.urgency_level === 'critical' 
                                  ? 'bg-red-100 text-red-700' 
                                  : registration.BloodRequest.urgency_level === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {registration.BloodRequest.urgency_level}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Event Date */}
                        {registration.BloodRequest?.event_date && (
                          <div className="flex items-center space-x-2 mb-3">
                            <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {formatDate(registration.BloodRequest.event_date)}
                            </span>
                          </div>
                        )}

                        {/* Time */}
                        {registration.BloodRequest?.start_time && (
                          <div className="flex items-center space-x-2 mb-3">
                            <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {formatTime(registration.BloodRequest.start_time)}
                              {registration.BloodRequest.end_time && 
                                ` - ${formatTime(registration.BloodRequest.end_time)}`
                              }
                            </span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Daftar: {formatDate(registration.created_at)}</span>
                            {registration.BloodRequest?.event_type && (
                              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                {registration.BloodRequest.event_type}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Request ID: #{registration.request_id}
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

      {/* Detail Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <HeartHandshakeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedRegistration.BloodRequest?.event_name || 'Event Donor Darah'}
                    </h3>
                    <p className="text-red-100 text-sm">ID: #{selectedRegistration.id}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <XIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status Registrasi:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRegistration.status)}`}>
                  {getStatusText(selectedRegistration.status)}
                </span>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRegistration.BloodRequest?.patient_name && (
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nama Pasien</p>
                      <p className="font-medium">{selectedRegistration.BloodRequest.patient_name}</p>
                    </div>
                  </div>
                )}

                {selectedRegistration.BloodRequest?.blood_type && (
                  <div className="flex items-center space-x-2">
                    <DropletIcon className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Golongan Darah</p>
                      <p className="font-medium">{selectedRegistration.BloodRequest.blood_type}</p>
                    </div>
                  </div>
                )}

                {selectedRegistration.BloodRequest?.event_date && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Event</p>
                      <p className="font-medium">{formatDate(selectedRegistration.BloodRequest.event_date)}</p>
                    </div>
                  </div>
                )}

                {selectedRegistration.BloodRequest?.start_time && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Waktu Event</p>
                      <p className="font-medium">
                        {formatTime(selectedRegistration.BloodRequest.start_time)}
                        {selectedRegistration.BloodRequest.end_time && 
                          ` - ${formatTime(selectedRegistration.BloodRequest.end_time)}`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnosis */}
              {selectedRegistration.BloodRequest?.diagnosis && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-900 mb-2">Diagnosis</h4>
                  <p className="text-blue-800 text-sm">{selectedRegistration.BloodRequest.diagnosis}</p>
                </div>
              )}

              {/* Notes */}
              {selectedRegistration.notes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Catatan</h4>
                  <p className="text-gray-700 text-sm">{selectedRegistration.notes}</p>
                </div>
              )}

                            {/* Upload Section - Only show if event date is today or past */}
              {isEventDateReached(selectedRegistration.BloodRequest?.event_date || '') ? (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <UploadCloudIcon className="w-5 h-5 text-blue-600" />
                    Upload Bukti Donor Darah
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih File Bukti *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format yang didukung: JPG, PNG, PDF (Maksimal 10MB)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Golongan Darah *
                      </label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Pilih Golongan Darah</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="printCertificate"
                        checked={printCertificate}
                        onChange={(e) => setPrintCertificate(e.target.checked)}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="printCertificate" className="text-sm text-gray-700">
                        Saya ingin mencetak sertifikat digital donor darah
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !uploadFile || !bloodType}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <UploadCloudIcon className="w-4 h-4" />
                            Upload Bukti
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCloseModal}
                        disabled={uploading}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Batal
                      </button>
                    </div>

                    {successMsg && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-medium">{successMsg}</span>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="w-5 h-5 text-red-600" />
                          <span className="text-red-700">{uploadError}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-gray-500" />
                      <h4 className="font-medium text-gray-700">Upload Bukti Belum Tersedia</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Upload bukti donor akan tersedia pada hari event atau setelahnya
                      {selectedRegistration.BloodRequest?.event_date && (
                        <span className="font-medium">
                          {' '}({formatDate(selectedRegistration.BloodRequest.event_date)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Registration Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Informasi Registrasi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tanggal Daftar:</span>
                    <p className="font-medium">{formatDate(selectedRegistration.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Request ID:</span>
                    <p className="font-medium">#{selectedRegistration.request_id}</p>
                  </div>
                  {selectedRegistration.BloodRequest?.event_type && (
                    <div>
                      <span className="text-gray-600">Tipe Event:</span>
                      <p className="font-medium">{selectedRegistration.BloodRequest.event_type}</p>
                    </div>
                  )}
                  {selectedRegistration.BloodRequest?.urgency_level && (
                    <div>
                      <span className="text-gray-600">Tingkat Urgensi:</span>
                      <p className={`font-medium ${getUrgencyColor(selectedRegistration.BloodRequest.urgency_level)}`}>
                        {selectedRegistration.BloodRequest.urgency_level}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DonorRegistrationPage; 