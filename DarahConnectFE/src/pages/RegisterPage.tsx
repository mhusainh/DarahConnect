import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshakeIcon, EyeIcon, EyeOffIcon, UserIcon, MailIcon, LockIcon, PhoneIcon } from 'lucide-react';
import { BloodType } from '../types';
import LocationPicker from '../components/LocationPicker';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bloodType: BloodType;
  age: number;
  weight: number;
  location: string;
  emergencyContact: string;
  agreedToTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  bloodType?: string;
  age?: string;
  weight?: string;
  location?: string;
  emergencyContact?: string;
  agreedToTerms?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodType: 'O+',
    age: 18,
    weight: 50,
    location: '',
    emergencyContact: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sesuai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
    
    if (formData.age < 17 || formData.age > 65) newErrors.age = 'Usia harus antara 17-65 tahun';
    if (formData.weight < 45) newErrors.weight = 'Berat badan minimal 45 kg';
    if (!formData.location.trim()) newErrors.location = 'Lokasi wajib diisi';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Kontak darurat wajib diisi';
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'Anda harus menyetujui syarat dan ketentuan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('authMethod', 'email');
      setIsLoading(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleGoogleSuccess = (user: any) => {
    console.log('Google register successful:', user);
    // Auto-fill form data from Google account
    setFormData(prev => ({
      ...prev,
      name: user.name,
      email: user.email
    }));
    
    // Show success modal immediately for Google users
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  };

  const handleGoogleError = (error: any) => {
    console.error('Google register error:', error);
    setErrors({ email: 'Gagal mendaftar dengan Google. Silakan coba lagi.' });
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  const handleGoToDonorRegister = () => {
    setShowSuccessModal(false);
    navigate('/donor-register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <HeartHandshakeIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Daftar Akun Pengguna
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Buat akun Anda untuk bergabung dengan komunitas DarahConnect
          </p>
          
          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <HeartHandshakeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Langkah selanjutnya:</strong> Setelah membuat akun, Anda dapat melengkapi profil donor yang lebih detail 
                  melalui menu "Daftar Donor" untuk mulai mendonorkan darah.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 max-w-xs ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            <span>Akun</span>
            <span>Profil Donor</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Akun</h3>
                
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="contoh@email.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="08123456789"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Minimal 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ulangi password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Atau daftar dengan</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <GoogleSignInButton
                  text="Daftar dengan Google"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Step 2: Donor Profile */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profil Donor</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Blood Type */}
                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-2">
                      Golongan Darah
                    </label>
                    <select
                      id="bloodType"
                      value={formData.bloodType}
                      onChange={(e) => handleInputChange('bloodType', e.target.value as BloodType)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Usia
                    </label>
                    <input
                      id="age"
                      type="number"
                      min="17"
                      max="65"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                  </div>

                  {/* Weight */}
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Berat Badan (kg)
                    </label>
                    <input
                      id="weight"
                      type="number"
                      min="45"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.weight ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <LocationPicker
                    value={formData.location}
                    onChange={(location) => handleInputChange('location', location)}
                    error={errors.location}
                    required
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Kontak Darurat
                  </label>
                  <input
                    id="emergencyContact"
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nomor telepon keluarga/kerabat"
                  />
                  {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start">
                  <input
                    id="agreedToTerms"
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreedToTerms" className="text-sm text-gray-700">
                    Saya menyetujui{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline">
                      syarat dan ketentuan
                    </Link>{' '}
                    serta{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline">
                      kebijakan privasi
                    </Link>
                  </label>
                </div>
                {errors.agreedToTerms && <p className="text-sm text-red-600">{errors.agreedToTerms}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Lanjutkan
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Mendaftar...
                      </div>
                    ) : (
                      'Daftar Sebagai Donor'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Masuk sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshakeIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Selamat! Akun Berhasil Dibuat
              </h3>
              
              <p className="text-gray-600 mb-6">
                Halo {formData.name}! Akun Anda telah berhasil dibuat. 
                Sekarang Anda dapat melengkapi profil donor untuk mulai mendonorkan darah.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleGoToDonorRegister}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  🩸 Lengkapi Profil Donor Sekarang
                </button>
                
                <button
                  onClick={handleGoToDashboard}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Ke Dashboard
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Anda dapat melengkapi profil donor kapan saja melalui menu "Daftar Donor"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage; 