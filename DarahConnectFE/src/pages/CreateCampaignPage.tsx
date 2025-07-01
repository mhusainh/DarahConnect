import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, CalendarIcon, AlertTriangleIcon, Building, Plus, Upload, X } from 'lucide-react';
import { BloodType, UrgencyLevel } from '../types';
import LocationPicker from '../components/LocationPicker';
import AddHospitalModal from '../components/AddHospitalModal';
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
    imageUrl: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isAddHospitalModalOpen, setIsAddHospitalModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const hospitalsApi = useApi<Hospital[]>();
  const notifications = useQuickNotifications();

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels: { value: UrgencyLevel; label: string; color: string }[] = [
    { value: 'low', label: 'Rendah', color: 'text-green-600' },
    { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
    { value: 'high', label: 'Mendesak', color: 'text-orange-600' },
    { value: 'critical', label: 'Sangat Mendesak', color: 'text-red-600' }
  ];

  // Fetch hospitals on component mount
  useEffect(() => {
    hospitalsApi.get('/hospital');
  }, []);

  // Update hospitals when API call completes
  useEffect(() => {
    if (hospitalsApi.data) {
      setHospitals(Array.isArray(hospitalsApi.data) ? hospitalsApi.data : []);
    }
  }, [hospitalsApi.data]);

  const handleInputChange = (field: keyof CreateCampaignForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
    
    if (!formData.title.trim()) newErrors.title = 'Judul campaign wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (formData.description.length < 50) newErrors.description = 'Deskripsi minimal 50 karakter';
    if (!formData.hospital_id || formData.hospital_id === 0) newErrors.hospital_id = 'Rumah sakit wajib dipilih';
    if (!formData.location.trim()) newErrors.location = 'Lokasi wajib diisi';
    if (formData.bloodType.length === 0) newErrors.bloodType = 'Pilih minimal satu golongan darah';
    if (formData.targetDonors < 10) newErrors.targetDonors = 'Target donor minimal 10 orang';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Nama kontak wajib diisi';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Nomor telepon wajib diisi';
    if (!formData.deadline) newErrors.deadline = 'Deadline wajib diisi';
    
    // Validate deadline is in the future
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate <= today) {
      newErrors.deadline = 'Deadline harus di masa depan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHospitalAdded = (newHospital: Hospital) => {
    setHospitals(prev => [...prev, newHospital]);
    setFormData(prev => ({ ...prev, hospital_id: newHospital.id }));
    setIsAddHospitalModalOpen(false);
    notifications.success('Berhasil!', 'Rumah sakit baru telah ditambahkan');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create FormData object
      const formDataPayload = new FormData();
      
      // Add form fields
      formDataPayload.append('title', formData.title);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('hospital_id', String(formData.hospital_id));
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
      
      console.log('🔧 Sending campaign as FormData:', Array.from(formDataPayload.entries()));
      
      // For now, simulate API call - replace with actual API call later
      setTimeout(() => {
        const newCampaign = {
          ...formData,
          id: Date.now().toString(),
          currentDonors: 0,
          createdAt: new Date().toISOString().split('T')[0],
          organizer: {
            name: localStorage.getItem('userName') || 'User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            verified: false,
            role: 'Individual'
          },
          imageFile: selectedImage ? selectedImage.name : null
        };
        
        console.log('New campaign created:', newCampaign);
        setIsLoading(false);
        notifications.success('Berhasil!', 'Campaign donor darah berhasil dibuat');
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Create campaign error:', error);
      setIsLoading(false);
      notifications.error('Error', 'Gagal membuat campaign. Silakan coba lagi.');
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
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Judul Campaign *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Bantuan Darah Darurat untuk Pasien Leukemia"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Campaign *
              </label>
              <textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Jelaskan secara detail tentang kebutuhan donor darah, kondisi pasien, dan urgensi campaign ini..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/500 karakter (minimal 50 karakter)
              </p>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Campaign (Opsional)
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Klik untuk upload gambar atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hingga 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            {/* Hospital & Location */}
            <div className="space-y-6">
              <div>
                <label htmlFor="hospital_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Rumah Sakit / Institusi *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    id="hospital_id"
                    value={formData.hospital_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'add-new') {
                        setIsAddHospitalModalOpen(true);
                      } else {
                        handleInputChange('hospital_id', parseInt(value));
                      }
                    }}
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.hospital_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Rumah Sakit</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.city}, {hospital.province}
                      </option>
                    ))}
                    <option value="add-new" className="font-medium text-blue-600">
                      + Tambah Rumah Sakit Baru
                    </option>
                  </select>
                </div>
                {errors.hospital_id && <p className="mt-1 text-sm text-red-600">{errors.hospital_id}</p>}
              </div>

              <div>
                <LocationPicker
                  value={formData.location}
                  onChange={(location) => handleInputChange('location', location)}
                  error={errors.location}
                  required
                />
              </div>
            </div>

            {/* Blood Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Golongan Darah yang Dibutuhkan *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {bloodTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleBloodTypeToggle(type)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.bloodType.includes(type)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.bloodType && <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>}
            </div>

            {/* Target & Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetDonors" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Jumlah Donor *
                </label>
                <input
                  id="targetDonors"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.targetDonors}
                  onChange={(e) => handleInputChange('targetDonors', e.target.value === '' ? 10 : parseInt(e.target.value) || 10)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.targetDonors ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.targetDonors && <p className="mt-1 text-sm text-red-600">{errors.targetDonors}</p>}
              </div>

              <div>
                <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Urgensi *
                </label>
                <select
                  id="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={(e) => handleInputChange('urgencyLevel', e.target.value as UrgencyLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kontak Person *
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dr. Sarah Wijaya"
                />
                {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+62 21 1234567"
                  />
                </div>
                {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Deadline Campaign *
              </label>
              <div className="relative max-w-md">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="deadline"
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.deadline ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
            </div>

            {/* Preview Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Preview Campaign</h3>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Judul Campaign'}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                    formData.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    formData.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    formData.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <AlertTriangleIcon className="w-3 h-3 mr-1" />
                    {urgencyLevels.find(l => l.value === formData.urgencyLevel)?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {formData.description.substring(0, 100)}{formData.description.length > 100 ? '...' : ''}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {formData.bloodType.map((type, index) => (
                    <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <p>📍 {hospitals.find(h => h.id === formData.hospital_id)?.name || 'Pilih rumah sakit'}, {formData.location}</p>
                  <p>🎯 Target: {formData.targetDonors} donor</p>
                  <p>📞 {formData.contactPerson} - {formData.contactPhone}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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