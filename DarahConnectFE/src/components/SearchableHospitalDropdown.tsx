import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plus, ChevronDown, Building, X, Navigation, AlertCircle, RefreshCw } from 'lucide-react';
import { getApi } from '../services/fetchApi';
import { provinsiData, kotaData, getProvinsiById } from '../data/wilayahIndonesia';

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface HospitalApiResponse {
  meta: {
    code: number;
    message: string;
  };
  data: Hospital[];
  pagination?: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

interface SearchableHospitalDropdownProps {
  value: number;
  onChange: (hospitalId: number) => void;
  onAddHospital: () => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

const SearchableHospitalDropdown: React.FC<SearchableHospitalDropdownProps> = ({
  value,
  onChange,
  onAddHospital,
  error,
  placeholder = "Pilih Rumah Sakit",
  className = ""
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    province: string;
    city: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [autoLocationEnabled, setAutoLocationEnabled] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to clean city name for display
  const cleanCityName = (cityName: string): string => {
    return cityName
      .replace(/^(Kota|Kabupaten)\s+/i, '') // Remove prefix
      .replace(/\s+(Kota|Kabupaten)$/i, '') // Remove suffix
      .trim();
  };

  // Get selected hospital name for display
  const selectedHospital = hospitals.find(h => h.id === value);
  const displayText = selectedHospital 
    ? `${selectedHospital.name} - ${cleanCityName(selectedHospital.city)}, ${selectedHospital.province}`
    : userLocation 
      ? `${placeholder} (${cleanCityName(userLocation.city || '')}, ${userLocation.province})`
      : placeholder;

  // Get user location on component mount
  useEffect(() => {
    if (autoLocationEnabled) {
      getUserLocation();
    }
  }, []);

  // Fetch hospitals when user location changes
  useEffect(() => {
    fetchHospitals();
  }, [userLocation]);

  // Fetch all hospitals initially if no auto location
  useEffect(() => {
    if (!autoLocationEnabled && !userLocation) {
      fetchHospitals();
    }
  }, [autoLocationEnabled]);

  // Filter hospitals when search query or province changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchQuery.trim()) {
        searchHospitals(searchQuery);
      } else {
        filterHospitalsByProvince();
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery, selectedProvince]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user's current location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser ini');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
                 try {
           // Reverse geocoding using Google Maps API
           const location = await reverseGeocode(latitude, longitude);
           if (location) {
             setUserLocation(location);
             setSelectedProvince(location.province);
             setLocationError(''); // Clear any previous errors
           } else {
             setLocationError('Gagal mendeteksi alamat. Silakan pilih provinsi manual.');
             setAutoLocationEnabled(false);
           }
         } catch (error) {
           console.error('Error getting location details:', error);
           setLocationError('Gagal mendapatkan detail lokasi. Silakan pilih provinsi manual.');
           setAutoLocationEnabled(false);
         } finally {
           setIsGettingLocation(false);
         }
      },
             (error) => {
         setIsGettingLocation(false);
         let errorMessage = 'Gagal mendapatkan lokasi';
         
         switch (error.code) {
           case error.PERMISSION_DENIED:
             errorMessage = 'Akses lokasi ditolak. Anda bisa pilih provinsi secara manual.';
             break;
           case error.POSITION_UNAVAILABLE:
             errorMessage = 'Lokasi tidak tersedia. Silakan pilih provinsi manual.';
             break;
           case error.TIMEOUT:
             errorMessage = 'Timeout lokasi. Silakan pilih provinsi manual.';
             break;
         }
         
         setLocationError(errorMessage);
         setAutoLocationEnabled(false); // Disable auto location on error
       },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  // Reverse geocoding using Google Maps API
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) {
      // Multiple fallback geocoding services
      const fallbackServices = [
        {
          name: 'Nominatim',
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`,
          parser: (data: any) => {
            const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
            return parseLocationFromCity(cityName, data.display_name || '');
          }
        },
        {
          name: 'BigDataCloud',
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
          parser: (data: any) => {
            const cityName = data.city || data.locality || data.principalSubdivision || '';
            return parseLocationFromCity(cityName, data.localityInfo?.administrative || '');
          }
        }
      ];

      // Try each fallback service
      for (const service of fallbackServices) {
        try {
          console.log(`🌍 Trying ${service.name} geocoding service...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'DarahConnect/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          const parsed = service.parser(data);
          
          if (parsed.province) {
            console.log(`✅ ${service.name} geocoding successful`);
            return {
              latitude: lat,
              longitude: lng,
              province: parsed.province,
              city: parsed.city
            };
          }
        } catch (error) {
          console.warn(`❌ ${service.name} geocoding failed:`, error);
          continue; // Try next service
        }
      }
      
      // All services failed, use coordinate-based estimation
      console.log('🔄 All geocoding services failed, using coordinate estimation...');
      return estimateLocationFromCoordinates(lat, lng);
    }

    return new Promise<{latitude: number; longitude: number; province: string; city: string} | null>((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            const components = results[0].address_components;
            
            let cityName = '';
            
            // Extract city from address components
            for (const component of components) {
              const types = component.types;
              
              if (types.includes('administrative_area_level_2') || 
                  types.includes('locality') ||
                  types.includes('sublocality_level_1')) {
                cityName = component.long_name;
                break; // Use first city-level component found
              }
            }
            
            // Parse using city-based method
            const location = parseLocationFromCity(cityName, address);
            
            resolve({
              latitude: lat,
              longitude: lng,
              province: location.province,
              city: location.city || cityName
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  // Estimate location from coordinates when all geocoding services fail
  const estimateLocationFromCoordinates = (lat: number, lng: number) => {
    // Approximate coordinate boundaries for major Indonesian provinces
    const provinceRegions = [
      { name: 'DKI Jakarta', latMin: -6.4, latMax: -5.9, lngMin: 106.6, lngMax: 107.1 },
      { name: 'Jawa Barat', latMin: -7.8, latMax: -5.8, lngMin: 105.0, lngMax: 108.8 },
      { name: 'Jawa Tengah', latMin: -8.2, latMax: -6.0, lngMin: 108.8, lngMax: 111.8 },
      { name: 'Jawa Timur', latMin: -8.8, latMax: -6.8, lngMin: 111.0, lngMax: 114.6 },
      { name: 'Daerah Istimewa Yogyakarta', latMin: -8.2, latMax: -7.5, lngMin: 110.0, lngMax: 110.9 },
      { name: 'Banten', latMin: -7.0, latMax: -5.7, lngMin: 105.0, lngMax: 106.8 },
      { name: 'Sumatera Utara', latMin: 1.0, latMax: 4.3, lngMin: 97.0, lngMax: 100.3 },
      { name: 'Sumatera Barat', latMin: -3.8, latMax: 1.0, lngMin: 98.0, lngMax: 101.9 },
      { name: 'Sumatera Selatan', latMin: -5.0, latMax: -1.9, lngMin: 102.0, lngMax: 106.0 },
      { name: 'Kalimantan Timur', latMin: -2.2, latMax: 4.2, lngMin: 113.0, lngMax: 119.0 },
      { name: 'Sulawesi Selatan', latMin: -8.0, latMax: -2.5, lngMin: 118.0, lngMax: 122.0 }
    ];

    // Find matching region
    for (const region of provinceRegions) {
      if (lat >= region.latMin && lat <= region.latMax && 
          lng >= region.lngMin && lng <= region.lngMax) {
        console.log(`📍 Estimated location: ${region.name}`);
        
        // Try to find a major city in this province for better UX
        const provinceCities = kotaData.filter(kota => {
          const provinsi = getProvinsiById(kota.provinsiId);
          return provinsi?.nama === region.name;
        });
        
        const majorCity = provinceCities.find(kota => 
          kota.nama.includes('Kota') || kota.nama.includes(region.name.split(' ')[0])
        ) || provinceCities[0];
        
        return {
          latitude: lat,
          longitude: lng,
          province: region.name,
          city: majorCity?.nama || 'Unknown'
        };
      }
    }

    // Default fallback - return null to let user select manually
    console.log('📍 Could not estimate location from coordinates');
    return null;
  };

  // Parse location from city name using wilayahIndonesia.ts data
  const parseLocationFromCity = (cityName: string, fallbackAddress: string = '') => {
    console.log(`🔍 Parsing location from city: "${cityName}"`);
    
    if (!cityName) {
      console.log('⚠️  No city name provided, using address fallback');
      return parseLocationFromAddress(fallbackAddress);
    }

    // Clean city name
    const cleanCityName = cityName
      .toLowerCase()
      .replace(/^(kota|kabupaten)\s+/i, '') // Remove "Kota" or "Kabupaten" prefix
      .replace(/\s+(kota|kabupaten)$/i, '') // Remove "Kota" or "Kabupaten" suffix
      .trim();
    
    console.log(`🧹 Cleaned city name: "${cleanCityName}"`);

    // Find matching city in kotaData
    const matchedCity = kotaData.find(kota => {
      const kotaNama = kota.nama.toLowerCase()
        .replace(/^(kota|kabupaten)\s+/i, '')
        .replace(/\s+(kota|kabupaten)$/i, '');
      
      // Direct match
      if (kotaNama === cleanCityName || kotaNama.includes(cleanCityName) || cleanCityName.includes(kotaNama)) {
        return true;
      }
      
      // Handle common city name variations
      const cityVariations = [
        cleanCityName.replace(/\s+/g, ''), // Remove spaces
        cleanCityName.split(' ')[0], // First word only
        cleanCityName.replace(/^kab\.|^kot\./, ''), // Remove abbreviations
      ];
      
      const kotaVariations = [
        kotaNama.replace(/\s+/g, ''),
        kotaNama.split(' ')[0],
        kotaNama.replace(/^kab\.|^kot\./, ''),
      ];
      
      return cityVariations.some(cityVar => 
        kotaVariations.some(kotaVar => 
          cityVar === kotaVar || cityVar.includes(kotaVar) || kotaVar.includes(cityVar)
        )
      );
    });

    if (matchedCity) {
      const provinsi = getProvinsiById(matchedCity.provinsiId);
      if (provinsi) {
        console.log(`✅ Matched city: ${matchedCity.nama} → ${provinsi.nama}`);
        return {
          province: provinsi.nama,
          city: matchedCity.nama
        };
      }
    }

    // Fallback to address parsing if city not found
    console.log(`⚠️  City "${cityName}" not found in database, using address fallback`);
    return parseLocationFromAddress(fallbackAddress);
  };

  // Parse location from full address string (fallback method)
  const parseLocationFromAddress = (address: string) => {
    const province = parseProvinceFromAddress(address);
    return {
      province,
      city: '' // Will be extracted separately
    };
  };

  // Parse province name from address string
  const parseProvinceFromAddress = (address: string): string => {
    const addressLower = address.toLowerCase();
    
    for (const provinsi of provinsiData) {
      const provinsiName = provinsi.nama.toLowerCase();
      
      // Check exact match or partial match
      if (addressLower.includes(provinsiName) || 
          provinsiName.includes(addressLower) ||
          addressLower.includes(provinsi.nama.split(' ')[0].toLowerCase())) {
        return provinsi.nama;
      }
    }
    
    // Additional mappings for common variations
    const provinceMapping: { [key: string]: string } = {
      'jakarta': 'DKI Jakarta',
      'jogja': 'Daerah Istimewa Yogyakarta', 
      'yogya': 'Daerah Istimewa Yogyakarta',
      'yogyakarta': 'Daerah Istimewa Yogyakarta',
      'jabar': 'Jawa Barat',
      'jateng': 'Jawa Tengah', 
      'jatim': 'Jawa Timur',
      'sumut': 'Sumatera Utara',
      'sumbar': 'Sumatera Barat',
      'sumsel': 'Sumatera Selatan',
      'kalbar': 'Kalimantan Barat',
      'kalteng': 'Kalimantan Tengah',
      'kalsel': 'Kalimantan Selatan',
      'kaltim': 'Kalimantan Timur',
      'sulut': 'Sulawesi Utara',
      'sulteng': 'Sulawesi Tengah',
      'sulsel': 'Sulawesi Selatan',
      'sultra': 'Sulawesi Tenggara'
    };
    
    for (const [key, value] of Object.entries(provinceMapping)) {
      if (addressLower.includes(key)) {
        return value;
      }
    }
    
    return '';
  };

  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters with user location if available
      const params = new URLSearchParams();
      
      if (userLocation?.province) {
        params.append('province', userLocation.province);
      }
      
      if (userLocation?.city) {
        params.append('city', cleanCityName(userLocation.city));
      }
      
      const endpoint = params.toString() ? `/hospital?${params.toString()}` : '/hospital';
      console.log('🔍 Initial Hospital Fetch:', endpoint);
      
      const response = await getApi<HospitalApiResponse>(endpoint);
      
      if (response.success && response.data) {
        let hospitalsData: Hospital[] = [];
        
        if (Array.isArray(response.data)) {
          hospitalsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          hospitalsData = response.data.data;
        }
        
        setHospitals(hospitalsData);
        setFilteredHospitals(hospitalsData);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchHospitals = async (query: string) => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('search', query);
      
      // Add province filter if selected
      if (selectedProvince) {
        params.append('province', selectedProvince);
      }
      
      // Add city filter if user location is available
      if (userLocation?.city) {
        params.append('city', cleanCityName(userLocation.city));
      }
      
      const endpoint = `/hospital?${params.toString()}`;
      console.log('🔍 Hospital Search API:', endpoint);
      
      const response = await getApi<HospitalApiResponse>(endpoint);
      
      if (response.success && response.data) {
        let hospitalsData: Hospital[] = [];
        
        if (Array.isArray(response.data)) {
          hospitalsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          hospitalsData = response.data.data;
        }
        
        // Apply additional client-side filtering if needed
        const filtered = selectedProvince 
          ? hospitalsData.filter(h => h.province.toLowerCase().includes(selectedProvince.toLowerCase()))
          : hospitalsData;
        
        setFilteredHospitals(filtered);
      }
    } catch (error) {
      console.error('Error searching hospitals:', error);
      // Fallback to local filtering
      filterHospitalsByProvince();
    } finally {
      setIsLoading(false);
    }
  };

  const filterHospitalsByProvince = () => {
    let filtered = hospitals;

    if (selectedProvince) {
      filtered = hospitals.filter(hospital => 
        hospital.province.toLowerCase().includes(selectedProvince.toLowerCase())
      );
    }

    if (searchQuery && !searchQuery.trim()) {
      // If no API search, do local search
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    onChange(hospital.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    filterHospitalsByProvince();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Display/Trigger Button */}
      <button
        type="button"
        onClick={handleOpenDropdown}
        className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${!selectedHospital ? 'text-gray-500' : 'text-gray-900'}`}
      >
        <span className="truncate flex items-center">
          <Building className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
          {displayText}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search and Filter Header */}
          <div className="p-3 border-b border-gray-200 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari rumah sakit..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

                         {/* Location Status */}
             {(userLocation || isGettingLocation || locationError) && (
               <div className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                 userLocation ? 'bg-green-50 text-green-700 border border-green-200' : 
                 locationError ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                 'bg-blue-50 text-blue-700 border border-blue-200'
               }`}>
                 <div className="flex items-center flex-1">
                   {isGettingLocation ? (
                     <>
                       <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                       <span>Mencari lokasi Anda...</span>
                     </>
                   ) : userLocation ? (
                     <>
                       <Navigation className="h-3 w-3 mr-2" />
                       <span>📍 {cleanCityName(userLocation.city || 'Unknown')}, {userLocation.province}</span>
                     </>
                   ) : locationError ? (
                     <>
                       <AlertCircle className="h-3 w-3 mr-2" />
                       <span>{locationError}</span>
                     </>
                   ) : null}
                 </div>
                 
                 <div className="flex items-center gap-1">
                   {userLocation && (
                     <button
                       type="button"
                       onClick={() => {
                         setUserLocation(null);
                         setSelectedProvince('');
                         setLocationError('');
                       }}
                       className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                       title="Hapus lokasi otomatis"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   )}
                   
                   {!isGettingLocation && (
                     <button
                       type="button"
                       onClick={getUserLocation}
                       className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                       title={userLocation ? "Refresh lokasi" : "Coba deteksi lokasi lagi"}
                     >
                       <RefreshCw className="h-3 w-3" />
                     </button>
                   )}
                 </div>
               </div>
             )}

             {/* Manual Mode Hint */}
             {!autoLocationEnabled && !userLocation && !isGettingLocation && (
               <div className="p-2 bg-gray-50 text-gray-600 rounded-lg text-xs border border-gray-200">
                 💡 Mode manual aktif. Pilih provinsi dari dropdown di bawah atau nyalakan deteksi lokasi otomatis.
               </div>
             )}

             {/* Province Filter */}
             <div className="flex items-center space-x-2">
               <select
                 value={selectedProvince}
                 onChange={(e) => setSelectedProvince(e.target.value)}
                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
               >
                 <option value="">🌍 Semua Provinsi</option>
                 {provinsiData.map((provinsi) => (
                   <option key={provinsi.id} value={provinsi.nama}>
                     {provinsi.nama}
                   </option>
                 ))}
               </select>
               
               {/* Location Toggle */}
               <button
                 type="button"
                 onClick={() => {
                   if (autoLocationEnabled) {
                     setAutoLocationEnabled(false);
                     setUserLocation(null);
                     setSelectedProvince('');
                     setLocationError('');
                   } else {
                     setAutoLocationEnabled(true);
                     getUserLocation();
                   }
                 }}
                 className={`p-2 rounded-lg border transition-colors ${
                   autoLocationEnabled 
                     ? 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200' 
                     : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                 }`}
                 title={autoLocationEnabled ? 'Matikan deteksi lokasi otomatis' : 'Nyalakan deteksi lokasi otomatis'}
               >
                 <Navigation className="h-4 w-4" />
               </button>
             </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {filteredHospitals.length > 0 ? (
              <>
                {filteredHospitals.map((hospital) => (
                  <button
                    key={hospital.id}
                    type="button"
                    onClick={() => handleHospitalSelect(hospital)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      hospital.id === value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Building className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{hospital.name}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {cleanCityName(hospital.city)}, {hospital.province}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 overflow-hidden" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {hospital.address}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <span>Mencari rumah sakit...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Building className="h-8 w-8 text-gray-300 mb-2" />
                    <span>Tidak ada rumah sakit ditemukan</span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                      >
                        Hapus pencarian
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Hospital Option */}
          <div className="border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onAddHospital();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors text-green-600 font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-3" />
              Tambah Rumah Sakit Baru
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SearchableHospitalDropdown; 