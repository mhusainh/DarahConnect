import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

interface GoogleMapsStatusProps {
  onStatusChange?: (status: 'loading' | 'success' | 'error') => void;
}

const GoogleMapsStatus: React.FC<GoogleMapsStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkGoogleMapsStatus = () => {
      // Check if API key is configured
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        setStatus('error');
        setErrorMessage('API key tidak dikonfigurasi. Silakan setup REACT_APP_GOOGLE_MAPS_API_KEY di file .env');
        onStatusChange?.('error');
        return;
      }

      // Check if Google Maps is loaded
      if (window.google && window.google.maps) {
        setStatus('success');
        onStatusChange?.('success');
      } else {
        // Try to load Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setStatus('success');
          onStatusChange?.('success');
        };
        
        script.onerror = () => {
          setStatus('error');
          setErrorMessage('Gagal memuat Google Maps. Periksa API key dan koneksi internet.');
          onStatusChange?.('error');
        };
        
        document.head.appendChild(script);
      }
    };

    checkGoogleMapsStatus();
  }, [onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Memeriksa Google Maps API...';
      case 'success':
        return 'Google Maps API siap digunakan';
      case 'error':
        return 'Google Maps API tidak tersedia';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium">{getStatusText()}</p>
          {status === 'error' && errorMessage && (
            <p className="text-sm mt-1 opacity-90">{errorMessage}</p>
          )}
        </div>
      </div>
      
      {status === 'error' && (
        <div className="mt-3 p-3 bg-white rounded border">
          <h4 className="font-medium text-sm mb-2">Langkah Perbaikan:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Buat file <code>.env</code> di root project</li>
            <li>Tambahkan: <code>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key</code></li>
            <li>Dapatkan API key dari Google Cloud Console</li>
            <li>Enable Maps JavaScript API, Places API, dan Geocoding API</li>
            <li>Restart development server</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsStatus; 