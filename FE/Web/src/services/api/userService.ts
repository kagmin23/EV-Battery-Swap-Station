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

export interface User {
    _id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: 'admin' | 'staff' | 'driver';
    isVerified: boolean;
    status: 'active' | 'locked';
    avatar?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserResponse {
    success: boolean;
    data: User[];
    message?: string;
}

export class UserService {
    // Get all users (admin only)
    static async getAllUsers(): Promise<UserResponse> {
        try {
            const response = await api.get('/admin/customers');
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Get user by ID
    static async getUserById(userId: string): Promise<{ success: boolean; data: User; message?: string }> {
        try {
            const response = await api.get(`/admin/customers/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
}
