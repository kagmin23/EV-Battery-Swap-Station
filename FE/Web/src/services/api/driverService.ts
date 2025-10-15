import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for driver management
export interface Driver {
    _id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: 'driver';
    isVerified: boolean;
    status: 'active' | 'locked';
    avatar?: string | null;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: string | null;
    emailOTP?: string;
    emailOTPExpires?: string;
    emailOTPLastSentAt?: string;
    emailOTPResendCount?: number;
    emailOTPResendWindowStart?: string;
    passwordResetOTP?: string | null;
    passwordResetOTPExpires?: string | null;
    passwordResetOTPLastSentAt?: string | null;
    passwordResetOTPResendCount?: number;
    passwordResetOTPResendWindowStart?: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CreateDriverRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
}

export interface UpdateDriverRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
}

export interface ChangeStatusRequest {
    status: 'active' | 'locked';
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Log error for debugging
        console.error('API Error:', error.response?.data || error.message);

        return Promise.reject(error);
    }
);

export class DriverService {
    /**
     * Get all drivers (customers with role 'driver')
     */
    static async getAllDrivers(): Promise<Driver[]> {
        try {
            const response = await apiClient.get<ApiResponse<Driver[]>>('/admin/customers');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch drivers');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to access this resource');
                } else if (error.response?.status === 404) {
                    throw new Error('Drivers not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while fetching drivers');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Get driver by ID
     */
    static async getDriverById(driverId: string): Promise<Driver> {
        try {
            const response = await apiClient.get<ApiResponse<Driver>>(`/admin/customers/${driverId}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch driver');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to access this resource');
                } else if (error.response?.status === 404) {
                    throw new Error('Driver not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while fetching driver');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Change driver status (active/locked)
     */
    static async changeDriverStatus(driverId: string, status: 'active' | 'locked'): Promise<Driver> {
        try {
            const response = await apiClient.put<ApiResponse<Driver>>(`/admin/users/${driverId}/status`, { status });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to change driver status');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new Error('Invalid input: Please check your data');
                } else if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to change driver status');
                } else if (error.response?.status === 404) {
                    throw new Error('Driver not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while changing driver status');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Change driver role (admin only)
     */
    static async changeDriverRole(driverId: string, role: 'admin' | 'driver' | 'staff'): Promise<Driver> {
        try {
            const response = await apiClient.put<ApiResponse<Driver>>(`/admin/users/${driverId}/role`, { role });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to change driver role');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new Error('Invalid input: Please check your data');
                } else if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to change driver role');
                } else if (error.response?.status === 404) {
                    throw new Error('Driver not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while changing driver role');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Delete driver account (admin only)
     */
    static async deleteDriver(driverId: string): Promise<void> {
        try {
            const response = await apiClient.delete<ApiResponse<null>>(`/admin/users/${driverId}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete driver');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to delete driver');
                } else if (error.response?.status === 404) {
                    throw new Error('Driver not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while deleting driver');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }
}

export default DriverService;
