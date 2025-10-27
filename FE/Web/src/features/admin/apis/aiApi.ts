import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for AI predictions
export interface AIPredictionResponse {
    success: boolean;
    data: {
        suggest: string;
    };
}

export interface AIInsight {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    actionable: boolean;
    createdAt: string;
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

// AI Service
export class AIApi {
    // Get AI predictions
    static async getPredictions(): Promise<AIPredictionResponse> {
        try {
            const response = await api.get('/admin/ai/predictions');
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
                            throw new Error('Forbidden: You do not have permission to access AI predictions');
                        case 404:
                            throw new Error('Not Found: AI predictions endpoint not found');
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

export default AIApi;
