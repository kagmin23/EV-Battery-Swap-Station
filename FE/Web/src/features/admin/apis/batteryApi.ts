import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for battery data
export interface Battery {
    _id: string;
    serial: string;
    model: string;
    soh: number;
    status: 'charging' | 'faulty' | 'idle' | 'full' | 'in-use' | 'is-booking';
    station?: {
        _id: string;
        stationName: string;
        address: string;
    };
    manufacturer?: string;
    capacity_kwh?: number;
    voltage?: number;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface BatteryApiResponse {
    success: boolean;
    data: Battery[];
}

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Battery Service
export class BatteryApi {
    // Get all batteries
    static async getAllBatteries(): Promise<BatteryApiResponse> {
        try {
            const response = await api.get('/batteries/model');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with error status
                    const status = error.response.status;
                    const message = error.response.data?.message || 'Server error';

                    switch (status) {
                        case 400:
                            throw new Error(`Bad Request: ${message}`);
                        case 401:
                            throw new Error('Unauthorized: Please login again');
                        case 403:
                            throw new Error('Forbidden: You do not have permission to access batteries');
                        case 404:
                            throw new Error('Not Found: Batteries endpoint not found');
                        case 500:
                            throw new Error('Internal Server Error: Please try again later');
                        default:
                            throw new Error(`Error ${status}: ${message}`);
                    }
                } else if (error.request) {
                    // Network error
                    throw new Error('Network Error: Please check your internet connection');
                } else {
                    // Other error
                    throw new Error(`Request Error: ${error.message}`);
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }
}

export default BatteryApi;
