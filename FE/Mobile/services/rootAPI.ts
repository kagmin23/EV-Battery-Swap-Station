import { ApiError } from '@/features/auth/types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { config } from '../config/env';

const BASE_URL = config.API_BASE_URL;
const TOKEN_KEY = 'auth_token';

// Debug: Log the base URL being used
console.log('🔧 API Configuration:', {
  BASE_URL,
  CONFIG_SOURCE: 'config.API_BASE_URL',
  TIMESTAMP: new Date().toISOString()
});

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Automatically add auth token if available
    AsyncStorage.getItem(TOKEN_KEY).then((token) => {
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }).catch((error) => {
      console.warn('Failed to get auth token:', error);
    });

    // Ensure headers exist
    if (!config.headers) {
      config.headers = {};
    }

    // Log requests in development
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers,
      });
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Check if this is an email verification error (not a real error)
    const isEmailVerificationError = error?.response?.data?.message?.includes('Account not verified') ||
      error?.response?.data?.message?.includes('verify') ||
      error?.response?.data?.message?.includes('OTP') ||
      error?.response?.data?.requireEmailVerification === true;

    if (__DEV__ && !isEmailVerificationError) {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Transform axios error to our ApiError format
    const apiError: ApiError = {
      success: false,
      message: 'Network error occurred',
      errors: {},
    };

    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      apiError.message = responseData?.message || `HTTP Error ${error.response.status}`;
      apiError.errors = responseData?.errors || {};
      
      // Preserve email verification flag
      if (isEmailVerificationError) {
        (apiError as any).requireEmailVerification = true;
      }
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'Unable to connect to server. Please check your internet connection.';
    } else {
      // Something else happened
      apiError.message = error.message || 'An unexpected error occurred';
    }

    return Promise.reject(apiError);
  }
);

// HTTP client wrapper
const httpClient = {
  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: any;
      headers?: { [key: string]: string };
      params?: { [key: string]: any };
    } = {}
  ): Promise<T> {
    const { method = 'GET', data, headers = {}, params } = options;
    
    const config: any = {
      method,
      url: endpoint,
      data,
      params,
      headers,
    };

    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      throw error; // Error is already transformed by interceptor
    }
  },

  // Convenience methods
  async get<T>(endpoint: string, params?: any, headers?: { [key: string]: string }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, headers });
  },

  async post<T>(endpoint: string, data?: any, headers?: { [key: string]: string }): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data, headers });
  },

  async put<T>(endpoint: string, data?: any, headers?: { [key: string]: string }): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data, headers });
  },

  async patch<T>(endpoint: string, data?: any, headers?: { [key: string]: string }): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data, headers });
  },

  async delete<T>(endpoint: string, headers?: { [key: string]: string }): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  },
};

export default httpClient;