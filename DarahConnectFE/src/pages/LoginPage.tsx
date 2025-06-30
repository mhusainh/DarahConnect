import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshakeIcon, EyeIcon, EyeOffIcon, MailIcon, LockIcon, AlertCircleIcon, ShieldAlertIcon } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useApi } from '../hooks/useApi';
import { decodeJWTToken, saveAuthData } from '../utils/jwt';
import { debugConsole } from '../config/api';

interface LoginApiData {
  email: string;
  password: string;
}

interface LoginResponse {
    token: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginApi = useApi<LoginResponse>();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);

  // Get redirect info from location state
  const from = location.state?.from || '/dashboard';
  const message = location.state?.message;

  // Check for stored 401 error message on component mount
  useEffect(() => {
    try {
      const loginError = localStorage.getItem('loginError');
      const loginErrorTime = localStorage.getItem('loginErrorTime');
      
      if (loginError && loginErrorTime) {
        const errorTime = parseInt(loginErrorTime);
        const now = Date.now();
        
        // Only show error if it's less than 5 minutes old
        if (now - errorTime < 5 * 60 * 1000) {
          setUnauthorizedMessage(loginError);
          debugConsole.log('Displaying 401 error message', { loginError, timeAgo: now - errorTime });
        }
        
        // Clear stored error message after displaying
        localStorage.removeItem('loginError');
        localStorage.removeItem('loginErrorTime');
      }
    } catch (error) {
      debugConsole.error('Error reading login error from localStorage', error);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear unauthorized message when user starts typing
    if (unauthorizedMessage) {
      setUnauthorizedMessage(null);
    }
  };

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Clear unauthorized message when submitting
    setUnauthorizedMessage(null);
    
    // Format data sesuai dengan API backend
    const apiData: LoginApiData = {
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await loginApi.post('/login', apiData);
      if (response.data?.token) {
        const token = response.data?.token
        if (token) {
          // Decode JWT untuk mendapatkan user data
          const userData = decodeJWTToken(token);
          
          if (userData) {
            // Simpan auth data menggunakan utility function
            saveAuthData(token, userData);
            localStorage.setItem('authMethod', 'email');
            
            console.log('✅ Login berhasil:', userData);
            
            // Redirect to original destination or dashboard
            navigate(from, { replace: true });
          } else {
            // Token invalid atau expired
            setErrors({ 
              email: 'Token login tidak valid. Silakan coba lagi.'
            });
          }
        } else {
          setErrors({ 
            email: 'Token tidak ditemukan dalam response. Silakan coba lagi.'
          });
        }
      } else {
        // Handle error dari API
        const errorMessage = response.error || 'Email atau password salah. Silakan coba lagi.';
        setErrors({ 
          email: errorMessage
        });
      }
    } catch (error: any) {
      setErrors({ 
        email: 'Terjadi kesalahan jaringan. Silakan coba lagi.' 
      });
    }
  };

  const handleGoogleSuccess = (user: any) => {
    console.log('Google login successful:', user);
    // Redirect to original destination or dashboard
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 500);
  };

  const handleGoogleError = (error: any) => {
    console.error('Google login error:', error);
    setErrors({ email: 'Gagal masuk dengan Google. Silakan coba lagi.' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <HeartHandshakeIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Masuk ke DarahConnect
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bergabunglah dengan komunitas hero penyelamat nyawa
          </p>
        </div>

        {/* 401 Unauthorized Message */}
        {unauthorizedMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ShieldAlertIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Sesi Berakhir</h3>
                <p className="text-sm text-red-700">{unauthorizedMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Required Message */}
        {message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{message}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan email Anda"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

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
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan password Anda"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginApi.loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginApi.loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Atau</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={loginApi.loading}
            />

            {/* Demo Accounts */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Demo Accounts:</p>
              <div className="text-xs text-blue-600 space-y-1">
                <p><strong>Donor:</strong> donor@donorkita.id / password123</p>
                <p><strong>Admin:</strong> admin@donorkita.id / password123</p>
              </div>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 