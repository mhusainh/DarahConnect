import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, X, Lock, Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApi } from '../hooks/useApi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const api = useApi();
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    if (!validateEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await api.post('/request-reset-password', {email});
      setEmailSent(true);
      setShowModal(true);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEmailSent(false);
    setEmail('');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Lupa Password?</h2>
            <p className="text-gray-600">
              Tidak masalah! Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan email Anda"
                    disabled={loading}
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Link Reset Password
                  </>
                )}
              </button>
            </form>

            {/* Navigation */}
            <div className="mt-6 flex flex-col space-y-3">
              <Link
                to="/login"
                className="flex items-center justify-center text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Login
              </Link>
              
              <div className="text-center">
                <span className="text-gray-600 text-sm">Belum punya akun? </span>
                <Link 
                  to="/register" 
                  className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                >
                  Daftar di sini
                </Link>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Jika Anda tidak menerima email dalam 5 menit, periksa folder spam atau 
              <button 
                onClick={() => setShowModal(true)} 
                className="text-red-600 hover:text-red-700 font-medium ml-1 transition-colors"
              >
                coba lagi
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && emailSent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Terkirim!</h3>
              <p className="text-gray-600 mb-4">
                Kami telah mengirimkan link reset password ke:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                Klik link dalam email untuk reset password Anda. Link akan expired dalam 1 jam.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={closeModal}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                >
                  Mengerti
                </button>
                
                <button
                  onClick={() => {
                    closeModal();
                    // You can add resend functionality here
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                  Kirim Ulang Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ForgotPasswordPage; 