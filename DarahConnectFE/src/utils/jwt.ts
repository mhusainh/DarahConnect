import { debugConsole } from '../config/api';
import { notificationManager } from './notification';

// Interface untuk JWT payload dari backend
export interface JWTPayload {
  is_new(is_new: any): unknown;
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
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
export const decodeJWTToken = (token: string): JWTPayload | null => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode payload (base64url)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);

    debugConsole.log('JWT Decoded', parsedPayload);

    return parsedPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if JWT token is valid and not expired
 * @param token JWT token string
 * @returns boolean
 */
export const isTokenValid = (token: string): boolean => {
  const payload = decodeJWTToken(token);
  if (!payload) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
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
export const saveAuthData = (token: string, userData: JWTPayload) => {
  try {
    localStorage.setItem('authToken', token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', userData.name);
    
    // Set admin flag based on user role
    const isAdmin = userData.role === 'Administrator';
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    
    debugConsole.log('Auth data saved successfully', {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isAdmin: isAdmin,
      expires: new Date(userData.exp * 1000)
    });
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdmin');
    
    debugConsole.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
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

// Auth Error Handling
export interface AuthErrorOptions {
  skipNotification?: boolean;
  skipRedirect?: boolean;
  customMessage?: string;
}

export const handleAuthError = (
  errorMessage: string, 
  endpoint: string, 
  options: AuthErrorOptions = {}
) => {
  const {
    skipNotification = false,
    skipRedirect = false,
    customMessage
  } = options;

  const finalMessage = customMessage || errorMessage || 'Sesi Anda telah berakhir. Silakan login kembali.';

  debugConsole.log(`Handling auth error for ${endpoint}`, { 
    errorMessage: finalMessage,
    skipNotification,
    skipRedirect 
  });

  // Store error message for display on login page
  try {
    localStorage.setItem('loginError', finalMessage);
    localStorage.setItem('loginErrorTime', Date.now().toString());
  } catch (error) {
    debugConsole.error('Error storing login error message', error);
  }

  // Clear session data
  clearAuthData();

  // Show notification if not skipped
  if (!skipNotification) {
    notificationManager.showError(
      'Sesi Berakhir',
      'Anda harus login ulang untuk melanjutkan'
    );
  }

  // Redirect to login if not skipped
  if (!skipRedirect) {
    // Use setTimeout to avoid potential issues with immediate redirects
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

export const check401Error = (status: number | undefined, errorMessage: string, endpoint: string, options: AuthErrorOptions = {}) => {
  if (status === 401) {
    handleAuthError(errorMessage, endpoint, options);
    return true;
  }
  return false;
};

// Token validation and refresh
export const validateCurrentSession = (): boolean => {
  try {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!token || !isLoggedIn) {
      debugConsole.log('No valid session found');
      return false;
    }

    if (!isTokenValid(token)) {
      debugConsole.log('Token expired, clearing session');
      clearAuthData();
      return false;
    }

    return true;
  } catch (error) {
    debugConsole.error('Error validating session', error);
    clearAuthData();
    return false;
  }
};

// Get current user info from token
export const getCurrentUserInfo = (): JWTPayload | null => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const payload = decodeJWTToken(token);
    if (!payload || !isTokenValid(token)) {
      clearAuthData();
      return null;
    }

    return payload;
  } catch (error) {
    debugConsole.error('Error getting current user info', error);
    return null;
  }
};

// Check if user needs to login
export const requiresAuthentication = (pathname: string): boolean => {
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/about',
    '/campaigns',
    '/blood-requests'
  ];

  return !publicPaths.includes(pathname) && !pathname.startsWith('/campaign/');
};

export default {
  decodeJWTToken,
  isTokenValid,
  saveAuthData,
  clearAuthData,
  handleAuthError,
  check401Error,
  validateCurrentSession,
  getCurrentUserInfo,
  requiresAuthentication,
}; 