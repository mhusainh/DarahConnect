import React, { useState } from 'react';
import { XIcon, HeartIcon, UserIcon, PhoneIcon, CalendarIcon, MapPinIcon } from 'lucide-react';
import { BloodCampaign, BloodType } from '../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: BloodCampaign | null;
  onSubmit?: (data: DonationFormData) => void;
}

interface DonationFormData {
  campaignId: string;
  donorName: string;
  email: string;
  phone: string;
  bloodType: BloodType;
  age: number;
  weight: number;
  lastDonation: string;
  emergencyContact: string;
  medicalHistory: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  agreedToTerms: boolean;
}

interface FormErrors {
  donorName?: string;
  email?: string;
  phone?: string;
  age?: string;
  weight?: string;
  emergencyContact?: string;
  preferredDate?: string;
  preferredTime?: string;
  agreedToTerms?: string;
}

const DonationModal: React.FC<DonationModalProps> = ({ 
  isOpen, 
  onClose, 
  campaign, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    campaignId: campaign?.id || '',
    donorName: '',
    email: '',
    phone: '',
    bloodType: 'O+',
    age: 18,
    weight: 50,
    lastDonation: '',
    emergencyContact: '',
    medicalHistory: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    agreedToTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00'
  ];

  if (!isOpen || !campaign) return null;

  const validateStep1 = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.donorName.trim()) newErrors.donorName = 'Nama wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    if (formData.age < 17 || formData.age > 65) newErrors.age = 'Usia harus antara 17-65 tahun';
    if (formData.weight < 45) newErrors.weight = 'Berat badan minimal 45 kg';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Kontak darurat wajib diisi';
    if (!formData.preferredDate) newErrors.preferredDate = 'Tanggal donasi wajib dipilih';
    if (!formData.preferredTime) newErrors.preferredTime = 'Waktu donasi wajib dipilih';
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'Anda harus menyetujui syarat dan ketentuan';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      onSubmit?.({
        ...formData,
        campaignId: campaign.id
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof DonationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <HeartIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Daftar Donasi Darah</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Campaign Info */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {campaign.hospital}, {campaign.location}
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Deadline: {new Date(campaign.deadline).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="p-6 border-b">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Informasi Pribadi</span>
            <span>Jadwal & Konfirmasi</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.donorName}
                    onChange={(e) => handleInputChange('donorName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.donorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.donorName && <p className="mt-1 text-sm text-red-600">{errors.donorName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="contoh@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="08123456789"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Golongan Darah *
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value as BloodType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usia *
                  </label>
                  <input
                    type="number"
                    min="17"
                    max="65"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value === '' ? 17 : parseInt(e.target.value) || 17)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Berat Badan (kg) *
                  </label>
                  <input
                    type="number"
                    min="45"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value === '' ? 45 : parseInt(e.target.value) || 45)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Donor Terakhir
                </label>
                <input
                  type="date"
                  value={formData.lastDonation}
                  onChange={(e) => handleInputChange('lastDonation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Kosongkan jika belum pernah donor darah
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Jadwal & Konfirmasi</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontak Darurat *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nomor telepon keluarga/kerabat"
                />
                {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Donasi *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      max={campaign.deadline}
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer ${
                        errors.preferredDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                  {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Donasi *
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.preferredTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih waktu</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.preferredTime && <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Riwayat Penyakit
                </label>
                <textarea
                  rows={3}
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tulis riwayat penyakit atau alergi jika ada..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tambahkan catatan jika ada..."
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                  className="mt-1 mr-3"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Saya menyetujui{' '}
                  <a href="#terms" className="text-primary-600 hover:underline">
                    syarat dan ketentuan
                  </a>{' '}
                  serta memberikan persetujuan untuk mendonorkan darah
                </label>
              </div>
              {errors.agreedToTerms && <p className="text-sm text-red-600">{errors.agreedToTerms}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
              )}
            </div>
            
            <div>
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Lanjutkan
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Daftar Donasi
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationModal;