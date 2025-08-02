// Environment variable setup and validation utilities

export const ENV_CONFIG = {
  // ChatBot Configuration
  CHATBOT_WEBHOOK_URL: process.env.REACT_APP_CHATBOT_WEBHOOK_URL || 'https://vertically-possible-amoeba.ngrok-free.app/webhook-test/0f8b8e46-3150-4d54-9ed4-5bf0d7952d17',
  
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://apidarahconnect.experienceroleplay.online/api/v1',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  
  // Debug Configuration
  DEBUG_API: process.env.REACT_APP_DEBUG_API === 'true',
  DEBUG_VERBOSE: process.env.REACT_APP_DEBUG_VERBOSE === 'true',
  
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
};

// Validate required environment variables
export const validateEnvironment = () => {
  const missingVars: string[] = [];
  
  if (!ENV_CONFIG.CHATBOT_WEBHOOK_URL) {
    missingVars.push('REACT_APP_CHATBOT_WEBHOOK_URL');
  }
  
  if (!ENV_CONFIG.GOOGLE_MAPS_API_KEY) {
    missingVars.push('REACT_APP_GOOGLE_MAPS_API_KEY');
  }
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.warn('Please create a .env file in the project root with the following variables:');
    missingVars.forEach(varName => {
      console.warn(`  ${varName}=your_value_here`);
    });
  }
  
  return missingVars.length === 0;
};

// Generate session ID for chatbot
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${randomString}`;
};

// Check if running in development
export const isDevelopment = (): boolean => {
  return ENV_CONFIG.ENV === 'development' || process.env.NODE_ENV === 'development';
};

// Check if running in production
export const isProduction = (): boolean => {
  return ENV_CONFIG.ENV === 'production' || process.env.NODE_ENV === 'production';
};

export default ENV_CONFIG; 