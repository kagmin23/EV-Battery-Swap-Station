import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for battery management
export interface Battery {
    _id: string;
    batteryId: string;
    stationId: string;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    soh: number;
    voltage: number;
    current: number;
    temperature: number;
    cycleCount: number;
    lastMaintenance: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface BatteryFilters {
    status?: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    stationId?: string;
    sohMin?: number;
    sohMax?: number;
    page?: number;
    limit?: number;
    sort?: 'createdAt' | 'updatedAt' | 'soh';
    order?: 'asc' | 'desc';
}

export interface BatteryResponse {
    success: boolean;
    data: Battery[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
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
export class BatteryService {
    // Get batteries by station with filters
    static async getBatteriesByStation(stationId: string, filters: Omit<BatteryFilters, 'stationId'> = {}): Promise<BatteryResponse> {
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.sohMin !== undefined) params.append('sohMin', filters.sohMin.toString());
            if (filters.sohMax !== undefined) params.append('sohMax', filters.sohMax.toString());
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.order) params.append('order', filters.order);

            const response = await api.get(`/admin/batteries?stationId=${stationId}&${params.toString()}`);
            if (response.data.success) {
                return {
                    success: response.data.success,
                    data: response.data.data || response.data.batteries || [],
                    pagination: response.data.pagination || {
                        page: 1,
                        limit: 20,
                        total: response.data.data?.length || 0,
                        pages: 1
                    }
                };
            }
            throw new Error(response.data.message || 'Failed to fetch batteries');
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
                            throw new Error('Forbidden: You do not have permission to access batteries');
                        case 404:
                            throw new Error('Not Found: Batteries endpoint not found');
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

    // Get all batteries by fetching from all stations
    static async getAllBatteriesFromAllStations(stations: Array<{ id: string; name: string }>, filters: Omit<BatteryFilters, 'stationId'> = {}): Promise<BatteryResponse> {
        try {
            const allBatteries: Battery[] = [];
            let totalCount = 0;

            // Fetch batteries from each station
            for (const station of stations) {
                try {
                    const stationResponse = await this.getBatteriesByStation(station.id, filters);
                    const stationBatteries = stationResponse.data.map(battery => ({
                        ...battery,
                        stationName: station.name
                    }));
                    allBatteries.push(...stationBatteries);
                    totalCount += stationResponse.pagination.total;
                } catch (error) {
                    console.warn(`Failed to fetch batteries from station ${station.name}:`, error);
                    // Continue with other stations even if one fails
                }
            }

            return {
                success: true,
                data: allBatteries,
                pagination: {
                    page: 1,
                    limit: allBatteries.length,
                    total: totalCount,
                    pages: 1
                }
            };
        } catch (error) {
            throw new Error('Failed to fetch batteries from all stations');
        }
    }

    // Get battery by ID
    static async getBatteryById(id: string): Promise<Battery> {
        try {
            const response = await api.get(`/admin/batteries/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch battery');
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
                            throw new Error('Forbidden: You do not have permission to access this battery');
                        case 404:
                            throw new Error('Not Found: Battery not found');
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


    // Update battery status
    static async updateBatteryStatus(id: string, status: Battery['status']): Promise<Battery> {
        try {
            const response = await api.patch(`/admin/batteries/${id}/status`, { status });
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update battery status');
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
                            throw new Error('Forbidden: You do not have permission to update this battery');
                        case 404:
                            throw new Error('Not Found: Battery not found');
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

    // Get battery statistics
    static async getBatteryStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byStation: Array<{ stationId: string; count: number }>;
        averageSoh: number;
    }> {
        try {
            const response = await api.get('/admin/batteries/stats');
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch battery statistics');
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
                            throw new Error('Forbidden: You do not have permission to access battery statistics');
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

export default BatteryService;
