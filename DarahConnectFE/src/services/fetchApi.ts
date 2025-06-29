import { API_CONFIG, debugConsole } from '../config/api';
import { notificationManager, shouldShowNotification, getMethodDisplayName } from '../utils/notification';

// Interface untuk response API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Interface untuk request options
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// Fungsi untuk membuat timeout
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

// Helper untuk cek apakah endpoint memerlukan authentication
const requiresAuth = (endpoint: string): boolean => {
  // Endpoints yang tidak memerlukan token
  const publicEndpoints = [
    '/register',
    '/login',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/campaign'
  ];
  
  // Cek apakah endpoint adalah public endpoint
  return !publicEndpoints.some(publicEndpoint => 
    endpoint.includes(publicEndpoint) || endpoint.endsWith(publicEndpoint)
  );
};

// Helper untuk mendapatkan auth token dari localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    debugConsole.error('Error getting auth token from localStorage', error);
    return null;
  }
};

// Helper untuk performance timing
const logPerformance = (method: string, endpoint: string, startTime: number) => {
  if (!API_CONFIG.DEBUG) return;
  
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  const emoji = duration < 100 ? '⚡' : duration < 500 ? '🐌' : '🐢';
  
  console.log(`${emoji} [${method}] ${endpoint} - Duration: ${duration}ms`);
};

// Helper untuk logging data yang dikirim
const logRequestData = (method: string, endpoint: string, data: any) => {
  if (!API_CONFIG.DEBUG) return;
  
  const hasData = data !== undefined && data !== null;
  
  if (['POST', 'PUT', 'PATCH'].includes(method) && hasData) {
    console.group(`🔧 [${method}] ${endpoint} - Data yang dikirim:`);
    
    try {
      // Parse JSON jika string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      console.log('📦 Raw Data:', data);
      console.log('📋 Parsed Data:', parsedData);
      
      // Show data structure
      if (typeof parsedData === 'object' && parsedData !== null) {
        console.log('🔍 Data Structure:');
        Object.keys(parsedData).forEach(key => {
          const value = parsedData[key];
          const type = typeof value;
          console.log(`  • ${key}: ${type}`, value);
        });
        
        // Show data size
        const dataSize = JSON.stringify(parsedData).length;
        console.log(`📏 Data Size: ${dataSize} bytes`);
      }
      
    } catch (error) {
      console.log('⚠️ Could not parse data:', data);
    }
    
    console.groupEnd();
  } else if (method === 'DELETE') {
    console.log(`🗑️ [DELETE] ${endpoint} - Menghapus resource`);
  }
};

// Fungsi fetch API utama
export const fetchApi = async <T = any>(
  endpoint: string,
  options: RequestInit & RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  const startTime = performance.now();
  
  // Debug request dengan detail data
  debugConsole.request(method, url, options.body);
  logRequestData(method, endpoint, options.body);
  
  try {
    // Setup headers
    const headers: Record<string, string> = Object.assign(
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      options.headers || {}
    );
    
    // Tambahkan Bearer token otomatis jika endpoint memerlukan auth
    if (requiresAuth(endpoint)) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        
        // Debug token info
        if (API_CONFIG.DEBUG) {
          console.log(`🔐 [${method}] ${endpoint} - Auth Token: Bearer [${token.substring(0, 20)}...]`);
        }
      } else {
        // Warning jika endpoint memerlukan auth tapi tidak ada token
        if (API_CONFIG.DEBUG) {
          console.warn(`⚠️ [${method}] ${endpoint} - Endpoint memerlukan authentication tapi token tidak ditemukan`);
        }
      }
    } else {
      // Debug info untuk public endpoints
      if (API_CONFIG.DEBUG) {
        console.log(`🌐 [${method}] ${endpoint} - Public endpoint (tidak memerlukan token)`);
      }
    }
    
    // Debug headers jika verbose mode
    if (API_CONFIG.DEBUG && API_CONFIG.DEBUG_VERBOSE) {
      console.group(`📋 [${method}] ${endpoint} - Headers:`);
      Object.entries(headers).forEach(([key, value]) => {
        // Hide sensitive headers
        const sensitiveHeaders = ['authorization', 'auth', 'token', 'password'];
        const isSensitive = sensitiveHeaders.some(h => key.toLowerCase().includes(h));
        console.log(`  • ${key}: ${isSensitive ? '[HIDDEN]' : value}`);
      });
      console.groupEnd();
    }
    
    // Setup fetch options
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };
    
    // Create timeout promise
    const timeoutMs = options.timeout || API_CONFIG.TIMEOUT;
    const timeoutPromise = createTimeout(timeoutMs);
    
    // Fetch dengan timeout
    const response = await Promise.race([
      fetch(url, fetchOptions),
      timeoutPromise
    ]);
    
    // Parse response
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Debug response
    debugConsole.response(method, url, {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });
    
    // Debug response detail jika verbose mode
    if (API_CONFIG.DEBUG && API_CONFIG.DEBUG_VERBOSE) {
      console.group(`📥 [${method}] ${endpoint} - Response Detail:`);
      console.log('🔢 Status:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
      console.log('📦 Content-Type:', contentType);
      
      if (responseData) {
        console.log('📄 Response Data:', responseData);
        
        if (typeof responseData === 'object' && responseData !== null) {
          console.log('🔍 Response Structure:');
          Object.keys(responseData).forEach(key => {
            const value = (responseData as Record<string, any>)[key];
            const type = typeof value;
            console.log(`  • ${key}: ${type}`, value);
          });
        }
        
        const responseSize = responseData ? JSON.stringify(responseData).length : 0;
        console.log(`📏 Response Size: ${responseSize} bytes`);
      }
      
      console.groupEnd();
    }
    
    // Handle response
    if (response.ok) {
      debugConsole.success(`Request berhasil: ${method} ${endpoint}`, responseData);
      logPerformance(method, endpoint, startTime);
      
      // Show success notification for non-GET methods
      if (shouldShowNotification(method)) {
        const action = getMethodDisplayName(method);
        notificationManager.showSuccess(
          `SUCCESS`,
          responseData.meta?.message || 'Request successful'
        );
      }
      
      // Extract data from backend response format: {meta: {...}, data: {...}}
      const extractedData = responseData?.data || responseData;
      
      return {
        success: true,
        data: extractedData,
        status: response.status,
      };
    } else {
      debugConsole.error(`Request gagal: ${method} ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      logPerformance(method, endpoint, startTime);
      
      // Cek berbagai struktur error message dari backend
      let errorMessage = 'Request failed';
      
      if (responseData?.meta?.message) {
        // Format: { data: null, meta: { message: "Error message" } }
        errorMessage = responseData.meta.message;
      } else if (responseData?.message) {
        // Format: { message: "Error message" }
        errorMessage = responseData.message;
      } else if (responseData?.error) {
        // Format: { error: "Error message" }
        errorMessage = responseData.error;
      } else if (response.statusText) {
        // Fallback ke HTTP status text
        errorMessage = response.statusText;
      }
      
      // Show error notification for non-GET methods
      if (shouldShowNotification(method)) {
        const action = getMethodDisplayName(method);
        notificationManager.showError(
          `${action} Gagal`,
          errorMessage
        );
      }
      
      return {
        success: false,
        error: errorMessage,
        status: response.status,
        data: responseData,
      };
    }
    
  } catch (error: any) {
    debugConsole.error(`Network error: ${method} ${endpoint}`, error);
    logPerformance(method, endpoint, startTime);
    
    return {
      success: false,
      error: error.message || 'Network error occurred',
      status: 0,
    };
  }
};

// GET request
export const getApi = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  return fetchApi<T>(endpoint, { ...options, method: 'GET' });
};

// POST request
export const postApi = async <T = any>(
  endpoint: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  
  // Debug POST data summary
  if (API_CONFIG.DEBUG) {
    console.log(`📤 [POST] ${endpoint} - Summary:`, {
      hasData: !!data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }
  
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// PUT request
export const putApi = async <T = any>(
  endpoint: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  
  // Debug PUT data summary
  if (API_CONFIG.DEBUG) {
    console.log(`🔄 [PUT] ${endpoint} - Summary:`, {
      hasData: !!data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }
  
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// PATCH request
export const patchApi = async <T = any>(
  endpoint: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  
  // Debug PATCH data summary
  if (API_CONFIG.DEBUG) {
    console.log(`🔧 [PATCH] ${endpoint} - Summary:`, {
      hasData: !!data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }
  
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE request
export const deleteApi = async <T = any>(
  endpoint: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  
  // Debug DELETE dengan data jika ada
  if (API_CONFIG.DEBUG && data) {
    console.group(`🗑️ [DELETE] ${endpoint} - Data yang dikirim:`);
    console.log('📦 Delete Data:', data);
    console.groupEnd();
  }
  
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export default {
  fetchApi,
  getApi,
  postApi,
  putApi,
  patchApi,
  deleteApi,
}; 