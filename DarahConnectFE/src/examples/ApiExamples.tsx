import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AwaitFetchApi } from '../components/AwaitFetchApi';
import { fetchApi, getApi, postApi, putApi, deleteApi } from '../services/fetchApi';
import { useNotificationContext, useQuickNotifications } from '../contexts/NotificationContext';
import { ShieldAlertIcon, UserIcon, HeartIcon, SettingsIcon, AlertTriangleIcon } from 'lucide-react';

// Interface untuk data user
interface User {
  id: number;
  name: string;
  email: string;
}

// Enhanced examples showcasing the improved notification system
export const EnhancedNotificationExamples: React.FC = () => {
  const [demoData, setDemoData] = useState<any>(null);
  const { showSuccess, showError, showWarning, showInfo, showWithActions, showPersistent, stats } = useNotificationContext();
  const notifications = useQuickNotifications();

  // Example 1: Basic notification types
  const showBasicNotifications = () => {
    showSuccess('Operasi Berhasil', 'Data telah berhasil diproses');
    
    setTimeout(() => {
      showInfo('Informasi Penting', 'Sistem akan maintenance dalam 30 menit');
    }, 1000);
    
    setTimeout(() => {
      showWarning('Peringatan', 'Ruang penyimpanan hampir penuh');
    }, 2000);
    
    setTimeout(() => {
      showError('Terjadi Kesalahan', 'Koneksi ke server terputus');
    }, 3000);
  };

  // Example 2: Notifications with actions
  const showActionNotifications = () => {
    showWithActions(
      'info',
      'Update Tersedia',
      'Versi baru aplikasi telah tersedia. Apakah Anda ingin mengupdate sekarang?',
      [
        {
          label: 'Update Sekarang',
          onClick: () => {
            showSuccess('Update Dimulai', 'Aplikasi sedang diperbarui...');
          },
          variant: 'primary'
        },
        {
          label: 'Nanti Saja',
          onClick: () => {
            showInfo('Update Ditunda', 'Anda dapat update melalui menu pengaturan');
          },
          variant: 'secondary'
        }
      ]
    );
  };

  // Example 3: Persistent notifications
  const showPersistentNotifications = () => {
    showPersistent(
      'warning',
      'Koneksi Tidak Stabil',
      'Aplikasi berjalan dalam mode offline. Beberapa fitur mungkin tidak tersedia.'
    );
  };

  // Example 4: Quick notification patterns
  const showQuickNotifications = () => {
    notifications.saveSuccess('Profil');
    
    setTimeout(() => {
      notifications.networkError();
    }, 1000);
    
    setTimeout(() => {
      notifications.validationError('Email sudah terdaftar');
    }, 2000);
    
    setTimeout(() => {
      notifications.unauthorized();
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Enhanced Notification System Examples
      </h1>

      {/* Notification Stats */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Notification Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.byType.success}</div>
            <div className="text-sm text-gray-600">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.byType.error}</div>
            <div className="text-sm text-gray-600">Error</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.byType.warning}</div>
            <div className="text-sm text-gray-600">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.byType.info}</div>
            <div className="text-sm text-gray-600">Info</div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-lg font-semibold text-gray-600">
            {stats.queued} notification(s) in queue
          </div>
        </div>
      </div>

      {/* Example Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Basic Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Basic Notification Types
          </h2>
          <p className="text-gray-600 mb-4">
            Demonstrasi berbagai tipe notifikasi dengan animasi dan progress bar.
          </p>
          <button
            onClick={showBasicNotifications}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Show Basic Notifications
          </button>
        </div>

        {/* Action Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Notifications with Actions
          </h2>
          <p className="text-gray-600 mb-4">
            Notifikasi dengan tombol aksi untuk interaksi pengguna.
          </p>
          <button
            onClick={showActionNotifications}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Show Action Notifications
          </button>
        </div>

        {/* Persistent Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Persistent Notifications
          </h2>
          <p className="text-gray-600 mb-4">
            Notifikasi yang tetap muncul sampai ditutup manual.
          </p>
          <button
            onClick={showPersistentNotifications}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Show Persistent Notifications
          </button>
        </div>

        {/* Quick Patterns */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Quick Notification Patterns
          </h2>
          <p className="text-gray-600 mb-4">
            Pola notifikasi umum untuk aksi CRUD dan error handling.
          </p>
          <button
            onClick={showQuickNotifications}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Show Quick Patterns
          </button>
        </div>
      </div>

      {/* API Integration Examples */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          API Integration with Enhanced Notifications
        </h2>
        <ApiNotificationExample />
      </div>
    </div>
  );
};

// API integration component with enhanced notifications
const ApiNotificationExample: React.FC = () => {
  const { data, loading, error } = useApi();
  const notifications = useQuickNotifications();

  const handleApiCall = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE') => {
    try {
      let result;
      const testData = { name: 'Test', email: 'test@example.com' };

      switch (method) {
        case 'GET':
          result = await getApi(endpoint);
          notifications.info('Data Retrieved', 'Data berhasil diambil dari server');
          break;
        case 'POST':
          result = await postApi(endpoint, testData);
          notifications.saveSuccess('Data');
          break;
        case 'PUT':
          result = await putApi(endpoint, testData);
          notifications.updateSuccess('Data');
          break;
        case 'DELETE':
          result = await deleteApi(endpoint);
          notifications.deleteSuccess('Data');
          break;
      }

      console.log('API Result:', result);
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Enhanced error handling based on status
      if (error.status === 404) {
        notifications.error('Data Tidak Ditemukan', 'Resource yang diminta tidak tersedia');
      } else if (error.status === 401) {
        notifications.unauthorized();
      } else if (error.status >= 500) {
        notifications.error('Server Error', 'Terjadi kesalahan pada server');
      } else {
        notifications.error('API Error', error.error || 'Terjadi kesalahan saat memanggil API');
      }
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <button
          onClick={() => handleApiCall('/users', 'GET')}
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          GET Request
        </button>
        <button
          onClick={() => handleApiCall('/users', 'POST')}
          disabled={loading}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          POST Request
        </button>
        <button
          onClick={() => handleApiCall('/users/1', 'PUT')}
          disabled={loading}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50 transition-colors"
        >
          PUT Request
        </button>
        <button
          onClick={() => handleApiCall('/users/1', 'DELETE')}
          disabled={loading}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          DELETE Request
        </button>
      </div>

      {loading && (
        <div className="text-blue-600 text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Processing...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold">Error Response:</h3>
          <pre className="text-red-600 text-sm mt-2 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {data && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold">Success Response:</h3>
          <pre className="text-green-600 text-sm mt-2 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Original examples (keeping for compatibility)
export const ApiExamples: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  
  // Different API hooks for testing
  const profileApi = useApi();
  const donorApi = useApi();
  const healthPassportApi = useApi();
  const settingsApi = useApi();

  const testUnauthorizedEndpoint = async () => {
    setTestResult('Testing 401 error handling...');
    
    try {
      // Test endpoint that should return 401
      const response = await healthPassportApi.get('/user/health-passport');
      
      if (response.success) {
        setTestResult('✅ Request berhasil - tidak ada error 401');
      } else {
        if (response.status === 401) {
          setTestResult('🔄 401 detected - User akan di-redirect ke login...');
          // User should be automatically redirected to login page
        } else {
          setTestResult(`❌ Error lain: ${response.error}`);
        }
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error}`);
    }
  };

  const testMultipleEndpoints = async () => {
    setTestResult('Testing multiple endpoints with potential 401...');
    
    try {
      // Test multiple endpoints that might return 401
      const [profileResponse, settingsResponse] = await Promise.all([
        profileApi.get('/user/profile'),
        settingsApi.get('/user/settings')
      ]);
      
      if (profileResponse.status === 401 || settingsResponse.status === 401) {
        setTestResult('🔄 401 detected in multiple calls - User akan di-redirect...');
      } else {
        setTestResult('✅ Multiple requests successful');
      }
    } catch (error) {
      setTestResult(`❌ Multiple requests error: ${error}`);
    }
  };

  const testWithCustomErrorHandling = async () => {
    setTestResult('Testing with custom 401 error handling...');
    
    try {
      // Test with custom auth error options
      const response = await donorApi.get('/user/donor-history', {
        authErrorOptions: {
          skipNotification: true,
          customMessage: 'Sesi login Anda untuk melihat riwayat donor telah berakhir.'
        }
      });
      
      if (response.status === 401) {
        setTestResult('🔄 401 with custom message - Check login page for custom error');
      } else if (response.success) {
        setTestResult('✅ Donor history loaded successfully');
      } else {
        setTestResult(`❌ Other error: ${response.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Custom error handling test failed: ${error}`);
    }
  };

  const testSkipRedirect = async () => {
    setTestResult('Testing 401 without auto-redirect...');
    
    try {
      // Test with skipRedirect option
      const response = await profileApi.get('/user/profile', {
        authErrorOptions: {
          skipRedirect: true,
          skipNotification: true
        }
      });
      
      if (response.status === 401) {
        setTestResult('🔄 401 detected but redirect skipped - Error handled manually');
        // Here you could implement custom logic for handling 401
      } else if (response.success) {
        setTestResult('✅ Profile loaded successfully');
      } else {
        setTestResult(`❌ Other error: ${response.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Skip redirect test failed: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldAlertIcon className="w-8 h-8 text-red-600 mr-3" />
            API 401 Error Handling Examples
          </h2>
          <p className="text-gray-600 mt-2">
            Test bagaimana sistem menangani error 401 Unauthorized secara otomatis
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Result Display */}
          {testResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Test Result:</h3>
                  <p className="text-sm text-blue-700 mt-1">{testResult}</p>
                </div>
              </div>
            </div>
          )}

          {/* Test Buttons */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic 401 Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Basic 401 Test
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Test endpoint yang akan return 401 dan auto-redirect ke login
              </p>
              <button
                onClick={testUnauthorizedEndpoint}
                disabled={healthPassportApi.loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {healthPassportApi.loading ? 'Testing...' : 'Test Health Passport (401)'}
              </button>
            </div>

            {/* Multiple Endpoints Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                Multiple Endpoints
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Test multiple API calls yang mungkin return 401
              </p>
              <button
                onClick={testMultipleEndpoints}
                disabled={profileApi.loading || settingsApi.loading}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {(profileApi.loading || settingsApi.loading) ? 'Testing...' : 'Test Multiple APIs'}
              </button>
            </div>

            {/* Custom Error Handling */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <HeartIcon className="w-5 h-5 mr-2" />
                Custom Error Message
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Test 401 dengan custom error message di login page
              </p>
              <button
                onClick={testWithCustomErrorHandling}
                disabled={donorApi.loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {donorApi.loading ? 'Testing...' : 'Test Custom Message'}
              </button>
            </div>

            {/* Skip Redirect Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <ShieldAlertIcon className="w-5 h-5 mr-2" />
                Skip Auto-Redirect
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Test 401 tanpa auto-redirect (handle manual)
              </p>
              <button
                onClick={testSkipRedirect}
                disabled={profileApi.loading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {profileApi.loading ? 'Testing...' : 'Test Skip Redirect'}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Cara Kerja Error Handling:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Otomatis:</strong> Semua API call dengan status 401 akan auto-redirect ke login</li>
              <li>• <strong>Error Message:</strong> Pesan error disimpan dan ditampilkan di login page</li>
              <li>• <strong>Session Clear:</strong> Token dan data user otomatis dibersihkan</li>
              <li>• <strong>Customizable:</strong> Bisa skip notification/redirect dengan options</li>
              <li>• <strong>Time-based:</strong> Error message hanya ditampilkan jika &lt; 5 menit</li>
            </ul>
          </div>

          {/* Current API Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Current API States:</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Profile API:</span>
                <span className={`font-medium ${profileApi.loading ? 'text-blue-600' : profileApi.error ? 'text-red-600' : 'text-green-600'}`}>
                  {profileApi.loading ? 'Loading...' : profileApi.error ? 'Error' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Donor API:</span>
                <span className={`font-medium ${donorApi.loading ? 'text-blue-600' : donorApi.error ? 'text-red-600' : 'text-green-600'}`}>
                  {donorApi.loading ? 'Loading...' : donorApi.error ? 'Error' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Health Passport API:</span>
                <span className={`font-medium ${healthPassportApi.loading ? 'text-blue-600' : healthPassportApi.error ? 'text-red-600' : 'text-green-600'}`}>
                  {healthPassportApi.loading ? 'Loading...' : healthPassportApi.error ? 'Error' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Settings API:</span>
                <span className={`font-medium ${settingsApi.loading ? 'text-blue-600' : settingsApi.error ? 'text-red-600' : 'text-green-600'}`}>
                  {settingsApi.loading ? 'Loading...' : settingsApi.error ? 'Error' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiExamples; 