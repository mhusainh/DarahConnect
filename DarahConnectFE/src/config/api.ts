// API Configuration
export const API_CONFIG = {
  // Base URL untuk API backend
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  
  // Timeout untuk request
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  
  // Debug configuration
  DEBUG: process.env.REACT_APP_DEBUG_API === 'true',
  DEBUG_VERBOSE: process.env.REACT_APP_DEBUG_VERBOSE === 'true',
  
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  
  // Headers default
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Debug console function
export const debugConsole = {
  log: (message: string, data?: any) => {
    if (API_CONFIG.DEBUG) {
      console.log(`🔧 [API DEBUG] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (API_CONFIG.DEBUG) {
      console.error(`❌ [API ERROR] ${message}`, error || '');
    }
  },
  
  success: (message: string, data?: any) => {
    if (API_CONFIG.DEBUG) {
      console.log(`✅ [API SUCCESS] ${message}`, data || '');
    }
  },
  
  request: (method: string, url: string, data?: any) => {
    if (API_CONFIG.DEBUG && API_CONFIG.DEBUG_VERBOSE) {
      console.log(`📤 [API REQUEST] ${method.toUpperCase()} ${url}`, data || '');
    }
  },
  
  response: (method: string, url: string, response: any) => {
    if (API_CONFIG.DEBUG && API_CONFIG.DEBUG_VERBOSE) {
      console.log(`📥 [API RESPONSE] ${method.toUpperCase()} ${url}`, response);
    }
  }
};

export default API_CONFIG; 