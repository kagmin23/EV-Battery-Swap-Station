import Constants from 'expo-constants';

interface Config {
  API_BASE_URL: string;
  NODE_ENV: string;
  APP_NAME: string;
  APP_VERSION: string;
}

// Get config values from Expo config or environment variables
const getConfig = (): Config => {
  // For Expo, environment variables are available through Constants.expoConfig?.extra
  const extra = Constants.expoConfig?.extra || {};
  
  return {
    API_BASE_URL: extra.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8001/api',
    NODE_ENV: extra.NODE_ENV || process.env.NODE_ENV || 'development',
    APP_NAME: extra.EXPO_PUBLIC_APP_NAME || process.env.EXPO_PUBLIC_APP_NAME || 'EV Battery Swap Station',
    APP_VERSION: extra.EXPO_PUBLIC_APP_VERSION || process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  };
};

export const config = getConfig();

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isStaging = () => config.NODE_ENV === 'staging';

// Log configuration in development
if (isDevelopment()) {
  console.log('App Configuration:', {
    API_BASE_URL: config.API_BASE_URL,
    NODE_ENV: config.NODE_ENV,
    APP_NAME: config.APP_NAME,
    APP_VERSION: config.APP_VERSION,
  });
}

export default config;