import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApi } from '../hooks/useApi';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = useApi();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string; general?: string}>({});
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Get token from URL params
  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      validateToken(resetToken);
    } else {
      setTokenValid(false);
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      // Validate token format - basic JWT format check
      if (token && token.split('.').length === 3) {
        // Token appears to be valid JWT format
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenValid(false);
    }
  };

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Harus mengandung huruf besar');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Harus mengandung huruf kecil');
    }
    if (!/\d/.test(password)) {
      errors.push('Harus mengandung angka');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const passwordErrors = validatePassword(password);
    const newErrors: {password?: string; confirmPassword?: string} = {};

    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password dan konfirmasi password tidak sama';
    }

    if (!password.trim()) {
      newErrors.password = 'Password wajib diisi';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Call reset password API dengan token dari URL parameter
      const response = await api.post(`/reset-password?token=${token}`, {
        password: password
      });
      
      if (response && !response.error) {
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password berhasil direset! Silakan login dengan password baru.' } 
          });
        }, 3000);
      } else {
        // Handle error response dari API
        const errorMessage = response?.error || response?.message || 'Gagal mereset password. Token mungkin sudah expired.';
        setErrors({ general: errorMessage });
      }
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi atau minta link reset password baru.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password);
    const strength = 4 - errors.length; // Updated to 4 total requirements
    
    if (strength <= 1) return { label: 'Lemah', color: 'bg-red-500', width: '25%' };
    if (strength <= 2) return { label: 'Sedang', color: 'bg-yellow-500', width: '50%' };
    if (strength <= 3) return { label: 'Baik', color: 'bg-blue-500', width: '75%' };
    return { label: 'Kuat', color: 'bg-green-600', width: '100%' };
  };

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memverifikasi link reset password...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Invalid token
  if (tokenValid === false) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Tidak Valid</h2>
              <p className="text-gray-600 mb-6">
                Link reset password tidak valid atau sudah expired. Silakan minta link baru.
              </p>
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full inline-block bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                >
                  Minta Link Baru
                </Link>
                <Link
                  to="/login"
                  className="w-full inline-block text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                  Kembali ke Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Success state
  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Berhasil Direset!</h2>
              <p className="text-gray-600 mb-6">
                Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login.
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Mengalihkan ke login...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Main reset password form
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">
              Masukkan password baru Anda. Pastikan password yang kuat dan aman.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan password baru"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Kekuatan Password:</span>
                      <span className={`text-xs font-medium ${
                        getPasswordStrength(password).color.replace('bg-', 'text-')
                      }`}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                        style={{ width: getPasswordStrength(password).width }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Konfirmasi password baru"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Persyaratan Password:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={`flex items-center space-x-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`w-3 h-3 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Minimal 8 karakter</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Huruf besar (A-Z)</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`w-3 h-3 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Huruf kecil (a-z)</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                    <CheckCircle className={`w-3 h-3 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Angka (0-9)</span>
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mereset Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            {/* Navigation */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPasswordPage; 