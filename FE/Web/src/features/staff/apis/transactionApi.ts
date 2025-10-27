import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for transaction management
export interface TransactionApiResponse {
    _id: string;
    userId: string;
    stationId: string;
    batteryIdGiven?: string;
    batteryIdReturned?: string;
    amount: number;
    transactionType: string;
    status: string;
    paymentMethod?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    // Extended fields for display
    user?: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
    station?: {
        _id: string;
        stationName: string;
        address: string;
        city: string;
    };
    batteryGiven?: {
        _id: string;
        batteryId: string;
        model: string;
        soh: number;
        chargeLevel: number;
    };
    batteryReturned?: {
        _id: string;
        batteryId: string;
        model: string;
        soh: number;
        chargeLevel: number;
    };
}

export interface GetTransactionsParams {
    user_id?: string;
    station_id?: string;
    limit?: number;
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

// Transaction Service for Staff
export class TransactionApi {
    // Get all transactions (admin)
    static async getAllTransactions(params?: GetTransactionsParams): Promise<TransactionApiResponse[]> {
        try {
            const response = await api.get('/transactions/admin', { params });
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch transactions');
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
                            throw new Error('Forbidden: You do not have permission to access transactions');
                        case 404:
                            throw new Error('Not Found: Transactions endpoint not found');
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

    // Get transaction by ID
    static async getTransactionById(id: string): Promise<TransactionApiResponse> {
        try {
            const response = await api.get(`/transactions/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch transaction');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message || 'Server error';

                    switch (status) {
                        case 400:
                            throw new Error(`Bad Request: ${message}`);
                        case 401:
                            throw new Error('Unauthorized: Please login again');
                        case 403:
                            throw new Error('Forbidden: You do not have permission to access this transaction');
                        case 404:
                            throw new Error('Not Found: Transaction not found');
                        case 500:
                            throw new Error('Internal Server Error: Please try again later');
                        default:
                            throw new Error(`Error ${status}: ${message}`);
                    }
                } else if (error.request) {
                    throw new Error('Network Error: Please check your internet connection');
                } else {
                    throw new Error(`Request Error: ${error.message}`);
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }
}

export default TransactionApi;

