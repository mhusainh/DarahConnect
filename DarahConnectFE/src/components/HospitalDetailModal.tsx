import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Building2, Clock, Navigation, ExternalLink, Copy } from 'lucide-react';
import { Hospital } from '../types/index';

interface HospitalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital;
}

const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({ isOpen, onClose, hospital }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && hospital.latitude && hospital.longitude) {
      // Load Google Maps if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        window.initMap = () => {
          setMapLoaded(true);
        };
      } else {
        setMapLoaded(true);
      }
    }
  }, [isOpen, hospital]);

  useEffect(() => {
    if (mapLoaded && isOpen) {
      const mapElement = document.getElementById('hospital-map');
      if (mapElement && window.google) {
        const map = new window.google.maps.Map(mapElement, {
          center: { lat: hospital.latitude, lng: hospital.longitude },
          zoom: 15,
          mapTypeId: 'roadmap'
        });

        // Add marker for hospital
        const marker = new window.google.maps.Marker({
          position: { lat: hospital.latitude, lng: hospital.longitude },
          map: map,
          title: hospital.name,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; color: #1f2937;">${hospital.name}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${hospital.address}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">${hospital.city}, ${hospital.province}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Auto-open info window
        infoWindow.open(map, marker);
      }
    }
  }, [mapLoaded, isOpen, hospital]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Detail Rumah Sakit</h3>
              <p className="text-gray-600">Informasi lengkap dan lokasi rumah sakit</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hospital Information */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Informasi Rumah Sakit
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Rumah Sakit</label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-semibold">{hospital.name}</p>
                      <button
                        onClick={() => copyToClipboard(hospital.name)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                    <div className="flex items-start justify-between">
                      <p className="text-gray-900">{hospital.address}</p>
                      <button
                        onClick={() => copyToClipboard(hospital.address)}
                        className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                      <p className="text-gray-900">{hospital.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                      <p className="text-gray-900">{hospital.province}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-mono text-sm">{hospital.latitude}</p>
                        <button
                          onClick={() => copyToClipboard(hospital.latitude.toString())}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-mono text-sm">{hospital.longitude}</p>
                        <button
                          onClick={() => copyToClipboard(hospital.longitude.toString())}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Navigation className="w-5 h-5 mr-2 text-blue-600" />
                  Aksi Cepat
                </h4>
                
                <div className="space-y-3">
                  <button
                    onClick={openDirections}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Dapatkan Petunjuk Arah</span>
                  </button>
                  
                  <button
                    onClick={openInGoogleMaps}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Buka di Google Maps</span>
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(`${hospital.latitude},${hospital.longitude}`)}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Salin Koordinat</span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-yellow-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                  Informasi Tambahan
                </h4>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Pastikan untuk mengonfirmasi jadwal operasional rumah sakit</p>
                  <p>• Siapkan dokumen identitas yang diperlukan</p>
                  <p>• Hubungi rumah sakit untuk informasi lebih lanjut</p>
                  <p>• Periksa persyaratan donor darah sebelum datang</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  Lokasi di Peta
                </h4>
                
                <div className="relative">
                  <div 
                    id="hospital-map" 
                    className="w-full h-96 rounded-lg border-2 border-gray-200"
                    style={{ minHeight: '400px' }}
                  >
                    {!mapLoaded && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">Memuat peta...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Keterangan Peta</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Lokasi Rumah Sakit</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Klik marker untuk melihat informasi detail, atau gunakan tombol aksi cepat untuk navigasi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailModal; 