import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for admin management
export interface Complaint {
    _id: string;
    userId: string;
    orderId?: string;
    description: string;
    category: string;
    status: 'pending' | 'resolved';
    response?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UsageReport {
    frequency: any[];
    peakHours: any[];
}

export interface AIPrediction {
    suggest: string;
}

export interface ReportsOverview {
    revenue: number;
    swaps: number;
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
        // Don't redirect on 401 - let individual pages handle it
        return Promise.reject(error);
    }
);

// Admin Service
export class AdminService {
    /**
     * Get all complaints
     */
    static async getAllComplaints(): Promise<Complaint[]> {
        try {
            const response = await api.get<{ success: boolean; data: Complaint[] }>(
                '/admin/complaints'
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error('Failed to fetch complaints');
            }
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
                            throw new Error('Forbidden: You do not have permission to access complaints');
                        case 404:
                            throw new Error('Not Found: Complaints not found');
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

    /**
     * Resolve a complaint
     */
    static async resolveComplaint(id: string, response: string): Promise<Complaint> {
        try {
            const res = await api.put<{ success: boolean; data: Complaint; message: string }>(
                `/admin/complaints/${id}/resolve`,
                { response }
            );

            if (res.data.success) {
                return res.data.data;
            } else {
                throw new Error(res.data.message || 'Failed to resolve complaint');
            }
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
                            throw new Error('Forbidden: You do not have permission to resolve complaints');
                        case 404:
                            throw new Error('Not Found: Complaint not found');
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

    /**
     * Get usage reports
     */
    static async getUsageReports(): Promise<UsageReport> {
        try {
            const response = await api.get<{ success: boolean; data: UsageReport }>(
                '/admin/reports/usage'
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error('Failed to fetch usage reports');
            }
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
                            throw new Error('Forbidden: You do not have permission to access usage reports');
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

    /**
     * Get AI predictions
     */
    static async getAIPredictions(): Promise<AIPrediction> {
        try {
            const response = await api.get<{ success: boolean; data: AIPrediction }>(
                '/admin/ai/predictions'
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error('Failed to fetch AI predictions');
            }
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
                            throw new Error('Forbidden: You do not have permission to access AI predictions');
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

    /**
     * Get reports overview
     */
    static async getReportsOverview(): Promise<ReportsOverview> {
        try {
            const response = await api.get<{ success: boolean; data: ReportsOverview }>(
                '/admin/reports/overview'
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error('Failed to fetch reports overview');
            }
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
                            throw new Error('Forbidden: You do not have permission to access reports overview');
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

export default AdminService;

