import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for subscription management
export interface SubscriptionSubscriberUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export interface SubscriptionSubscriber {
    id: string;
    user: SubscriptionSubscriberUser;
    start_date: string;
    end_date: string;
    remaining_swaps: number;
    status: string;
}

export interface SubscriptionPlan {
    _id: string;
    subscriptionName: string;
    price: number;
    durations: number;
    type?: 'change' | 'periodic';
    count_swap: number | null;
    quantity_slot: number | null;
    description: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    __v: number;
    // New fields from backend: list of subscribers and total count
    subscribers?: SubscriptionSubscriber[];
    subscriberCount?: number;
}

// DTO based on backend swagger (price, durations, count_swap, quantity_slot, description, status, type)
export interface CreateSubscriptionPlanRequest {
    subscriptionName: string;
    price: number;
    durations: number; // unit defined by backend (e.g., months)
    type: 'change' | 'periodic';
    count_swap?: number;
    quantity_slot?: number;
    description: string;
    status: 'active' | 'inactive';
}

export interface UpdateSubscriptionPlanRequest {
    subscriptionName?: string;
    price?: number;
    durations?: number;
    type?: 'change' | 'periodic';
    count_swap?: number;
    quantity_slot?: number;
    description?: string;
    status?: 'active' | 'inactive';
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
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
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Subscription Service
export class SubscriptionService {
    /**
     * Get all subscription plans
     */
    static async getAllPlans(status?: 'active' | 'inactive'): Promise<SubscriptionPlan[]> {
        try {
            const params = new URLSearchParams();
            if (status) {
                params.append('status', status);
            }

            const response = await api.get<ApiResponse<SubscriptionPlan[]>>(
                `/admin/subscriptions/plans?${params.toString()}`
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch subscription plans');
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
                            throw new Error('Forbidden: You do not have permission to access subscription plans');
                        case 404:
                            throw new Error('Not Found: Subscription plans not found');
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
     * Get subscription plan by ID
     */
    static async getPlanById(id: string): Promise<SubscriptionPlan> {
        try {
            const response = await api.get<ApiResponse<SubscriptionPlan>>(`/admin/subscriptions/plans/${id}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch subscription plan');
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
                            throw new Error('Forbidden: You do not have permission to access this subscription plan');
                        case 404:
                            throw new Error('Not Found: Subscription plan not found');
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
     * Create new subscription plan
     */
    static async createPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
        try {
            const response = await api.post<ApiResponse<SubscriptionPlan>>('/admin/subscriptions/plans', data);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create subscription plan');
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
                            throw new Error('Forbidden: You do not have permission to create subscription plans');
                        case 409:
                            throw new Error(`Conflict: ${message}`);
                        case 422:
                            throw new Error(`Validation Error: ${message}`);
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
     * Update subscription plan
     */
    static async updatePlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
        try {
            const response = await api.put<ApiResponse<SubscriptionPlan>>(`/admin/subscriptions/plans/${id}`, data);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update subscription plan');
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
                            throw new Error('Forbidden: You do not have permission to update this subscription plan');
                        case 404:
                            throw new Error('Not Found: Subscription plan not found');
                        case 409:
                            throw new Error(`Conflict: ${message}`);
                        case 422:
                            throw new Error(`Validation Error: ${message}`);
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
     * Delete subscription plan
     */
    static async deletePlan(id: string): Promise<void> {
        try {
            const response = await api.delete<ApiResponse<null>>(`/admin/subscriptions/plans/${id}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete subscription plan');
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
                            throw new Error('Forbidden: You do not have permission to delete this subscription plan');
                        case 404:
                            throw new Error('Not Found: Subscription plan not found');
                        case 409:
                            throw new Error(`Conflict: ${message}`);
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
     * Get subscription plan statistics
     * Note: This would need to be implemented in the backend
     */
    static async getPlanStats(): Promise<{
        totalPlans: number;
        activePlans: number;
        expiredPlans: number;
        totalRevenue: number;
        averagePrice: number;
    }> {
        try {
            const plans = await this.getAllPlans();

            const totalPlans = plans.length;
            const activePlans = plans.filter(plan => plan.status === 'active').length;
            const expiredPlans = plans.filter(plan => plan.status === 'inactive').length;
            const totalRevenue = plans.reduce((sum, plan) => sum + plan.price, 0);
            const averagePrice = totalPlans > 0 ? totalRevenue / totalPlans : 0;

            return {
                totalPlans,
                activePlans,
                expiredPlans,
                totalRevenue,
                averagePrice
            };
        } catch (error) {
            throw new Error('Failed to calculate subscription plan statistics');
        }
    }

    /**
     * Toggle plan status (active/expired)
     */
    static async togglePlanStatus(id: string): Promise<SubscriptionPlan> {
        try {
            const plan = await this.getPlanById(id);
            const newStatus = plan.status === 'active' ? 'expired' : 'active';

            return await this.updatePlan(id, { status: newStatus });
        } catch (error) {
            throw new Error('Failed to toggle plan status');
        }
    }
}

export default SubscriptionService;
