import { ApiError } from '@/features/auth/types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { config } from '../config/env';

const BASE_URL = config.API_BASE_URL;
const TOKEN_KEY = 'auth_token';

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
    }).catch(() => {
      // Silently handle token retrieval errors
    });

    // Ensure headers exist
    if (!config.headers) {
      config.headers = {};
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if this is an email verification error (403 status with specific data)
    const isEmailVerificationError = error?.response?.status === 403 &&
      (error?.response?.data?.data?.requireEmailVerification === true ||
       error?.response?.data?.message?.includes('Account not verified') ||
       error?.response?.data?.message?.includes('verify') ||
       error?.response?.data?.message?.includes('OTP'));

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
      
      // Preserve email verification flag and data
      if (isEmailVerificationError) {
        (apiError as any).requireEmailVerification = true;
        (apiError as any).data = responseData?.data; // Include nextActions etc.
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