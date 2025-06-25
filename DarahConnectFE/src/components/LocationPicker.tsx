import React, { useState, useEffect } from 'react';
import { MapPinIcon } from 'lucide-react';
import { getIndonesianProvinces, getIndonesianCities, formatLocation, IndonesiaState, IndonesiaCity } from '../utils/indonesiaLocations';

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  layout?: 'vertical' | 'horizontal';
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  error,
  placeholder = "Pilih lokasi",
  required = false,
  layout = 'vertical'
}) => {
  const [provinces, setProvinces] = useState<IndonesiaState[]>([]);
  const [cities, setCities] = useState<IndonesiaCity[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    // Load Indonesian provinces
    const indonesianProvinces = getIndonesianProvinces();
    setProvinces(indonesianProvinces);
  }, []);

  useEffect(() => {
    // Parse existing value if provided
    if (value && value.includes(',')) {
      const [cityName, provinceName] = value.split(',').map(s => s.trim());
      const province = provinces.find(p => p.name === provinceName);
      if (province) {
        setSelectedProvince(province.isoCode);
        setSelectedCity(cityName);
        
        // Load cities for the province
        const provinceCities = getIndonesianCities(province.isoCode);
        setCities(provinceCities);
      }
    }
  }, [value, provinces]);

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedCity('');
    
    if (provinceCode) {
      const provinceCities = getIndonesianCities(provinceCode);
      setCities(provinceCities);
    } else {
      setCities([]);
      onChange('');
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    
    if (cityName && selectedProvince) {
      const province = provinces.find(p => p.isoCode === selectedProvince);
      if (province) {
        const formattedLocation = formatLocation(cityName, province.name);
        onChange(formattedLocation);
      }
    } else {
      onChange('');
    }
  };

  if (layout === 'horizontal') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Province Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provinsi {required && '*'}
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((province) => (
                  <option key={province.isoCode} value={province.isoCode}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kota/Kabupaten {required && '*'}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={!selectedProvince}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${!selectedProvince ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {selectedProvince ? 'Pilih Kota/Kabupaten' : 'Pilih provinsi terlebih dahulu'}
              </option>
              {cities.map((city) => (
                <option key={`${city.stateCode}-${city.name}`} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {/* Selected Location Display */}
        {value && (
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-800">
              <strong>Lokasi yang dipilih:</strong> {value}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Province Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provinsi {required && '*'}
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map((province) => (
              <option key={province.isoCode} value={province.isoCode}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kota/Kabupaten {required && '*'}
        </label>
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={!selectedProvince}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${!selectedProvince ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">
            {selectedProvince ? 'Pilih Kota/Kabupaten' : 'Pilih provinsi terlebih dahulu'}
          </option>
          {cities.map((city) => (
            <option key={`${city.stateCode}-${city.name}`} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Selected Location Display */}
      {value && (
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">
            <strong>Lokasi yang dipilih:</strong> {value}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker; 