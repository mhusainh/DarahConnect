import React, { useState, useEffect } from 'react';
import { UserIcon, HeartIcon, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon } from 'lucide-react';
import { BloodDropLoader } from '../components/ui/LoadingComponents';
import { provinsiData, getKotaByProvinsi, type Provinsi, type Kota } from '../data/wilayahIndonesia';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface FormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  province: string;
  
  // Step 2: Medical Info
  bloodType: string;
  weight: string;
  height: string;
  medicalHistory: string[];
  allergies: string;
  medications: string;
  lastDonation: string;
  
  // Step 3: Preferences
  preferredHospital: string;
  emergencyContact: string;
  emergencyPhone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

const EnhancedDonorRegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCities, setAvailableCities] = useState<Kota[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    province: '',
    bloodType: '',
    weight: '',
    height: '',
    medicalHistory: [],
    allergies: '',
    medications: '',
    lastDonation: '',
    preferredHospital: '',
    emergencyContact: '',
    emergencyPhone: '',
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ['Informasi Pribadi', 'Data Medis', 'Preferensi'];

  const bloodTypes = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
  ];

  const provinsiOptions = provinsiData.map(provinsi => ({
    value: provinsi.id,
    label: provinsi.nama
  }));

  const hospitalOptions = [
    { value: 'rs-hasan-sadikin', label: 'RS Hasan Sadikin' },
    { value: 'rs-advent', label: 'RS Advent' },
    { value: 'rs-santo-borromeus', label: 'RS Santo Borromeus' },
    { value: 'rs-al-islam', label: 'RS Al Islam' },
    { value: 'rs-rajawali', label: 'RS Rajawali' },
    { value: 'rs-permata-hijau', label: 'RS Permata Hijau' },
  ];

  const medicalConditions = [
    'Hipertensi',
    'Diabetes',
    'Jantung',
    'Anemia',
    'Hepatitis',
    'HIV/AIDS',
    'Tidak ada'
  ];

  // Update cities when province changes
  useEffect(() => {
    if (formData.province) {
      const cities = getKotaByProvinsi(formData.province);
      setAvailableCities(cities);
      // Reset city selection when province changes
      if (formData.city && !cities.find(city => city.id === formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      // Reset city when province is cleared
      if (formData.city) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    }
  }, [formData.province, formData.city]);

  const cityOptions = availableCities.map(kota => ({
    value: kota.id,
    label: kota.nama
  }));

  const updateFormData = (field: string, value: any) => {
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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.fullName) newErrors.fullName = 'Nama lengkap wajib diisi';
      if (!formData.email) newErrors.email = 'Email wajib diisi';
      if (!formData.phone) newErrors.phone = 'Nomor telepon wajib diisi';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Tanggal lahir wajib diisi';
      if (!formData.gender) newErrors.gender = 'Jenis kelamin wajib diisi';
      if (!formData.address) newErrors.address = 'Alamat wajib diisi';
      if (!formData.city) newErrors.city = 'Kota wajib diisi';
      if (!formData.province) newErrors.province = 'Provinsi wajib diisi';
    } else if (step === 1) {
      if (!formData.bloodType) newErrors.bloodType = 'Golongan darah wajib diisi';
      if (!formData.weight) newErrors.weight = 'Berat badan wajib diisi';
      if (!formData.height) newErrors.height = 'Tinggi badan wajib diisi';
    } else if (step === 2) {
      if (!formData.preferredHospital) newErrors.preferredHospital = 'Rumah sakit pilihan wajib diisi';
      if (!formData.emergencyContact) newErrors.emergencyContact = 'Kontak darurat wajib diisi';
      if (!formData.emergencyPhone) newErrors.emergencyPhone = 'Nomor darurat wajib diisi';
      if (!formData.agreeTerms) newErrors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
      if (!formData.agreePrivacy) newErrors.agreePrivacy = 'Anda harus menyetujui kebijakan privasi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSubmitting(false);
    alert('Pendaftaran berhasil! Selamat datang di komunitas donor darah.');
  };

  const calculateProgress = () => {
    let completed = 0;
    const total = 3;
    
    // Check step 1 completion
    if (formData.fullName && formData.email && formData.phone && formData.dateOfBirth && 
        formData.gender && formData.address && formData.city && formData.province) {
      completed++;
    }
    
    // Check step 2 completion
    if (formData.bloodType && formData.weight && formData.height) {
      completed++;
    }
    
    // Check step 3 completion
    if (formData.preferredHospital && formData.emergencyContact && formData.emergencyPhone && 
        formData.agreeTerms && formData.agreePrivacy) {
      completed++;
    }
    
    return { completed, total };
  };

  const progress = calculateProgress();

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Informasi Personal</h3>
                  <p className="text-sm text-gray-600">Masukkan data pribadi Anda</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MailIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="contoh@email.com"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
                
                {/* Row 2: Phone and Birth Date */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                  </div>
                </div>
                
                {/* Row 3: Gender */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateFormData('gender', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      {genderOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                  </div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                  <MapPinIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Informasi Alamat</h3>
                  <p className="text-sm text-gray-600">Masukkan alamat tempat tinggal Anda</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Full Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan/Desa"
                      rows={3}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                
                {/* Province and City */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => updateFormData('province', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Pilih provinsi</option>
                      {provinsiOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      disabled={!formData.province || cityOptions.length === 0}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.province ? "Pilih provinsi terlebih dahulu" : cityOptions.length === 0 ? "Tidak ada data kota" : "Pilih kota/kabupaten"}
                      </option>
                      {cityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            {/* Blood Type Section */}
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Informasi Darah</h3>
                  <p className="text-sm text-gray-600">Data kesehatan dan golongan darah</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Golongan Darah <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => updateFormData('bloodType', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="">Pilih golongan darah</option>
                    {bloodTypes.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.bloodType && <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Berat Badan (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateFormData('weight', e.target.value)}
                    placeholder="Contoh: 65"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinggi Badan (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', e.target.value)}
                    placeholder="Contoh: 170"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mr-4">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Riwayat Kesehatan</h3>
                  <p className="text-sm text-gray-600">Informasi kondisi medis Anda</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Riwayat Penyakit <span className="text-gray-500">(pilih yang sesuai)</span>
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {medicalConditions.map((condition) => (
                      <label key={condition} className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.medicalHistory.includes(condition)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData('medicalHistory', [...formData.medicalHistory, condition]);
                            } else {
                              updateFormData('medicalHistory', formData.medicalHistory.filter(item => item !== condition));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Allergies and Medications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergi (opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => updateFormData('allergies', e.target.value)}
                      placeholder="Contoh: Seafood, Obat tertentu"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Obat yang Dikonsumsi (opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.medications}
                      onChange={(e) => updateFormData('medications', e.target.value)}
                      placeholder="Contoh: Vitamin, Suplemen"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
                
                {/* Last Donation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terakhir Donor Darah (opsional)
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.lastDonation}
                        onChange={(e) => updateFormData('lastDonation', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Hospital Preference Section */}
            <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Preferensi Donor</h3>
                  <p className="text-sm text-gray-600">Pilihan rumah sakit dan kontak darurat</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Hospital Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rumah Sakit Pilihan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.preferredHospital}
                      onChange={(e) => updateFormData('preferredHospital', e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Pilih rumah sakit</option>
                      {hospitalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.preferredHospital && <p className="mt-1 text-sm text-red-600">{errors.preferredHospital}</p>}
                  </div>
                  <div></div>
                </div>
                
                {/* Emergency Contacts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kontak Darurat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                        placeholder="Nama lengkap kontak darurat"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      />
                    </div>
                    {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Darurat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      />
                    </div>
                    {errors.emergencyPhone && <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mr-4">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Preferensi Notifikasi</h3>
                  <p className="text-sm text-gray-600">Pilih cara Anda ingin menerima notifikasi</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-sm text-gray-600 mt-1">Terima notifikasi via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications.email}
                        onChange={(e) => updateFormData('notifications', { ...formData.notifications, email: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">SMS</h4>
                      <p className="text-sm text-gray-600 mt-1">Terima notifikasi via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications.sms}
                        onChange={(e) => updateFormData('notifications', { ...formData.notifications, sms: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Push</h4>
                      <p className="text-sm text-gray-600 mt-1">Terima push notification</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications.push}
                        onChange={(e) => updateFormData('notifications', { ...formData.notifications, push: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center mr-4">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Syarat dan Ketentuan</h3>
                  <p className="text-sm text-gray-600">Persetujuan yang diperlukan untuk melanjutkan</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <label className="flex items-start space-x-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => updateFormData('agreeTerms', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700">
                        Saya menyetujui <button type="button" className="text-indigo-600 hover:underline font-medium">syarat dan ketentuan</button> yang berlaku
                      </span>
                      {errors.agreeTerms && <p className="text-red-600 text-xs mt-1">{errors.agreeTerms}</p>}
                    </div>
                  </label>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <label className="flex items-start space-x-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreePrivacy}
                      onChange={(e) => updateFormData('agreePrivacy', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700">
                        Saya menyetujui <button type="button" className="text-indigo-600 hover:underline font-medium">kebijakan privasi</button> dan penggunaan data pribadi
                      </span>
                      {errors.agreePrivacy && <p className="text-red-600 text-xs mt-1">{errors.agreePrivacy}</p>}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
              <HeartIcon className="w-10 h-10 text-white fill-current" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Daftar Sebagai Donor Darah
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan komunitas hero yang siap menyelamatkan nyawa. Setiap donasi Anda berharga.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Progress Pendaftaran</h3>
                <span className="text-sm text-gray-600">Langkah {currentStep + 1} dari {steps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{progress.completed} dari {progress.total} bagian selesai</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-center max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep 
                      ? 'bg-red-500 border-red-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  } font-semibold transition-all duration-300`}>
                    {index + 1}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    index <= currentStep ? 'text-red-600' : 'text-gray-400'
                  } transition-colors duration-300`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-red-500' : 'bg-gray-300'
                    } transition-colors duration-300`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {steps[currentStep]}
                </h2>
                <p className="text-gray-600 text-lg">
                  {currentStep === 0 && 'Masukkan informasi pribadi dan alamat Anda dengan lengkap'}
                  {currentStep === 1 && 'Berikan informasi medis untuk memastikan keamanan donasi'}
                  {currentStep === 2 && 'Tentukan preferensi dan setujui syarat yang berlaku'}
                </p>
              </div>

              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                    currentStep === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  }`}
                >
                  Sebelumnya
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Selanjutnya
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <BloodDropLoader />
                        <span>Mendaftar...</span>
                      </>
                    ) : (
                      <span>Daftar Sekarang</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Selamatkan Nyawa</h3>
              <p className="text-gray-600">
                Satu donasi dapat menyelamatkan hingga 3 nyawa
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fleksible</h3>
              <p className="text-gray-600">
                Donor sesuai jadwal dan lokasi yang nyaman
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Komunitas</h3>
              <p className="text-gray-600">
                Bergabung dengan komunitas donor yang peduli
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EnhancedDonorRegisterPage; 