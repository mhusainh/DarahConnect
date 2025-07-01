import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { decodeJWTToken, saveAuthData } from '../utils/jwt';
import { useApi } from '../hooks/useApi';
import LocationPicker from '../components/LocationPicker';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { put } = useApi<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    birth_date: '',
    blood_type: '',
    location: '',
    address: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Ambil token dari query string
  useEffect(() => {
    console.log('🔗 OAuth Callback - Processing OAuth callback...');
    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      console.error('❌ OAuth Callback - No token found in URL parameters');
      setError('Token tidak ditemukan');
      setLoading(false);
      return;
    }
    
    console.log('🔑 OAuth Callback - Token received:', token.substring(0, 20) + '...');
    
    const decoded = decodeJWTToken(token);
    if (!decoded) {
      console.error('❌ OAuth Callback - Failed to decode token');
      setError('Token tidak valid');
      setLoading(false);
      return;
    }
    
    console.log('👤 OAuth Callback - Decoded user data:', {
      name: decoded.name,
      email: decoded.email,
      is_new: decoded.is_new
    });
    
    setUserData(decoded);
    setIsNew(Boolean(decoded.is_new));
    
    // Simpan token untuk digunakan di API calls
    localStorage.setItem('authToken', token);
    console.log('💾 OAuth Callback - Auth token saved to localStorage');
    
    setLoading(false);

    // Jika user lama, langsung login
    if (!decoded.is_new) {
      console.log('🎯 OAuth Callback - Existing user, redirecting to dashboard');
      saveAuthData(token, decoded);
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      console.log('📝 OAuth Callback - New user, showing profile completion form');
      // User baru, isi form
      setForm({
        name: decoded.name || '',
        phone: '',
        gender: '',
        birth_date: '',
        blood_type: '',
        location: '',
        address: '',
      });
    }
  }, [location, navigate]);

  // Handle input form
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Submit form user baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!form.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi';
    if (!form.gender) newErrors.gender = 'Jenis kelamin wajib dipilih';
    if (!form.birth_date) newErrors.birth_date = 'Tanggal lahir wajib diisi';
    if (!form.blood_type) newErrors.blood_type = 'Golongan darah wajib dipilih';
    if (!form.address.trim()) newErrors.location = 'Lokasi wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Ambil token yang sudah disimpan dari OAuth
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Token autentikasi tidak ditemukan. Silakan login ulang.');
      setLoading(false);
      return;
    }

    console.log('🔑 OAuth Callback - Using auth token for API call:', authToken.substring(0, 20) + '...');
    
    // Parse location to get city and province
    const [city, province] = form.location.includes(',') 
      ? form.location.split(',').map(s => s.trim())
      : [form.location, ''];
    
    // Kirim data ke backend (update profile)
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('gender', form.gender);
    formData.append('birth_date', form.birth_date);
    formData.append('blood_type', form.blood_type);
    formData.append('province', province);
    formData.append('city', city);

    console.log('📝 OAuth Callback - Sending profile data:', {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      birth_date: form.birth_date,
      blood_type: form.blood_type,
      province,
      city
    });

    try {
      // Update profile endpoint dengan token yang sudah ada
      const res = await put('/user/profile', formData);
      
      console.log('✅ OAuth Callback - Profile update response:', res);
      
      if (res.success) {
        // Simpan data login dengan token dan user data yang sudah ada
        saveAuthData(authToken, userData);
        
        console.log('🎉 OAuth Callback - Profile completed, redirecting to dashboard');
        
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error || 'Gagal menyimpan data');
        console.error('❌ OAuth Callback - Profile update failed:', res.error);
      }
    } catch (error: any) {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
      console.error('❌ OAuth Callback - Network error:', error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
        <span className="text-gray-600 text-base">Memproses login Google...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded">{error}</div>
      </div>
    );
  }

  if (isNew) {
    // Form user baru
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Lengkapi Data Pribadi</h2>
            <p className="mt-2 text-sm text-gray-600">
              Selamat datang! Silakan lengkapi data Anda untuk melanjutkan
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor HP
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="08123456789"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih</option>
                    <option value="Male">Laki-laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>

                {/* Birth Date */}
                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    id="birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={e => handleChange('birth_date', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.birth_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.birth_date && <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>}
                </div>
              </div>

              {/* Blood Type */}
              <div>
                <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Golongan Darah
                </label>
                <select
                  id="blood_type"
                  value={form.blood_type}
                  onChange={e => handleChange('blood_type', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.blood_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {errors.blood_type && <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>}
              </div>

              {/* Location Picker */}
              <div>
                <LocationPicker
                  value={form.location}
                  onChange={value => handleChange('location', value)}
                  error={errors.location}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    'Simpan & Lanjutkan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // User lama: loading sudah handle redirect
  return null;
};

export default OAuthCallbackPage;