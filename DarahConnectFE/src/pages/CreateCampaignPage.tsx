import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, CalendarIcon, AlertTriangleIcon, Building, Plus, Upload, X } from 'lucide-react';
import { BloodType, UrgencyLevel } from '../types';
import LocationPicker from '../components/LocationPicker';
import AddHospitalModal from '../components/AddHospitalModal';
import SearchableHospitalDropdown from '../components/SearchableHospitalDropdown';
import { useApi } from '../hooks/useApi';
import { useQuickNotifications } from '../contexts/NotificationContext';

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface CreateCampaignForm {
  title: string;
  description: string;
  hospital_id: number;
  location: string;
  bloodType: BloodType[];
  targetDonors: number;
  urgencyLevel: UrgencyLevel;
  contactPerson: string;
  contactPhone: string;
  deadline: string;
  imageUrl: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  slots_available: number;
  slots_booked: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  hospital_id?: string;
  location?: string;
  bloodType?: string;
  targetDonors?: string;
  contactPerson?: string;
  contactPhone?: string;
  deadline?: string;
  image?: string;
  event_name?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  slots_available?: string;
  slots_booked?: string;
}

const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignForm>({
    title: '',
    description: '',
    hospital_id: 0,
    location: '',
    bloodType: [],
    targetDonors: 50,
    urgencyLevel: 'medium',
    contactPerson: '',
    contactPhone: '',
    deadline: '',
    imageUrl: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800',
    event_name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    slots_available: 100,
    slots_booked: 50
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAddHospitalModalOpen, setIsAddHospitalModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const campaignApi = useApi();
  const notifications = useQuickNotifications();

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels: { value: UrgencyLevel; label: string; color: string }[] = [
    { value: 'low', label: 'Rendah', color: 'text-green-600' },
    { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
    { value: 'high', label: 'Mendesak', color: 'text-orange-600' },
    { value: 'critical', label: 'Sangat Mendesak', color: 'text-red-600' }
  ];



  const handleInputChange = (field: keyof CreateCampaignForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Reset loading state on component unmount and prevent memory leaks
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      setIsLoading(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBloodTypeToggle = (bloodType: BloodType) => {
    const newBloodTypes = formData.bloodType.includes(bloodType)
      ? formData.bloodType.filter(type => type !== bloodType)
      : [...formData.bloodType, bloodType];
    
    handleInputChange('bloodType', newBloodTypes);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'File harus berupa gambar' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Ukuran file maksimal 5MB' }));
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Required fields validation
    if (!formData.hospital_id || formData.hospital_id === 0) newErrors.hospital_id = 'Rumah sakit wajib dipilih';
    if (!formData.event_name.trim()) newErrors.event_name = 'Nama event wajib diisi';
    if (!formData.event_date) newErrors.event_date = 'Tanggal event wajib diisi';
    if (!formData.start_time) newErrors.start_time = 'Waktu mulai wajib diisi';
    if (!formData.end_time) newErrors.end_time = 'Waktu selesai wajib diisi';
    if (!formData.slots_available || formData.slots_available < 1) newErrors.slots_available = 'Slot tersedia minimal 1';
    if (formData.slots_booked < 0) newErrors.slots_booked = 'Slot terisi tidak boleh negatif';
    if (formData.slots_booked > formData.slots_available) newErrors.slots_booked = 'Slot terisi tidak boleh lebih besar dari slot tersedia';
    
    // Validate event date is in the future
    const eventDate = new Date(formData.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate <= today) {
      newErrors.event_date = 'Tanggal event harus di masa depan';
    }
    
    // Validate time range
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(`2000-01-01T${formData.start_time}`);
      const endTime = new Date(`2000-01-01T${formData.end_time}`);
      if (startTime >= endTime) {
        newErrors.end_time = 'Waktu selesai harus lebih besar dari waktu mulai';
      }
    }

    setErrors(newErrors);
    
    // Scroll to first error field if validation fails
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
    
    return { isValid: Object.keys(newErrors).length === 0, errorCount: Object.keys(newErrors).length };
  };

  const handleHospitalAdded = (newHospital: Hospital) => {
    setFormData(prev => ({ ...prev, hospital_id: newHospital.id }));
    setIsAddHospitalModalOpen(false);
    notifications.success('Berhasil!', 'Rumah sakit baru telah ditambahkan');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Validate form first
    const validation = validateForm();
    if (!validation.isValid) {
      setIsLoading(false);
      notifications.error(
        'Validasi Gagal', 
        `Terdapat ${validation.errorCount} kesalahan pada form. Mohon periksa kembali data yang Anda masukkan.`
      );
      return;
    }
    
    try {
      // Create FormData object
      const formDataPayload = new FormData();
      
      // Add form fields
      formDataPayload.append('hospital_id', String(formData.hospital_id));
      formDataPayload.append('event_name', formData.event_name || formData.title);
      formDataPayload.append('slots_available', String(formData.slots_available));
      formDataPayload.append('slots_booked', String(formData.slots_booked));
      
      // Additional fields for backward compatibility
      formDataPayload.append('title', formData.title);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('location', formData.location);
      formDataPayload.append('blood_type', JSON.stringify(formData.bloodType));
      formDataPayload.append('target_donors', String(formData.targetDonors));
      formDataPayload.append('urgency_level', formData.urgencyLevel);
      formDataPayload.append('contact_person', formData.contactPerson);
      formDataPayload.append('contact_phone', formData.contactPhone);
      formDataPayload.append('deadline', formData.deadline);
      
      // Add image if selected
      if (selectedImage) {
        formDataPayload.append('image', selectedImage);
      }
      
      // Pada handleSubmit, sebelum append ke formDataPayload:
      const eventDate = formData.event_date; // YYYY-MM-DD
      const startTime = formData.start_time; // HH:mm
      const endTime = formData.end_time; // HH:mm

      // Gabungkan ke ISO string (asumsikan waktu lokal, bisa diubah ke UTC jika perlu)
      const startDateTime = eventDate && startTime ? new Date(`${eventDate}T${startTime}`).toISOString() : '';
      const endDateTime = eventDate && endTime ? new Date(`${eventDate}T${endTime}`).toISOString() : '';

      formDataPayload.append('event_date', startDateTime); // atau event_date
      formDataPayload.append('start_time', startDateTime);
      formDataPayload.append('end_time', endDateTime);
      
      console.log('🔧 Sending campaign as FormData:', Array.from(formDataPayload.entries()));
      
      // Use useApi hook for better error handling and consistency
      const response = await campaignApi.post('/admin-campaign', formDataPayload);
      
      
      if (response.success) {
        console.log('✅ Campaign created successfully:', response.data);
        notifications.success('Berhasil!', 'Campaign donor darah berhasil dibuat');
        navigate('/admin/campaigns');
      } else {
        // Handle API error response
        const errorMessage = response.error || response.message || 'Gagal membuat campaign';
        notifications.error('Error', errorMessage);
        console.error('❌ API Error:', response);
      }
      
    } catch (error: any) {
      console.error('❌ Create campaign error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Terjadi kesalahan saat membuat campaign. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifications.error('Error', errorMessage);
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Kembali
            </button>
            <h1 className="text-xl font-bold text-gray-900">Buat Campaign Donor Darah</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informasi Campaign</h2>
            <p className="text-gray-600 mt-1">Isi form berikut untuk membuat campaign donor darah baru</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Hospital */}
            <div>
              <label htmlFor="hospital_id" className="block text-sm font-medium text-gray-700 mb-2">
                Rumah Sakit / Institusi *
              </label>
              <SearchableHospitalDropdown
                value={formData.hospital_id}
                onChange={(hospitalId) => handleInputChange('hospital_id', hospitalId)}
                onAddHospital={() => setIsAddHospitalModalOpen(true)}
                error={errors.hospital_id}
                placeholder="Pilih Rumah Sakit"
              />
            </div>

            {/* Event Name */}
            <div>
              <label htmlFor="event_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Event *
              </label>
              <input
                id="event_name"
                type="text"
                value={formData.event_name}
                onChange={(e) => handleInputChange('event_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.event_name ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.event_name && <p className="mt-1 text-sm text-red-600">{errors.event_name}</p>}
            </div>

            {/* Event Date */}
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Event *
              </label>
              <input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.event_date ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                Waktu Mulai *
              </label>
              <input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.start_time ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                Waktu Selesai *
              </label>
              <input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.end_time ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
            </div>

            {/* Slots Available */}
            <div>
              <label htmlFor="slots_available" className="block text-sm font-medium text-gray-700 mb-2">
                Slot Tersedia *
              </label>
              <input
                id="slots_available"
                type="number"
                min="1"
                value={formData.slots_available}
                onChange={(e) => handleInputChange('slots_available', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.slots_available ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.slots_available && <p className="mt-1 text-sm text-red-600">{errors.slots_available}</p>}
            </div>

            {/* Slots Booked */}
            <div>
              <label htmlFor="slots_booked" className="block text-sm font-medium text-gray-700 mb-2">
                Slot Terisi *
              </label>
              <input
                id="slots_booked"
                type="number"
                min="0"
                value={formData.slots_booked}
                onChange={(e) => handleInputChange('slots_booked', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.slots_booked ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.slots_booked && <p className="mt-1 text-sm text-red-600">{errors.slots_booked}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Event (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                  <button type="button" onClick={handleRemoveImage} className="mt-2 text-red-600 hover:underline">Hapus Gambar</button>
                </div>
              )}
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Membuat Campaign...
                  </div>
                ) : (
                  'Buat Campaign'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Hospital Modal */}
      <AddHospitalModal
        isOpen={isAddHospitalModalOpen}
        onClose={() => setIsAddHospitalModalOpen(false)}
        onHospitalAdded={handleHospitalAdded}
      />
    </div>
  );
};

export default CreateCampaignPage;