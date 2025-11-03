import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

export interface Battery {
    _id: string;
    serial: string;
    model?: string;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle' | 'is-booking';
    soh: number;
    station?: string;
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface ApiResponse {
    success: boolean;
    data: Battery[];
    message?: string;
}

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getStationBatteries = async (stationId: string): Promise<Battery[]> => {
    try {
        const response = await apiClient.get<ApiResponse>(`/staff/stations/${stationId}/batteries`);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch batteries');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch batteries');
        }
        throw new Error('Failed to fetch batteries');
    }
}

export interface UpdateBatteryRequest {
    status?: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    soh?: number;
}

export const updateBattery = async (batteryId: string, data: UpdateBatteryRequest): Promise<Battery> => {
    try {
        const response = await apiClient.put<ApiResponse>(`/staff/batteries/${batteryId}`, data);
        if (response.data.success) {
            return response.data.data[0];
        }
        throw new Error(response.data.message || 'Failed to update battery');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update battery');
        }
        throw new Error('Failed to update battery');
    }
}