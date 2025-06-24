import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, CalendarIcon, AlertTriangleIcon } from 'lucide-react';
import { BloodType, UrgencyLevel } from '../types';
import LocationPicker from '../components/LocationPicker';

interface CreateCampaignForm {
  title: string;
  description: string;
  hospital: string;
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
  hospital?: string;
  location?: string;
  bloodType?: string;
  targetDonors?: string;
  contactPerson?: string;
  contactPhone?: string;
  deadline?: string;
}

const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignForm>({
    title: '',
    description: '',
    hospital: '',
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

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels: { value: UrgencyLevel; label: string; color: string }[] = [
    { value: 'low', label: 'Rendah', color: 'text-green-600' },
    { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
    { value: 'high', label: 'Mendesak', color: 'text-orange-600' },
    { value: 'critical', label: 'Sangat Mendesak', color: 'text-red-600' }
  ];

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

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Judul campaign wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (formData.description.length < 50) newErrors.description = 'Deskripsi minimal 50 karakter';
    if (!formData.hospital.trim()) newErrors.hospital = 'Nama rumah sakit wajib diisi';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
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
        }
      };
      
      console.log('New campaign created:', newCampaign);
      setIsLoading(false);
      alert('Campaign berhasil dibuat!');
      navigate('/dashboard');
    }, 2000);
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

            {/* Hospital & Location */}
            <div className="space-y-6">
              <div>
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                  Rumah Sakit / Institusi *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="hospital"
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => handleInputChange('hospital', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.hospital ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="RS Cipto Mangunkusumo"
                  />
                </div>
                {errors.hospital && <p className="mt-1 text-sm text-red-600">{errors.hospital}</p>}
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
                  onChange={(e) => handleInputChange('targetDonors', parseInt(e.target.value))}
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
                  <p>📍 {formData.hospital}, {formData.location}</p>
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
    </div>
  );
};

export default CreateCampaignPage; 