import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for battery management
export interface Battery {
    _id: string;
    serial: string;
    model?: string;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    soh: number;
    station?: {
        _id: string;
        stationName: string;
        address: string;
    };
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    price?: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    currentSlot?: string | null;
    currentPillar?: string | null;
}

export interface CreateBatteryRequest {
    serial: string;
    model?: string;
    soh?: number;
    status?: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    stationId?: string;
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    price?: number;
}

export interface UpdateBatteryRequest {
    model?: string;
    soh?: number;
    status?: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    stationId?: string;
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    price?: number;
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
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface BatteryLogsResponse {
    success: boolean;
    data: {
        battery: {
            id: string;
            serial: string;
            model?: string;
            status: string;
            soh: number;
            station?: { _id: string; stationName: string; address?: string };
            lastUpdated?: string;
        };
        history: Array<any>;
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

            // Add stationId as a query parameter
            params.append('stationId', stationId);
            if (filters.status) params.append('status', filters.status);
            if (filters.sohMin !== undefined && filters.sohMin !== null) params.append('sohMin', filters.sohMin.toString());
            if (filters.sohMax !== undefined && filters.sohMax !== null) params.append('sohMax', filters.sohMax.toString());
            if (filters.page && filters.page > 0) params.append('page', filters.page.toString());
            if (filters.limit && filters.limit > 0) params.append('limit', filters.limit.toString());
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.order) params.append('order', filters.order);

            const response = await api.get(`/batteries?${params.toString()}`);
            if (response.data.success) {
                return {
                    success: response.data.success,
                    data: response.data.data || [],
                    meta: response.data.meta || {
                        page: 1,
                        limit: 20,
                        total: response.data.data?.length || 0
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

    // Get all batteries with filters (using main /batteries endpoint)
    static async getAllBatteries(filters: BatteryFilters = {}): Promise<BatteryResponse> {
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.stationId) params.append('stationId', filters.stationId);
            if (filters.sohMin !== undefined && filters.sohMin !== null) params.append('sohMin', filters.sohMin.toString());
            if (filters.sohMax !== undefined && filters.sohMax !== null) params.append('sohMax', filters.sohMax.toString());
            if (filters.page && filters.page > 0) params.append('page', filters.page.toString());
            if (filters.limit && filters.limit > 0) params.append('limit', filters.limit.toString());
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.order) params.append('order', filters.order);

            const response = await api.get(`/batteries?${params.toString()}`);
            if (response.data.success) {
                // Handle both 'meta' and 'pagination' response formats from different endpoints
                const paginationData = response.data.meta || response.data.pagination;
                return {
                    success: response.data.success,
                    data: response.data.data || [],
                    meta: paginationData ? {
                        page: paginationData.page || 1,
                        limit: paginationData.limit || 20,
                        total: paginationData.total || 0
                    } : {
                        page: 1,
                        limit: 20,
                        total: response.data.data?.length || 0
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

    // Get battery logs/history (admin)
    static async getBatteryLogs(id: string): Promise<BatteryLogsResponse['data']> {
        try {
            const response = await api.get(`/batteries/${id}/logs`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch battery logs');
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
                            throw new Error('Forbidden: You do not have permission to access this resource');
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
                    totalCount += stationResponse.meta.total;
                } catch (error) {
                    console.warn(`Failed to fetch batteries from station ${station.name}:`, error);
                    // Continue with other stations even if one fails
                }
            }

            return {
                success: true,
                data: allBatteries,
                meta: {
                    page: 1,
                    limit: allBatteries.length,
                    total: totalCount
                }
            };
        } catch (error) {
            throw new Error('Failed to fetch batteries from all stations');
        }
    }

    // Get faulty batteries
    static async getFaultyBatteries(): Promise<BatteryResponse> {
        try {
            const response = await api.get('/admin/batteries/faulty');
            if (response.data.success) {
                return {
                    success: response.data.success,
                    data: response.data.data || [],
                    meta: {
                        page: 1,
                        limit: response.data.data?.length || 0,
                        total: response.data.data?.length || 0
                    }
                };
            }
            throw new Error(response.data.message || 'Failed to fetch faulty batteries');
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
                            throw new Error('Forbidden: You do not have permission to access this resource');
                        case 404:
                            throw new Error('Not Found: Faulty batteries not found');
                        case 500:
                            throw new Error('Internal Server Error: Please try again later');
                        default:
                            throw new Error(`Error ${status}: ${message}`);
                    }
                } else if (error.request) {
                    throw new Error('Network Error: Please check your connection');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Get battery by ID
    static async getBatteryById(id: string): Promise<Battery> {
        try {
            const response = await api.get(`/batteries/${id}`);
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
            const response = await api.put(`/batteries/${id}`, { status });
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

    // Create new battery
    static async createBattery(batteryData: CreateBatteryRequest): Promise<Battery> {
        try {
            const response = await api.post('/batteries', batteryData);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create battery');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    let message = error.response.data?.message || 'Server error';

                    // Handle ZodError array response from backend
                    if (Array.isArray(message)) {
                        message = message.map((err: any) =>
                            `${err.path?.join('.') || 'field'}: ${err.message || 'Invalid value'}`
                        ).join(', ');
                    } else if (typeof message === 'object' && message !== null) {
                        // If message is an object, try to stringify it
                        message = JSON.stringify(message);
                    }

                    switch (status) {
                        case 400:
                            throw new Error(`Bad Request: ${message}`);
                        case 401:
                            throw new Error('Unauthorized: Please login again');
                        case 403:
                            throw new Error('Forbidden: You do not have permission to create batteries');
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

    // Update battery
    static async updateBattery(id: string, updateData: UpdateBatteryRequest): Promise<Battery> {
        try {
            const response = await api.put(`/batteries/${id}`, updateData);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update battery');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    let message = error.response.data?.message || 'Server error';

                    // Handle ZodError array response from backend
                    if (Array.isArray(message)) {
                        message = message.map((err: any) =>
                            `${err.path?.join('.') || 'field'}: ${err.message || 'Invalid value'}`
                        ).join(', ');
                    } else if (typeof message === 'object' && message !== null) {
                        // If message is an object, try to stringify it
                        message = JSON.stringify(message);
                    }

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

    // Delete battery
    static async deleteBattery(id: string): Promise<void> {
        try {
            const response = await api.delete(`/batteries/${id}`);
            if (response.data.success) {
                return;
            }
            throw new Error(response.data.message || 'Failed to delete battery');
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
                            throw new Error('Forbidden: You do not have permission to delete this battery');
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
    // Note: This endpoint doesn't exist in the backend yet
    static async getBatteryStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byStation: Array<{ stationId: string; count: number }>;
        averageSoh: number;
    }> {
        // TODO: Implement this endpoint in backend or calculate stats from battery list
        throw new Error('Battery statistics endpoint not implemented yet');
    }
}

export default BatteryService;
