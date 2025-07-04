import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Building, Save, Search } from 'lucide-react';
import { provinsiData, kotaData, getKotaByProvinsi } from '../data/wilayahIndonesia';
import { useApi } from '../hooks/useApi';
import GoogleMapsStatus from './GoogleMapsStatus';

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHospitalAdded: (hospital: HospitalData) => void;
  hospital?: HospitalData | null;
}

interface HospitalData {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface HospitalFormData {
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const hospitalExamples = [
  {
    name: "RS Cipto Mangunkusumo",
    province: "jakarta",
    city: "jak-pusat",
    address: "Jl. Diponegoro No. 71, Kenari, Senen",
    search: "RS Cipto Mangunkusumo Jakarta"
  },
  {
    name: "RS Dr. Soetomo",
    province: "jatim",
    city: "surabaya",
    address: "Jl. Mayjen Prof. Dr. Moestopo No.6-8, Surabaya",
    search: "RS Dr. Soetomo Surabaya"
  },
  {
    name: "RS Hasan Sadikin",
    province: "jabar",
    city: "bandung",
    address: "Jl. Pasteur No.38, Pasteur, Kec. Sukajadi, Kota Bandung",
    search: "RS Hasan Sadikin Bandung"
  },
];

// Helper untuk mapping id ke nama
const getProvinsiName = (id: string) => provinsiData.find(p => p.id === id)?.nama || id;
const getKotaName = (id: string) => kotaData.find(k => k.id === id)?.nama.replace(/^Kota |Kabupaten /, '') || id;

const AddHospitalModal: React.FC<AddHospitalModalProps> = ({ isOpen, onClose, onHospitalAdded, hospital }) => {
  const [formData, setFormData] = useState<HospitalFormData>({
    name: hospital?.name || '',
    address: hospital?.address || '',
    city: hospital?.city || '',
    province: hospital?.province || '',
    latitude: hospital?.latitude || -6.2088,
    longitude: hospital?.longitude || 106.8456
  });
  
  const [errors, setErrors] = useState<Partial<HospitalFormData>>({});
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [availableCities, setAvailableCities] = useState<typeof kotaData>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [mapsStatus, setMapsStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [hospitalSearchResults, setHospitalSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  
  const { post, put, loading } = useApi();

  // Load Google Maps
  useEffect(() => {
    if (isOpen && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsMapLoaded(true);
    }
  }, [isOpen]);

  // Initialize Google Places services when map is loaded
  useEffect(() => {
    if (isMapLoaded && isOpen && window.google && !autocompleteService) {
      const autoCompleteService = new window.google.maps.places.AutocompleteService();
      setAutocompleteService(autoCompleteService);
      
      // Create a dummy map for PlacesService
      const dummyDiv = document.createElement('div');
      const dummyMap = new window.google.maps.Map(dummyDiv);
      const placesServiceInstance = new window.google.maps.places.PlacesService(dummyMap);
      setPlacesService(placesServiceInstance);
    }
  }, [isMapLoaded, isOpen, autocompleteService]);

  // Initialize map
  useEffect(() => {
    if (isMapLoaded && isOpen && !map) {
      const mapElement = document.getElementById('hospital-map');
      if (mapElement) {
        const googleMap = new window.google.maps.Map(mapElement, {
          center: { lat: formData.latitude, lng: formData.longitude },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const mapMarker = new window.google.maps.Marker({
          position: { lat: formData.latitude, lng: formData.longitude },
          map: googleMap,
          draggable: true,
          title: 'Lokasi Rumah Sakit'
        });

        // Add click listener to map
        googleMap.addListener('click', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          mapMarker.setPosition({ lat, lng });
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
          
          // Reverse geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
            }
          });
        });

        // Add drag listener to marker
        mapMarker.addListener('dragend', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
          
          // Reverse geocoding
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
            }
          });
        });

        setMap(googleMap);
        setMarker(mapMarker);
      }
    }
  }, [isMapLoaded, isOpen, map, formData.latitude, formData.longitude]);

  // Update form data when hospital prop changes (for editing)
  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || '',
        address: hospital.address || '',
        city: hospital.city || '',
        province: hospital.province || '',
        latitude: hospital.latitude || -6.2088,
        longitude: hospital.longitude || 106.8456
      });
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        province: '',
        latitude: -6.2088,
        longitude: 106.8456
      });
    }
  }, [hospital]);

  // Update cities when province changes
  useEffect(() => {
    if (formData.province) {
      const cities = getKotaByProvinsi(formData.province);
      setAvailableCities(cities);
      if (!hospital) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.province, hospital]);

  const handleInputChange = (field: keyof HospitalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const searchLocation = useCallback(() => {
    if (!window.google || !map) return;

    const searchQuery = `${formData.name} ${formData.address}`;
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: searchQuery }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setFormData(prev => ({ 
          ...prev, 
          latitude: lat, 
          longitude: lng,
          address: results[0].formatted_address 
        }));
        
        map.setCenter({ lat, lng });
        marker.setPosition({ lat, lng });
      }
    });
  }, [formData.name, formData.address, map, marker]);

  // Function to search hospitals using Google Places API
  const searchHospitals = useCallback((query: string) => {
    if (!autocompleteService || !query.trim()) {
      setHospitalSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    const request = {
      input: query,
      types: ['hospital', 'health'],
      componentRestrictions: { country: 'id' },
    };

    autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
      setIsSearching(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setHospitalSearchResults(predictions);
        setShowSearchResults(true);
      } else {
        setHospitalSearchResults([]);
        setShowSearchResults(false);
      }
    });
  }, [autocompleteService]);

  // Function to parse address and find matching province/city
  const parseAddressToProvinceCity = (address: string) => {
    const addressLower = address.toLowerCase();
    
    // Find province
    let matchedProvince = '';
    let matchedCity = '';
    
    for (const provinsi of provinsiData) {
      const provinsiName = provinsi.nama.toLowerCase();
      if (addressLower.includes(provinsiName)) {
        matchedProvince = provinsi.id;
        break;
      }
    }
    
    // Find city
    const cities = matchedProvince ? getKotaByProvinsi(matchedProvince) : kotaData;
    for (const kota of cities) {
      const kotaName = kota.nama.toLowerCase().replace(/^kota |kabupaten /, '');
      if (addressLower.includes(kotaName)) {
        matchedCity = kota.id;
        break;
      }
    }
    
    return { province: matchedProvince, city: matchedCity };
  };

  // Function to handle hospital selection from search results
  const handleHospitalSelect = useCallback((placeId: string) => {
    if (!placesService) return;

    setIsSearching(true);
    setShowSearchResults(false);

    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'geometry', 'address_components']
    };

    placesService.getDetails(request, (place: any, status: any) => {
      setIsSearching(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        // Parse address to get province and city
        const { province, city } = parseAddressToProvinceCity(place.formatted_address);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          name: place.name || prev.name,
          address: place.formatted_address || prev.address,
          latitude: lat,
          longitude: lng,
          province: province || prev.province,
          city: city || prev.city
        }));
        
        // Update map
        if (map && marker) {
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
          map.setZoom(16);
        }
        
        // Clear search
        setSearchQuery('');
      }
    });
  }, [placesService, map, marker]);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchHospitals(searchQuery);
      } else {
        setHospitalSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchHospitals]);

  const validateForm = (): boolean => {
    const newErrors: Partial<HospitalFormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nama rumah sakit wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (!formData.province) newErrors.province = 'Provinsi wajib dipilih';
    if (!formData.city) newErrors.city = 'Kota wajib dipilih';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const hospitalData = {
        name: formData.name,
        address: formData.address,
        city: getKotaName(formData.city),
        province: getProvinsiName(formData.province),
        latitude: formData.latitude,
        longitude: formData.longitude
      };

      let response;
      if (hospital) {
        // Update existing hospital
        response = await put(`/hospital/${hospital.id}`, hospitalData);
      } else {
        // Create new hospital
        response = await post('/hospital', hospitalData);
      }

      if (response.success && response.data) {
        onHospitalAdded(response.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error saving hospital:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      province: '',
      latitude: -6.2088,
      longitude: 106.8456
    });
    setErrors({});
    setMap(null);
    setMarker(null);
    setIsMapLoaded(false);
    setSearchQuery('');
    setIsSearching(false);
    setMapsStatus('loading');
    setHospitalSearchResults([]);
    setShowSearchResults(false);
    setAutocompleteService(null);
    setPlacesService(null);
    onClose();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };

    if (showSearchResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSearchResults]);

  const handleExampleClick = (example: typeof hospitalExamples[0]) => {
    setFormData(prev => ({
      ...prev,
      name: example.name,
      province: example.province,
      city: example.city,
      address: example.address,
    }));
    setSearchQuery(example.search);
    
    // Update cities when province changes
    const cities = getKotaByProvinsi(example.province);
    setAvailableCities(cities);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6" />
              <h2 className="text-xl font-bold">{hospital ? 'Edit Rumah Sakit' : 'Tambah Rumah Sakit Baru'}</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">Pilih lokasi dengan Google Maps dan lengkapi informasi rumah sakit</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              {/* Hospital Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Cari Rumah Sakit (Opsional)
                </label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (hospitalSearchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ketik nama rumah sakit (contoh: RS Cipto Jakarta)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <Search className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && hospitalSearchResults.length > 0 && (
                  <div 
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {hospitalSearchResults.map((result, index) => (
                      <button
                        key={result.place_id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHospitalSelect(result.place_id);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{result.structured_formatting?.main_text}</div>
                        <div className="text-sm text-gray-600">{result.structured_formatting?.secondary_text}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="mt-1 text-xs text-gray-500">
                  Ketik minimal 3 karakter untuk mencari rumah sakit. Data akan otomatis terisi.
                </p>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Rumah Sakit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="RS Cipto Mangunkusumo"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.province ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinsiData.map((provinsi) => (
                    <option key={provinsi.id} value={provinsi.id}>
                      {provinsi.nama}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!formData.province}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Kota</option>
                  {availableCities.map((kota) => (
                    <option key={kota.id} value={kota.id}>
                      {kota.nama}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jl. Diponegoro No. 71, Kenari, Senen"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* Search Location Button */}
              {/* <button
                type="button"
                onClick={searchLocation}
                disabled={!formData.name || !formData.address || !isMapLoaded}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4 mr-2" />
                Cari Lokasi di Maps
              </button> */}

              {/* Coordinates Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Koordinat Lokasi</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Latitude: {formData.latitude.toFixed(6)}</p>
                  <p>Longitude: {formData.longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <div>
                

                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {mapsStatus === 'error' ? (
                    <div className="w-full h-80 flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4">
                        <GoogleMapsStatus onStatusChange={setMapsStatus} />
                      </div>
                    </div>
                  ) : isMapLoaded ? (
                    <div
                      id="hospital-map"
                      className="w-full h-80"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Loading Google Maps...</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Klik pada map atau drag marker untuk memilih lokasi yang tepat
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !isMapLoaded}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {hospital ? 'Update Rumah Sakit' : 'Simpan Rumah Sakit'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHospitalModal; 