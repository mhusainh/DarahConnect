import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, CalendarIcon, AlertTriangleIcon, UserIcon, BuildingIcon, HeartIcon, ClockIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useQuickNotifications } from '../contexts/NotificationContext';
import { getUserData } from '../utils/jwt';
import { formatDateForBackend, formatDateForDisplay, isDateInFuture, EXAMPLE_FORMATTED_DATE } from '../utils/dateUtils';

interface CreateBloodRequestForm {
  user_id: number;
  hospital_id: number;
  patient_name: string;
  event_date: string;
  blood_type: string;
  quantity: number;
  urgency_level: string;
  diagnosis: string;
}

interface FormErrors {
  patient_name?: string;
  event_date?: string;
  blood_type?: string;
  quantity?: string;
  urgency_level?: string;
  diagnosis?: string;
  hospital_id?: string;
}

interface Hospital {
  id: number;
  name: string;
  location: string;
}

const CreateBloodRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const createRequestApi = useApi();
  const notifications = useQuickNotifications();
  
  const [formData, setFormData] = useState<CreateBloodRequestForm>({
    user_id: 0,
    hospital_id: 1,
    patient_name: '',
    event_date: '',
    blood_type: '',
    quantity: 1,
    urgency_level: 'Medium',
    diagnosis: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // Mock hospitals data - in real app, this would come from API
  const hospitals: Hospital[] = [
    { id: 1, name: 'RS Cipto Mangunkusumo', location: 'Jakarta Pusat' },
    { id: 2, name: 'RS Fatmawati', location: 'Jakarta Selatan' },
    { id: 3, name: 'RS Persahabatan', location: 'Jakarta Timur' },
    { id: 4, name: 'RS Hasan Sadikin', location: 'Bandung' },
    { id: 5, name: 'RS Sardjito', location: 'Yogyakarta' }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'Low', label: 'Rendah', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
    { value: 'Medium', label: 'Sedang', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
    { value: 'High', label: 'Tinggi', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
    { value: 'Critical', label: 'Kritis', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' }
  ];

  // Set user_id from localStorage on component mount
  useEffect(() => {
    const userData = getUserData();
    if (userData?.id) {
      setFormData(prev => ({ ...prev, user_id: userData.id }));
    }
  }, []);

  const handleInputChange = (field: keyof CreateBloodRequestForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.patient_name.trim()) newErrors.patient_name = 'Nama pasien wajib diisi';
    if (formData.patient_name.length < 5) newErrors.patient_name = 'Nama pasien minimal 5 karakter';
    
    if (!formData.event_date) newErrors.event_date = 'Tanggal dibutuhkan wajib diisi';
    else if (!isDateInFuture(formData.event_date)) {
      newErrors.event_date = 'Tanggal dibutuhkan harus di masa depan';
    }
    
    if (!formData.blood_type) newErrors.blood_type = 'Golongan darah wajib dipilih';
    
    if (formData.quantity < 1) newErrors.quantity = 'Jumlah kantong minimal 1';
    if (formData.quantity > 100) newErrors.quantity = 'Jumlah kantong maksimal 100';
    
    if (!formData.urgency_level) newErrors.urgency_level = 'Tingkat urgensi wajib dipilih';
    
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis wajib diisi';
    if (formData.diagnosis.length < 10) newErrors.diagnosis = 'Diagnosis minimal 10 karakter';
    
    if (!formData.hospital_id) newErrors.hospital_id = 'Rumah sakit wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notifications.error('Form Tidak Valid', 'Mohon periksa kembali data yang Anda masukkan');
      return;
    }

    try {
      // Format the date using utility function
      const formattedData = {
        ...formData,
        event_date: formatDateForBackend(formData.event_date)
      };
      
      console.log('🔧 Sending blood request with formatted data:', formattedData);
      console.log('🔧 Expected format example:', EXAMPLE_FORMATTED_DATE);
      
      const response = await createRequestApi.post('/user/create-blood-request', formattedData);
      
      if (response.success) {
        notifications.success(
          'Request Berhasil!', 
          `Request donor darah untuk pasien "${formData.patient_name}" telah berhasil dibuat`
        );
        
        // Redirect to dashboard or requests list
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        const errorMessage = response.data?.meta?.message || response.error || 'Gagal membuat request';
        console.error('❌ API Error Response:', response);
        notifications.error('Request Gagal', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Create blood request error:', error);
      
      // Check if it's a date formatting error
      if (error.message && error.message.includes('parsing time')) {
        notifications.error('Format Tanggal Bermasalah', 'Mohon pilih tanggal yang valid');
      } else if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error occurred';
        notifications.error('Server Error', errorMessage);
      } else if (error.request) {
        // Network error
        notifications.error('Koneksi Bermasalah', 'Tidak dapat terhubung ke server');
      } else {
        // Other error
        notifications.error('Error', error.message || 'Terjadi kesalahan tidak terduga');
      }
    }
  };

  const selectedHospital = hospitals.find(h => h.id === formData.hospital_id);
  const selectedUrgency = urgencyLevels.find(u => u.value === formData.urgency_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Kembali
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buat Request Donor Darah
            </h1>
            <p className="text-gray-600">
              Ajukan permintaan donor darah untuk kebutuhan medis
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Name & Required Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pasien *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="patient_name"
                    type="text"
                    value={formData.patient_name}
                    onChange={(e) => handleInputChange('patient_name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.patient_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: Ahmad Budi Santoso"
                  />
                </div>
                {errors.patient_name && <p className="mt-1 text-sm text-red-600">{errors.patient_name}</p>}
              </div>

              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal & Waktu Dibutuhkan *
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => handleInputChange('event_date', e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.event_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
              </div>
            </div>

            {/* Hospital Selection */}
            <div>
              <label htmlFor="hospital_id" className="block text-sm font-medium text-gray-700 mb-2">
                Rumah Sakit *
              </label>
              <div className="relative">
                <BuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  id="hospital_id"
                  value={formData.hospital_id}
                  onChange={(e) => handleInputChange('hospital_id', parseInt(e.target.value))}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                    errors.hospital_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Rumah Sakit</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.location}
                    </option>
                  ))}
                </select>
              </div>
              {errors.hospital_id && <p className="mt-1 text-sm text-red-600">{errors.hospital_id}</p>}
            </div>

            {/* Blood Type & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Golongan Darah *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('blood_type', type)}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                        formData.blood_type === type
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.blood_type && <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Kantong Dibutuhkan *
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Urgensi *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {urgencyLevels.map((urgency) => (
                  <button
                    key={urgency.value}
                    type="button"
                    onClick={() => handleInputChange('urgency_level', urgency.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                      formData.urgency_level === urgency.value
                        ? `border-${urgency.value === 'Critical' ? 'red' : urgency.value === 'High' ? 'orange' : urgency.value === 'Medium' ? 'yellow' : 'green'}-500 ${urgency.bgColor} ${urgency.color}`
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <AlertTriangleIcon className="w-4 h-4 mx-auto mb-1" />
                    {urgency.label}
                  </button>
                ))}
              </div>
              {errors.urgency_level && <p className="mt-1 text-sm text-red-600">{errors.urgency_level}</p>}
            </div>

            {/* Diagnosis */}
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis / Keperluan Medis *
              </label>
              <textarea
                id="diagnosis"
                rows={4}
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                  errors.diagnosis ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pasien operasi jantung membutuhkan donor darah untuk transfusi..."
              />
              {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>}
            </div>

            {/* Preview */}
            {formData.patient_name && formData.blood_type && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Preview Request</h3>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Pasien: {formData.patient_name}</h4>
                    {selectedUrgency && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${selectedUrgency.bgColor} ${selectedUrgency.color} border`}>
                        <AlertTriangleIcon className="w-3 h-3 mr-1" />
                        {selectedUrgency.label}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <BuildingIcon className="w-4 h-4 mr-2" />
                      {selectedHospital?.name} - {selectedHospital?.location}
                    </p>
                    <p className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-2" />
                      Golongan Darah: <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded ml-1 font-medium">{formData.blood_type}</span>
                    </p>
                    <p className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Jumlah: {formData.quantity} kantong
                    </p>
                    {formData.event_date && (
                      <p className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Dibutuhkan: {formatDateForDisplay(formData.event_date)}
                      </p>
                    )}
                    {formData.diagnosis && (
                      <p className="mt-2 italic">"{formData.diagnosis.substring(0, 100)}{formData.diagnosis.length > 100 ? '...' : ''}"</p>
                    )}
                  </div>
                  
                  {/* Debug Info - Only show in development */}
                  {process.env.NODE_ENV === 'development' && formData.event_date && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">🔧 Debug Format Tanggal:</p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div><strong>Input:</strong> {formData.event_date}</div>
                        <div><strong>Formatted:</strong> {formatDateForBackend(formData.event_date)}</div>
                        <div><strong>Expected:</strong> {EXAMPLE_FORMATTED_DATE}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createRequestApi.loading}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {createRequestApi.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Membuat Request...
                  </>
                ) : (
                  <>
                    <HeartIcon className="w-5 h-5 mr-2" />
                    Buat Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBloodRequestPage; 