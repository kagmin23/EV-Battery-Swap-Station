import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

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
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface Transaction {
    transaction_id: string;
    user_id: string;
    station_id: string;
    battery_given: string | null;
    battery_returned: string | null;
    vehicle_id: string | null;
    battery_id: string | null;
    booking_id: string | null;
    transaction_time: string;
    cost: number;
}

export interface TransactionResponse {
    success: boolean;
    data: Transaction[];
    message?: string;
}

export interface TransactionDetailResponse {
    success: boolean;
    data: Transaction;
    message?: string;
}

export interface TransactionFilters {
    user_id?: string;
    station_id?: string;
    limit?: number;
}

export class TransactionService {
    // Admin: Get all transactions with filters
    static async getAllTransactions(filters: TransactionFilters = {}): Promise<TransactionResponse> {
        try {
            const params = new URLSearchParams();
            if (filters.user_id) params.append('user_id', filters.user_id);
            if (filters.station_id) params.append('station_id', filters.station_id);
            if (filters.limit) params.append('limit', filters.limit.toString());

            const response = await api.get(`/transactions/admin?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    // Admin: Get transaction by ID
    static async getTransactionById(transactionId: string): Promise<TransactionDetailResponse> {
        try {
            const response = await api.get(`/transactions/admin/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
    }

    // Staff: Get transactions by station
    static async getTransactionsByStation(stationId: string, limit?: number): Promise<TransactionResponse> {
        try {
            const params = new URLSearchParams();
            params.append('stationId', stationId);
            if (limit) params.append('limit', limit.toString());

            const response = await api.get(`/transactions/station?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching station transactions:', error);
            throw error;
        }
    }

    // Staff: Get station transaction by ID
    static async getStationTransactionById(transactionId: string): Promise<TransactionDetailResponse> {
        try {
            const response = await api.get(`/transactions/station/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching station transaction:', error);
            throw error;
        }
    }

    // Driver: Get my transactions
    static async getMyTransactions(): Promise<TransactionResponse> {
        try {
            const response = await api.get('/transactions/me');
            return response.data;
        } catch (error) {
            console.error('Error fetching my transactions:', error);
            throw error;
        }
    }

    // Driver: Get my transaction by ID
    static async getMyTransactionById(transactionId: string): Promise<TransactionDetailResponse> {
        try {
            const response = await api.get(`/transactions/me/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching my transaction:', error);
            throw error;
        }
    }
}
