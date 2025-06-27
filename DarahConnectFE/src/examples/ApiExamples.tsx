import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AwaitFetchApi } from '../components/AwaitFetchApi';
import { fetchApi, getApi, postApi, putApi, deleteApi } from '../services/fetchApi';
import { useNotificationContext, useQuickNotifications } from '../contexts/NotificationContext';

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
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data, loading: hookLoading, error, post } = useApi();

  // Direct service usage
  const handleDirectCall = async () => {
    setLoading(true);
    try {
      const response = await fetchApi('/users', {
        method: 'GET',
      });
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error });
    } finally {
      setLoading(false);
    }
  };

  // Using useApi hook
  const handleHookCall = async () => {
    await post('/posts', {
      title: 'New Post',
      content: 'This is a test post',
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Usage Examples</h1>
      
      {/* Direct Service Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Direct Service Usage</h2>
        <button
          onClick={handleDirectCall}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Users'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Hook Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. useApi Hook Usage</h2>
        <button
          onClick={handleHookCall}
          disabled={hookLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {hookLoading ? 'Loading...' : 'Create Post'}
        </button>
        
        {hookLoading && <div className="mt-2 text-blue-600">Loading...</div>}
        {error && <div className="mt-2 text-red-600">Error: {JSON.stringify(error)}</div>}
        {data && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Component Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. AwaitFetchApi Component Usage</h2>
        <AwaitFetchApi
          endpoint="/users"
          method="GET"
          onSuccess={(data) => console.log('Success:', data)}
          onError={(error) => console.error('Error:', error)}
        >
          {({ data, loading, error }) => (
            <div>
              {loading && <div className="text-blue-600">Loading users...</div>}
              {error && <div className="text-red-600">Error: {JSON.stringify(error)}</div>}
              {data && (
                <div className="p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">Users Data:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </AwaitFetchApi>
      </div>
    </div>
  );
};

export default EnhancedNotificationExamples; 