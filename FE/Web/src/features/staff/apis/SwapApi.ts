import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

export interface SwapRequest {
    _id: string;
    driver: {
        _id: string;
        fullName: string;
        phoneNumber: string;
        email: string;
    };
    oldBattery: {
        _id: string;
        serial: string;
        model?: string;
        soh: number;
        status: string;
    };
    newBattery?: {
        _id: string;
        serial: string;
        model?: string;
        soh: number;
        status: string;
    };
    station: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    requestedAt: string;
    confirmedAt?: string;
    completedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Create axios instance with interceptors
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
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Get all swap requests
export const getSwapRequests = async (): Promise<SwapRequest[]> => {
    try {
        const response = await apiClient.get<ApiResponse<SwapRequest[]>>('/staff/swap/requests');
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch swap requests');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch swap requests');
        }
        throw new Error('Failed to fetch swap requests');
    }
};

// Confirm a swap request
export const confirmSwapRequest = async (requestId: string): Promise<SwapRequest> => {
    try {
        const response = await apiClient.put<ApiResponse<SwapRequest>>(`/staff/swap/requests/${requestId}/confirm`);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to confirm swap request');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to confirm swap request');
        }
        throw new Error('Failed to confirm swap request');
    }
};

// Record a returned battery
export const recordReturnedBattery = async (returnId: string): Promise<unknown> => {
    try {
        const response = await apiClient.put<ApiResponse<unknown>>(`/staff/swap/returns/${returnId}`);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to record returned battery');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to record returned battery');
        }
        throw new Error('Failed to record returned battery');
    }
};

