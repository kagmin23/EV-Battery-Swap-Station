import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for admin management
export interface FeedbackUser {
    _id: string;
    email?: string;
    fullName?: string;
}

export interface FeedbackStation {
    _id: string;
    stationName?: string;
    address?: string;
    city?: string;
    district?: string;
}

export interface FeedbackBattery {
    _id: string;
    serial?: string;
    model?: string;
    status?: string;
    manufacturer?: string;
    capacity_kWh?: number;
    price?: number;
    voltage?: number;
}

export interface FeedbackBooking {
    _id: string;
    user?: string;
    vehicle?: string;
    station?: FeedbackStation & { batteryCounts?: any };
    battery?: FeedbackBattery;
    scheduledTime?: string;
    status?: string;
}

export interface FeedbackItem {
    _id: string;
    user: FeedbackUser;
    booking: FeedbackBooking;
    rating: number;
    comment?: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface GetFeedbacksParams {
    stationId?: string;
    bookingId?: string;
    userId?: string;
    page?: number;
    limit?: number;
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
     * Get feedbacks with filters
     */
    static async getFeedbacks(params: GetFeedbacksParams = {}): Promise<FeedbackItem[]> {
        try {
            const response = await api.get<{ success: boolean; data: FeedbackItem[] }>(
                '/admin/feedbacks',
                { params }
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error('Failed to fetch feedbacks');
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
                            throw new Error('Forbidden: You do not have permission to access feedbacks');
                        case 404:
                            throw new Error('Not Found: Feedbacks not found');
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
     * Delete a feedback by id
     */
    static async deleteFeedback(id: string): Promise<void> {
        try {
            const res = await api.delete<{ success: boolean; message?: string }>(`/admin/feedbacks/${id}`);
            if (!res.data.success) {
                throw new Error(res.data.message || 'Failed to delete feedback');
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
                            throw new Error('Forbidden: You do not have permission to delete feedback');
                        case 404:
                            throw new Error('Not Found: Feedback not found');
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

