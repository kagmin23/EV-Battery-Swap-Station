import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for staff management
export interface Staff {
    _id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: 'staff';
    isVerified: boolean;
    status: 'active' | 'locked';
    station?: string | null;
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

export interface CreateStaffRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    stationId?: string;
}

export interface UpdateStaffRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    stationId?: string;
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

export class StaffService {
    /**
     * Get all staff members
     */
    static async getAllStaff(): Promise<Staff[]> {
        try {
            const response = await apiClient.get<ApiResponse<Staff[]>>('/admin/staff');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch staff');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to access this resource');
                } else if (error.response?.status === 404) {
                    throw new Error('Staff not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while fetching staff');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Create a new staff member
     */
    static async createStaff(staffData: CreateStaffRequest): Promise<Staff> {
        try {
            const response = await apiClient.post<ApiResponse<Staff>>('/admin/staff', staffData);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create staff');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new Error('Invalid input: Please check your data');
                } else if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to create staff');
                } else if (error.response?.status === 409) {
                    throw new Error('Email or phone number already exists');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while creating staff');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Update an existing staff member
     */
    static async updateStaff(staffId: string, staffData: UpdateStaffRequest): Promise<Staff> {
        try {
            const response = await apiClient.put<ApiResponse<Staff>>(`/admin/staff/${staffId}`, staffData);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update staff');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new Error('Invalid input: Please check your data');
                } else if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to update staff');
                } else if (error.response?.status === 404) {
                    throw new Error('Staff not found');
                } else if (error.response?.status === 409) {
                    throw new Error('Email or phone number already exists');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while updating staff');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Delete a staff member
     */
    static async deleteStaff(staffId: string): Promise<void> {
        try {
            const response = await apiClient.delete<ApiResponse<null>>(`/admin/staff/${staffId}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete staff');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to delete staff');
                } else if (error.response?.status === 404) {
                    throw new Error('Staff not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while deleting staff');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Change staff status (active/locked)
     */
    static async changeStaffStatus(staffId: string, status: 'active' | 'locked'): Promise<Staff> {
        try {
            const response = await apiClient.put<ApiResponse<Staff>>(`/admin/users/${staffId}/status`, { status });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to change staff status');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new Error('Invalid input: Please check your data');
                } else if (error.response?.status === 401) {
                    throw new Error('Unauthorized: Please login again');
                } else if (error.response?.status === 403) {
                    throw new Error('Forbidden: You do not have permission to change staff status');
                } else if (error.response?.status === 404) {
                    throw new Error('Staff not found');
                } else if (error.response?.status === 500) {
                    throw new Error('Server error: Please try again later');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout: Please check your connection');
                } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    throw new Error('Network error: Please check your internet connection');
                } else {
                    throw new Error(error.response?.data?.message || 'An error occurred while changing staff status');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }
}

export default StaffService;
