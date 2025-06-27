import { jwtDecode } from 'jwt-decode';

// Interface untuk JWT payload dari backend
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  name: string;
  iss: string;
  exp: number;
}

// Interface untuk user data yang disimpan di localStorage
export interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Decode JWT token dan return user data
 * @param token JWT token string
 * @returns UserData object atau null jika gagal
 */
export const decodeJWTToken = (token: string): UserData | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('🔒 JWT Token expired');
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    console.error('❌ JWT Decode Error:', error);
    return null;
  }
};

/**
 * Check if JWT token is valid and not expired
 * @param token JWT token string
 * @returns boolean
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Get user data from localStorage
 * @returns UserData object atau null
 */
export const getUserData = (): UserData | null => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    return null;
  }
};

/**
 * Save authentication data to localStorage
 * @param token JWT token
 * @param userData User data object
 */
export const saveAuthData = (token: string, userData: UserData): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userData', JSON.stringify(userData));
  
  console.log('💾 Auth data saved:', { 
    hasToken: !!token, 
    userData: userData 
  });
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userData');
  
  console.log('🗑️ Auth data cleared');
};

/**
 * Get current auth token from localStorage
 * @returns token string atau null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user is currently logged in
 * @returns boolean
 */
export const isLoggedIn = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  return isTokenValid(token);
}; 