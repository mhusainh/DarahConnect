import { State, City } from 'country-state-city';

// Indonesia country code is 'ID'
const INDONESIA_COUNTRY_CODE = 'ID';

export interface IndonesiaState {
  isoCode: string;
  name: string;
}

export interface IndonesiaCity {
  name: string;
  stateCode: string;
}

// Get all Indonesian provinces/states
export const getIndonesianProvinces = (): IndonesiaState[] => {
  const states = State.getStatesOfCountry(INDONESIA_COUNTRY_CODE);
  return states.map(state => ({
    isoCode: state.isoCode,
    name: state.name
  }));
};

// Get all cities in a specific Indonesian province
export const getIndonesianCities = (stateCode: string): IndonesiaCity[] => {
  const cities = City.getCitiesOfState(INDONESIA_COUNTRY_CODE, stateCode);
  return cities.map(city => ({
    name: city.name,
    stateCode: city.stateCode
  }));
};

// Get formatted location string
export const formatLocation = (cityName: string, provinceName: string): string => {
  return `${cityName}, ${provinceName}`;
}; 