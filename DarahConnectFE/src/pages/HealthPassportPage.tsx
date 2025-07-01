import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { getApi, postApi, putApi } from '../services/fetchApi';
import { useNotification } from '../hooks/useNotification';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { healthPassportDummyData } from '../data/healthPassportDummy';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomAlert from '../components/CustomAlert';

// Types untuk API Response
interface User {
  id: number;
  name: string;
  gender: string;
  email: string;
  password: string;
  phone: string;
  blood_type: string;
  birth_date: string;
  address: string;
  role: string;
  reset_password_token: string;
  verify_email_token: string;
  is_verified: boolean;
  last_donation_date: string;
  donation_count: number;
  public_id: string;
  url_file: string;
  wallet_address: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

interface HealthPassportApiData {
  id: number;
  user_id: number;
  user: User;
  passport_number: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HealthPassportApiResponse {
  meta: {
    code: number;
    message: string;
  };
  data: HealthPassportApiData;
}

// Legacy types untuk backward compatibility
interface HealthRecord {
  id: number;
  type: 'medical' | 'vaccination' | 'donation' | 'checkup';
  title: string;
  description: string;
  date: string;
  doctor?: string;
  hospital?: string;
  result?: string;
  status: 'normal' | 'abnormal' | 'pending';
  attachments?: string[];
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number;
  lastUpdated: string;
}

interface HealthPassportData {
  id: number;
  userId: number;
  bloodType: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  vitalSigns: VitalSigns;
  healthRecords: HealthRecord[];
  vaccinations: {
    name: string;
    date: string;
    nextDue?: string;
    status: 'completed' | 'due' | 'overdue';
  }[];
  donationHistory: {
    id: number;
    date: string;
    location: string;
    volume: number;
    hemoglobin: number;
    status: 'completed' | 'deferred' | 'rejected';
  }[];
}

interface QuestionnaireItem {
  id: string;
  question: string;
  category: 'general' | 'recent_activity' | 'medical_history';
  checked: boolean;
}

const HealthPassportPage: React.FC = () => {
  const [healthPassportApi, setHealthPassportApi] = useState<HealthPassportApiData | null>(null);
  const [healthPassport, setHealthPassport] = useState<HealthPassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { alertState, showError: showCustomError, showWarning, showInfo, hideAlert } = useCustomAlert();

  // Questionnaire state
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireItem[]>([
    // Kesehatan Umum
    {
      id: 'q1',
      question: 'Saya merasa sehat dan tidak sedang sakit',
      category: 'general',
      checked: false
    },
    {
      id: 'q2', 
      question: 'Saya memiliki berat badan minimal 45 kg',
      category: 'general',
      checked: false
    },
    {
      id: 'q3',
      question: 'Saya berusia antara 17-60 tahun',
      category: 'general',
      checked: false
    },
    {
      id: 'q4',
      question: 'Saya memiliki tekanan darah normal (sistole 100-170 dan diastole 70-100 mmHg)',
      category: 'general',
      checked: false
    },
    // Aktivitas Terkini
    {
      id: 'q5',
      question: 'Saya tidak sedang menstruasi, hamil, atau menyusui (untuk wanita)',
      category: 'recent_activity',
      checked: false
    },
    {
      id: 'q6',
      question: 'Saya tidak melakukan vaksinasi dalam 24 jam terakhir',
      category: 'recent_activity',
      checked: false
    },
    {
      id: 'q7',
      question: 'Saya tidak melakukan operasi dalam 12 bulan terakhir',
      category: 'recent_activity',
      checked: false
    },
    {
      id: 'q8',
      question: 'Saya tidak mengonsumsi obat-obatan tertentu dalam 3 hari terakhir',
      category: 'recent_activity',
      checked: false
    },
    // Riwayat Kesehatan
    {
      id: 'q9',
      question: 'Saya tidak memiliki riwayat penyakit jantung, hati, ginjal, atau paru-paru',
      category: 'medical_history',
      checked: false
    },
    {
      id: 'q10',
      question: 'Saya tidak memiliki riwayat penyakit menular seperti Hepatitis, HIV/AIDS, atau Sifilis',
      category: 'medical_history',
      checked: false
    },
    {
      id: 'q11',
      question: 'Saya tidak memiliki riwayat penyakit diabetes yang memerlukan suntikan insulin',
      category: 'medical_history',
      checked: false
    },
    {
      id: 'q12',
      question: 'Saya tidak memiliki riwayat kanker atau sedang menjalani pengobatan kanker',
      category: 'medical_history',
      checked: false
    }
  ]);

  const [consentChecked, setConsentChecked] = useState(false);

  // Utility function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0001-01-01T07:00:00+07:00') {
      return null;
    }
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  // Generate QR code data for scanning
  const generateQRData = (passportData: HealthPassportApiData | null) => {
    if (!passportData) {
      return {
        passport_id: 'DEMO-12345',
        name: 'Demo User',
        blood_type: 'A+',
        status: 'demo',
        url: `${window.location.origin}/health-passport/demo`
      };
    }

    return {
      passport_id: passportData.passport_number,
      name: passportData.user.name,
      blood_type: passportData.user.blood_type,
      status: passportData.status,
      expiry: passportData.expiry_date,
      user_id: passportData.user.id,
      url: `${window.location.origin}/health-passport/${passportData.passport_number}`,
      verified_at: new Date().toISOString()
    };
  };

  // Generate realistic QR code pattern based on passport data
  const generateQRPattern = (passportData: HealthPassportApiData | null) => {
    const size = 21; // Standard QR code size for version 1
    const pattern: boolean[] = [];
    
    // Get data for encoding
    const qrData = generateQRData(passportData);
    const dataString = JSON.stringify(qrData);
    
    // Create hash for consistent pattern
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = ((hash << 5) - hash + dataString.charCodeAt(i)) & 0xffffffff;
    }
    
    // Generate 21x21 QR code pattern
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let isBlack = false;
        
        // Position detection patterns (finder patterns)
        if (isPositionDetectionPattern(x, y, size)) {
          isBlack = getPositionDetectionBit(x, y);
        }
        // Separator areas (always white)
        else if (isSeparatorArea(x, y, size)) {
          isBlack = false;
        }
        // Timing patterns
        else if (isTimingPattern(x, y, size)) {
          isBlack = (x + y) % 2 === 0;
        }
        // Dark module (always black)
        else if (x === 8 && y === size - 8) {
          isBlack = true;
        }
        // Data area
        else {
          const index = y * size + x;
          const hashBit = (hash >> (index % 32)) & 1;
          const dataBit = dataString.charCodeAt(index % dataString.length) & 1;
          isBlack = (hashBit ^ dataBit) === 1;
        }
        
        pattern.push(isBlack);
      }
    }
    
    return pattern;
  };

  // Helper functions for QR code structure
  const isPositionDetectionPattern = (x: number, y: number, size: number): boolean => {
    return (
      // Top-left (0-6, 0-6)
      (x < 7 && y < 7) ||
      // Top-right (14-20, 0-6)
      (x >= size - 7 && y < 7) ||
      // Bottom-left (0-6, 14-20)
      (x < 7 && y >= size - 7)
    );
  };

  const getPositionDetectionBit = (x: number, y: number): boolean => {
    // Adjust coordinates for the specific finder pattern area
    let px = x;
    let py = y;
    
    // Adjust for top-right pattern
    if (x >= 13) px = x - 13;
    // Adjust for bottom-left pattern  
    if (y >= 13) py = y - 13;
    
    // 7x7 position detection pattern (finder pattern)
    if (px >= 7 || py >= 7) return false;
    
    // Outer border
    if (px === 0 || px === 6 || py === 0 || py === 6) return true;
    // White border
    if (px === 1 || px === 5 || py === 1 || py === 5) return false;
    // Inner black square
    if ((px >= 2 && px <= 4) && (py >= 2 && py <= 4)) return true;
    
    return false;
  };

  const isTimingPattern = (x: number, y: number, size: number): boolean => {
    // Horizontal timing pattern
    if (y === 6 && x >= 8 && x < size - 8) return true;
    // Vertical timing pattern  
    if (x === 6 && y >= 8 && y < size - 8) return true;
    return false;
  };

  const isSeparatorArea = (x: number, y: number, size: number): boolean => {
    // Areas around finder patterns that should be white
    return (
      // Around top-left
      ((x === 7 || y === 7) && x < 8 && y < 8) ||
      // Around top-right
      ((x === size - 8 || y === 7) && x >= size - 8 && y < 8) ||
      // Around bottom-left
      ((x === 7 || y === size - 8) && x < 8 && y >= size - 8)
    );
  };

  // Load health passport data
  const loadHealthPassport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API
      const response = await getApi('/user/health-passport');
      
      // Debug: Log the response structure
      console.log('Health Passport API Response:', response);
      
      if (response.success && response.data) {
        let apiData: HealthPassportApiResponse;
        
        // Try to handle different possible response structures
        if (response.data.data) {
          // Standard structure: { data: { data: {...} } }
          apiData = response.data as HealthPassportApiResponse;
        } else if (response.data.id) {
          // Direct structure: { data: { id: ..., user: {...} } }
          apiData = {
            meta: { code: 200, message: 'Success' },
            data: response.data as HealthPassportApiData
          };
        } else {
          throw new Error('Unexpected API response structure');
        }
        
        // Check if apiData.data exists and has the required properties
        if (!apiData.data) {
          throw new Error('Health passport data not found');
        }
        
        // Validate required fields
        if (!apiData.data.id || !apiData.data.user_id || !apiData.data.user) {
          throw new Error('Invalid health passport data structure');
        }
        
        setHealthPassportApi(apiData.data);
        
        // Transform API data to legacy format for backward compatibility
        const transformedData: HealthPassportData = {
          id: apiData.data.id,
          userId: apiData.data.user_id,
          bloodType: apiData.data.user.blood_type || 'Unknown',
          allergies: [], // Not available in API
          medications: [], // Not available in API
          medicalConditions: [], // Not available in API
          emergencyContact: {
            name: '',
            phone: '',
            relation: ''
          }, // Not available in API
          vitalSigns: {
            bloodPressure: '',
            heartRate: 0,
            temperature: 0,
            weight: 0,
            height: 0,
            bmi: 0,
            lastUpdated: ''
          }, // Not available in API
          healthRecords: [], // Not available in API
          vaccinations: [], // Not available in API
          donationHistory: [] // Not available in API
        };
        
        setHealthPassport(transformedData);
        setLoading(false);
      } else {
        throw new Error(response.error || 'Failed to fetch health passport');
      }
      
    } catch (err: any) {
      console.error('Error loading health passport:', err);
      
      // Check if it's the specific error mentioned by user
      if (err.message && err.message.includes('Gagal mendapatkan daftar riwayat kesehatan')) {
        setError('Health Passport belum dibuat. Silakan lengkapi kuesioner untuk membuat Health Passport Anda.');
        setShowQuestionnaire(true);
        showCustomError(
          'Health Passport Belum Tersedia',
          'Anda belum memiliki Health Passport. Silakan lengkapi kuesioner kesehatan di bawah untuk membuat Health Passport Anda.',
          {
            text: 'Isi Kuesioner',
            onClick: () => {
              // Scroll to questionnaire section
              const questionnaireSection = document.getElementById('questionnaire-section');
              if (questionnaireSection) {
                questionnaireSection.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        );
      }
      // Check if it's a 404 error or data not found (health passport doesn't exist yet)
      else if (err.message && (
        err.message.includes('404') || 
        err.message.includes('not found') ||
        err.message.includes('Health passport data not found') ||
        err.message.includes('Invalid health passport data structure')
      )) {
        setError('Health Passport belum dibuat. Silakan lengkapi kuesioner untuk membuat Health Passport Anda.');
        setShowQuestionnaire(true);
      } else {
        setError(err.message || 'Network error occurred');
        showError('Gagal memuat Health Passport: ' + (err.message || 'Network error'));
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthPassport();
  }, []);

  const handleQuestionnaireChange = (id: string, checked: boolean) => {
    setQuestionnaire(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked } : item
      )
    );
  };

  const handleSubmitPassport = async () => {
    const allChecked = questionnaire.every(item => item.checked);
    const uncheckedQuestions = questionnaire.filter(item => !item.checked);
    
    if (!allChecked) {
      showWarning(
        'Belum Memenuhi Syarat Donor Darah',
        `Anda belum memenuhi syarat untuk donor darah. Masih ada ${uncheckedQuestions.length} pertanyaan yang belum dijawab dengan benar. Silakan periksa kembali jawaban Anda dan pastikan semua kondisi kesehatan terpenuhi.`,
        {
          text: 'Periksa Kembali',
          onClick: () => {
            // Scroll to first unchecked question
            const firstUnchecked = document.getElementById(uncheckedQuestions[0]?.id);
            if (firstUnchecked) {
              firstUnchecked.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the question
              firstUnchecked.parentElement?.classList.add('ring-2', 'ring-yellow-400', 'ring-opacity-75');
              setTimeout(() => {
                firstUnchecked.parentElement?.classList.remove('ring-2', 'ring-yellow-400', 'ring-opacity-75');
              }, 3000);
            }
          }
        }
      );
      return;
    }
    
    if (!consentChecked) {
      showWarning(
        'Persetujuan Diperlukan',
        'Harap setujui pernyataan kebijakan terlebih dahulu untuk melanjutkan proses pembuatan Health Passport.',
        {
          text: 'Kembali ke Form',
          onClick: () => {
            const consentCheckbox = document.getElementById('consent');
            if (consentCheckbox) {
              consentCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
              consentCheckbox.focus();
            }
          }
        }
      );
      return;
    }

    try {
      setLoading(true);
      
      // Prepare questionnaire data for API
      const questionnaireData = {
        questionnaire_responses: questionnaire.map(item => ({
          question_id: item.id,
          question: item.question,
          category: item.category,
          answer: item.checked
        })),
        consent_given: consentChecked,
        submission_date: new Date().toISOString()
      };

      // Submit questionnaire (assuming there's an endpoint for this)
      const response = await postApi('/user/health-passport');
      
      if (response.success) {
        showSuccess('Health Passport berhasil diperbarui!');
        // Reload the health passport data
        await loadHealthPassport();
      } else {
        throw new Error(response.error || 'Failed to submit questionnaire');
      }
      
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      showError('Gagal memperbarui Health Passport: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'general':
        return 'Kesehatan Umum';
      case 'recent_activity':
        return 'Aktivitas Terkini';
      case 'medical_history':
        return 'Riwayat Kesehatan';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return '❤️';
      case 'recent_activity':
        return '🏃';
      case 'medical_history':
        return '🏥';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Health Passport...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If error and it's a 404 (health passport doesn't exist), show the questionnaire
  if (error && error.includes('Health Passport belum dibuat')) {
    // Continue to render the questionnaire section below
  } else if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-500 text-5xl mb-4">⚕️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Health Passport</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadHealthPassport()}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Remove the early return condition - let the component render the questionnaire

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Show error message if health passport doesn't exist */}
          {(error || (!healthPassportApi && !loading)) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Health Passport Belum Tersedia</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    {error 
                      ? `Error: ${error}. Silakan lengkapi kuesioner kesehatan di bawah untuk membuat Health Passport Anda.`
                      : 'Anda belum memiliki Health Passport. Silakan lengkapi kuesioner kesehatan di bawah untuk membuat Health Passport Anda.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Digital Health Passport Card - Only show if data exists */}
          {healthPassportApi && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-red-600 text-white p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-lg font-bold">Digital Health Passport</h1>
              </div>
              <p className="text-sm mt-1">Tunjukkan QR Code ini saat Anda tiba di lokasi donor untuk mempercepat proses skrining</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* QR Code Section */}
                <div className="flex flex-col items-center">
                  <div className="bg-white border-2 border-gray-200 p-4 rounded-lg mb-4">
                    {/* QR Code based on passport data */}
                    <div className="w-48 h-48 bg-white border flex items-center justify-center">
                      <div 
                        className="grid gap-0 p-2"
                        style={{ 
                          gridTemplateColumns: 'repeat(21, 1fr)',
                          width: '168px',
                          height: '168px'
                        }}
                      >
                        {generateQRPattern(healthPassportApi).map((isBlack, i) => (
                          <div
                            key={i}
                            className={`${isBlack ? 'bg-black' : 'bg-white'}`}
                            style={{ 
                              width: '8px', 
                              height: '8px' 
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">ID: {healthPassportApi?.passport_number || 'DC-12345'}</p>
                  
                  <div className="flex space-x-4 text-sm">
                    <button 
                      onClick={() => {
                        const qrData = generateQRData(healthPassportApi);
                        const dataStr = JSON.stringify(qrData, null, 2);
                        const blob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `health-passport-${qrData.passport_id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Unduh Data</span>
                    </button>
                    <button 
                      onClick={() => {
                        const qrData = generateQRData(healthPassportApi);
                        if (navigator.share) {
                          navigator.share({
                            title: 'Health Passport',
                            text: `Health Passport: ${qrData.name} (${qrData.blood_type})`,
                            url: qrData.url
                          });
                        } else {
                          // Fallback: copy to clipboard
                          navigator.clipboard.writeText(qrData.url);
                          showSuccess('Link berhasil disalin ke clipboard!', '');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Bagikan</span>
                    </button>
                  </div>
                </div>

                {/* Information Section */}
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                      <span className="mr-2">ℹ️</span>
                      Informasi Kesehatan
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama</span>
                        <span className="font-medium">{healthPassportApi?.user?.name || 'Ahmad Rizki'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Golongan Darah</span>
                        <span className="font-medium text-red-600">{healthPassportApi?.user?.blood_type || 'A+'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terakhir Donor</span>
                        <span className="font-medium">
                          {healthPassportApi?.user?.last_donation_date 
                            ? formatDate(healthPassportApi.user.last_donation_date) || 'Belum pernah donor'
                            : 'Belum pernah donor'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status Kesehatan</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          healthPassportApi?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            healthPassportApi?.status === 'active' 
                              ? 'bg-green-400' 
                              : 'bg-red-400'
                          }`}></span>
                          {healthPassportApi?.status === 'active' ? 'Memenuhi Syarat' : 'Tidak Memenuhi Syarat'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Berlaku Hingga</span>
                        <span className="font-medium">
                          {healthPassportApi?.expiry_date 
                            ? formatDate(healthPassportApi.expiry_date) || 'Tidak tersedia'
                            : 'Tidak tersedia'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Donasi</span>
                        <span className="font-medium">{healthPassportApi?.user?.donation_count || 0} kali</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Perbarui Health Passport</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Questionnaire Section */}
          <div id="questionnaire-section" className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-red-600 text-white p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-lg font-bold">Kuesioner Kesehatan</h2>
              </div>
              <p className="text-sm mt-1">
                {(error || !healthPassportApi)
                  ? 'Lengkapi kuesioner berikut untuk membuat Health Passport Anda. Semua pertanyaan harus dijawab dengan benar.'
                  : 'Lengkapi kuesioner berikut untuk memperbarui Health Passport Anda.'
                }
              </p>
            </div>

            <div className="p-6">
              {/* Progress Indicator */}
              {(error || !healthPassportApi) && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-800">Progress Kuesioner</h4>
                    <span className="text-sm text-blue-600">
                      {questionnaire.filter(q => q.checked).length} / {questionnaire.length} selesai
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(questionnaire.filter(q => q.checked).length / questionnaire.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {questionnaire.every(q => q.checked) 
                      ? '✅ Semua pertanyaan telah dijawab! Anda dapat melanjutkan.'
                      : `⏳ Masih ada ${questionnaire.filter(q => !q.checked).length} pertanyaan yang perlu dijawab.`
                    }
                  </p>
                </div>
              )}

              {/* Group questions by category */}
              {['general', 'recent_activity', 'medical_history'].map((category) => {
                const categoryQuestions = questionnaire.filter(q => q.category === category);
                
                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">{getCategoryIcon(category)}</span>
                      {getCategoryTitle(category)}
                    </h3>
                    
                    <div className="space-y-3">
                      {categoryQuestions.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-start space-x-3 p-3 border rounded-lg transition-all duration-200 ${
                            item.checked 
                              ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                              : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={item.checked}
                              onChange={(e) => handleQuestionnaireChange(item.id, e.target.checked)}
                              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            {item.checked && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <label htmlFor={item.id} className={`text-sm cursor-pointer flex-1 ${
                            item.checked ? 'text-green-800' : 'text-gray-700'
                          }`}>
                            <span className="flex items-center">
                              {item.question}
                              {item.checked && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </span>
                            {item.question.includes('sistole') && (
                              <div className="text-xs text-gray-500 mt-1">
                                Tidak sedang demam, batuk, pilek, atau gejala penyakit lainnya
                              </div>
                            )}
                            {item.question.includes('obat-obatan') && (
                              <div className="text-xs text-gray-500 mt-1">
                                Seperti antibiotik, obat pengencer darah, atau obat tekanan darah
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Consent Section */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tentang Health Passport
                  </h4>
                  <p className="text-sm text-blue-700">
                    Health Passport adalah fitur inovatif yang memungkinkan Anda untuk mempercepat proses skrining saat tiba di lokus donor darah. Dengan menggunakan QR Code ini, petugas dapat dengan cepat mengakses informasi kesehatan Anda yang relevan.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Fitur ini dapat bahwa Health Passport bukan pengganti pemeriksaan kesehatan lengkap yang akan tetap dilakukan oleh petugas medis di lokasi donor.
                  </p>
                </div>

                <div className="flex items-start space-x-3 mb-6">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                    <span className="font-medium">Pernyataan Kebijakan</span>
                    <br />
                    Saya menyatakan bahwa informasi yang saya berikan adalah benar dan akurat. Saya memahami bahwa memberikan informasi yang salah dapat membahayakan penerima darah dan diri saya sendiri.
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      // Reset questionnaire
                      setQuestionnaire(prev => prev.map(item => ({ ...item, checked: false })));
                      setConsentChecked(false);
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSubmitPassport}
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      questionnaire.every(q => q.checked) && consentChecked
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                                                 <span>
                           {(error || !healthPassportApi)
                             ? 'Buat Health Passport' 
                             : 'Perbarui Health Passport'
                           }
                         </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Custom Alert */}
      <CustomAlert
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        isVisible={alertState.isVisible}
        onClose={hideAlert}
        actionButton={alertState.actionButton}
      />
    </>
  );
};

export default HealthPassportPage; 