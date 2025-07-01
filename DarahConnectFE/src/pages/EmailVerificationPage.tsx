import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuickNotifications } from '../contexts/NotificationContext';
import { CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-react';
import { decodeJWTToken, saveAuthData } from '../utils/jwt';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notifications = useQuickNotifications();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const hasVerified = useRef(false); // Prevent multiple verification attempts
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent multiple verification calls
    if (hasVerified.current) return;
    
    const verifyEmail = async () => {
      hasVerified.current = true;
      
      // Ambil token dari URL parameter
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Token verifikasi tidak ditemukan. Periksa kembali link di email Anda.');
        notifications.error('Token Tidak Valid', 'Link verifikasi tidak lengkap');
        return;
      }

      try {
        // Hit API verifikasi email
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('🔧 API Response:', { 
          status: response.status, 
          ok: response.ok,
          data: data
        });

        // Parsing response sesuai format backend
        const isSuccess = response.ok && data.meta?.code === 200;
        
        if (isSuccess) {
          // Ambil token dari response
          const token = data.data?.token;

          console.log('✅ Verification Success, Token received:', !!token);

                    if (token) {
            // Decode JWT token untuk mendapatkan data user
            const userData = decodeJWTToken(token);

            if (userData) {
              console.log('🔓 Decoded JWT successfully:', userData);

              // Simpan token dan user data ke localStorage
              saveAuthData(token, userData);

              setVerificationStatus('success');
              setMessage('Email berhasil diverifikasi! Anda akan diarahkan ke beranda dalam beberapa detik...');
              
              // Show notification only once
              notifications.success('Verifikasi Berhasil', `Selamat datang, ${userData.name}! Email Anda telah diverifikasi dan Anda sudah login`);

              // Start countdown
              startCountdown(() => {
                navigate('/', { replace: true }); // Ke beranda
              });

            } else {
              console.error('❌ JWT Decode failed or token expired');
              
              // Fallback: simpan token tanpa decode
              localStorage.setItem('authToken', token);
              localStorage.setItem('isLoggedIn', 'true');
              
              setVerificationStatus('success');
              setMessage('Email berhasil diverifikasi! Anda akan diarahkan ke beranda dalam beberapa detik...');
              
              notifications.success('Verifikasi Berhasil', 'Email Anda telah diverifikasi dan Anda sudah login');

              startCountdown(() => {
                navigate('/', { replace: true });
              });
            }
          } else {

               setVerificationStatus('success');
              setMessage('Email berhasil diverifikasi! Anda akan diarahkan ke halaman login  dalam beberapa detik...');
              notifications.success('Verifikasi Berhasil', 'Email Anda telah diverifikasi');
              startCountdown(() => {
                navigate('/login', { replace: true });
              });
          }
        } else {
          // Handle error dari API
          const errorMessage = data.meta?.message || data.message || data.error || `Verifikasi email gagal (Status: ${response.status})`;
          console.log('❌ Verification Failed:', { errorMessage, responseData: data });
          
          setVerificationStatus('error');
          setMessage(errorMessage);
          notifications.error('Verifikasi Gagal', errorMessage);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Terjadi kesalahan saat verifikasi email. Silakan coba lagi.');
        notifications.error('Koneksi Bermasalah', 'Tidak dapat terhubung ke server');
      }
    };

    verifyEmail();
  }, []); // Empty dependency array to run only once

  // Fungsi untuk memulai countdown
  const startCountdown = (callback: () => void) => {
    setCountdown(3);
    
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
          }
          callback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  const handleRetryVerification = () => {
    hasVerified.current = false;
    setVerificationStatus('loading');
    setMessage('');
    window.location.reload();
  };

  const handleGoToLogin = () => {
    navigate('/login', { replace: true });
  };

  const handleGoToRegister = () => {
    navigate('/register', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {verificationStatus === 'loading' && (
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {verificationStatus === 'success' && (
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {verificationStatus === 'loading' && 'Memverifikasi Email...'}
            {verificationStatus === 'success' && 'Email Terverifikasi!'}
            {verificationStatus === 'error' && 'Verifikasi Gagal'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Loading State */}
          {verificationStatus === 'loading' && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-2 bg-blue-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Mohon tunggu, sedang memverifikasi email Anda...
              </p>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">
                  ✅ Verifikasi berhasil! {countdown > 0 && `Mengarahkan ke beranda dalam ${countdown} detik...`}
                </p>
              </div>
              
              {/* Countdown Progress Bar */}
              {countdown > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((4 - countdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Otomatis redirect dalam {countdown} detik
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Ke Beranda Sekarang
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Login Manual
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                  ❌ {message}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleRetryVerification}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={handleGoToLogin}
                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    Ke Login
                  </button>
                  <button
                    onClick={handleGoToRegister}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Daftar Ulang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Bermasalah dengan verifikasi?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Hubungi Support
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Dengan memverifikasi email, Anda menyetujui{' '}
            <span className="text-red-600 font-medium">Syarat & Ketentuan</span> kami
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 