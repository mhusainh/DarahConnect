import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  AlertTriangle, 
  Calendar, 
  Clock,
  Droplet,
  MapPin,
  Phone,
  Save,
  Loader2,
  Edit
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../hooks/useNotification';
import { FadeIn } from './ui/AnimatedComponents';

interface UserData {
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
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface BloodRequest {
  id: number;
  user_id: number;
  user: UserData;
  hospital_id: number;
  hospital: Hospital;
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency_level: string;
  diagnosis: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
  status: string;
  event_type: string;
  created_at: string;
  updated_at: string;
}

interface EditBloodRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloodRequest: BloodRequest | null;
  onSuccess: () => void;
}

const EditBloodRequestModal: React.FC<EditBloodRequestModalProps> = ({
  isOpen,
  onClose,
  bloodRequest,
  onSuccess
}) => {
  const { addNotification } = useNotification();
  const { put, loading } = useApi();
  
  const [formData, setFormData] = useState({
    patient_name: '',
    blood_type: '',
    quantity: 1,
    urgency_level: '',
    diagnosis: '',
    event_name: '',
    event_date: '',
    start_time: '',
    end_time: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when bloodRequest changes
  useEffect(() => {
    if (bloodRequest) {
      const eventDate = new Date(bloodRequest.event_date);
      const startTime = bloodRequest.start_time || '08:00';
      const endTime = bloodRequest.end_time || '17:00';
      
      setFormData({
        patient_name: bloodRequest.patient_name || '',
        blood_type: bloodRequest.blood_type,
        quantity: bloodRequest.quantity,
        urgency_level: bloodRequest.urgency_level,
        diagnosis: bloodRequest.diagnosis,
        event_name: bloodRequest.event_name,
        event_date: eventDate.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime
      });
      setErrors({});
    }
  }, [bloodRequest]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_name.trim()) {
      newErrors.patient_name = 'Nama pasien harus diisi';
    }

    if (!formData.blood_type) {
      newErrors.blood_type = 'Golongan darah harus dipilih';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Jumlah kantong minimal 1';
    }

    if (!formData.urgency_level) {
      newErrors.urgency_level = 'Tingkat urgensi harus dipilih';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis harus diisi';
    }

    if (!formData.event_name.trim()) {
      newErrors.event_name = 'Nama acara harus diisi';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Tanggal acara harus dipilih';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Waktu mulai harus diisi';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Waktu selesai harus diisi';
    }

    if (formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Waktu selesai harus setelah waktu mulai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bloodRequest) return;

    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Mohon periksa kembali data yang diisi'
      });
      return;
    }

    try {
      const response = await put(`/update-blood-request/${bloodRequest.id}`, formData);
      
      if (response) {
        addNotification({
          type: 'success',
          title: 'Berhasil Diperbarui',
          message: 'Permintaan darah berhasil diperbarui'
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: 'Terjadi kesalahan saat memperbarui permintaan darah'
      });
    }
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-400',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-400',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-400',
      'O+': 'bg-green-500',
      'O-': 'bg-green-400',
    };
    return colors[bloodType as keyof typeof colors] || 'bg-gray-500';
  };

  if (!isOpen || !bloodRequest) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <FadeIn>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Permintaan Darah</h2>
                <p className="text-sm text-gray-600">ID: #{bloodRequest.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Informasi Pasien</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pasien *
                  </label>
                  <input
                    type="text"
                    value={formData.patient_name}
                    onChange={(e) => handleInputChange('patient_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.patient_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama pasien"
                  />
                  {errors.patient_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.patient_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Golongan Darah *
                  </label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => handleInputChange('blood_type', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.blood_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Golongan Darah</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.blood_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Kantong *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value === '' ? 1 : parseInt(e.target.value) || 1)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Urgensi *
                  </label>
                  <select
                    value={formData.urgency_level}
                    onChange={(e) => handleInputChange('urgency_level', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.urgency_level ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Tingkat Urgensi</option>
                    <option value="critical">Sangat Mendesak</option>
                    <option value="high">Mendesak</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Normal</option>
                  </select>
                  {errors.urgency_level && (
                    <p className="mt-1 text-sm text-red-600">{errors.urgency_level}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.diagnosis ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan diagnosis pasien"
                />
                {errors.diagnosis && (
                  <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
                )}
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Informasi Acara</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Acara *
                  </label>
                  <input
                    type="text"
                    value={formData.event_name}
                    onChange={(e) => handleInputChange('event_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.event_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: Donor Darah Bulanan"
                  />
                  {errors.event_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.event_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Acara *
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleInputChange('event_date', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.event_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.event_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.start_time ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Selesai *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.end_time ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Hospital Information (Read-only) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>Informasi Rumah Sakit</span>
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{bloodRequest.hospital.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {bloodRequest.hospital.address}, {bloodRequest.hospital.city}, {bloodRequest.hospital.province}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{bloodRequest.user.phone}</span>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Status Saat Ini</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bloodRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  bloodRequest.status === 'verified' ? 'bg-green-100 text-green-800' :
                  bloodRequest.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {bloodRequest.status === 'pending' ? 'Menunggu' :
                   bloodRequest.status === 'verified' ? 'Verified' :
                   bloodRequest.status === 'completed' ? 'Selesai' :
                   'Dibatalkan'}
                </span>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default EditBloodRequestModal; 