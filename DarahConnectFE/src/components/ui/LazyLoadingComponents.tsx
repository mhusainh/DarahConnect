import React from 'react';
import { HeartHandshakeIcon, LoaderIcon, AlertCircleIcon } from 'lucide-react';

// Page Loader Component
export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LoaderIcon className="w-8 h-8 text-red-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Memuat Halaman...</h2>
        <p className="text-gray-600">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
};

// Dashboard Loader Component
export const DashboardLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartHandshakeIcon className="w-10 h-10 text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Memuat Dashboard...</h2>
        <p className="text-gray-600">Menyiapkan data Anda</p>
        <div className="mt-4">
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded-full max-w-xs mx-auto">
              <div className="h-2 bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Campaign List Loader Component
export const CampaignListLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LoaderIcon className="w-8 h-8 text-green-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Memuat Kampanye...</h2>
          <p className="text-gray-600">Mengambil daftar kampanye donor darah</p>
        </div>
        
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Error Fallback Component
export const ErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h1>
          
          <p className="text-gray-600 mb-6">
            Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm font-mono">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {resetError && (
              <button
                onClick={resetError}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Jika masalah berlanjut, hubungi{' '}
              <a 
                href="mailto:support@darahconnect.com" 
                className="text-red-600 hover:text-red-700 font-medium"
              >
                support@darahconnect.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Suspense Wrapper Components
export const SuspenseWrapper: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ComponentType;
}> = ({ children, fallback: Fallback = PageLoader }) => {
  return (
    <React.Suspense fallback={<Fallback />}>
      {children}
    </React.Suspense>
  );
};

// Specific Suspense Wrappers
export const DashboardSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.Suspense fallback={<DashboardLoader />}>
      {children}
    </React.Suspense>
  );
};

export const CampaignSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.Suspense fallback={<CampaignListLoader />}>
      {children}
    </React.Suspense>
  );
};

export default { 
  PageLoader, 
  DashboardLoader, 
  CampaignListLoader, 
  ErrorFallback, 
  SuspenseWrapper, 
  DashboardSuspense, 
  CampaignSuspense 
}; 