import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

export interface Station {
    _id: string;
    stationName: string;
    address: string;
    city: string;
    district: string;
    capacity: number;
    sohAvg: number;
    availableBatteries: number;
    map_url?: string;
    location?: {
        type: string;
        coordinates: number[];
    };
}

export interface BatteryDetail {
    id: string;
    serial: string;
    model?: string;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle' | 'is-booking';
    soh: number;
    station?: string | Station; // Can be either a string ID or populated Station object
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    __v: number;
}

export interface ApiResponse<T = BatteryDetail> {
    success: boolean;
    data: T;
    message?: string;
}

export interface StationDetailResponse {
    success: boolean;
    data: {
        station: Station;
        sohAvg: number;
        available: number;
        batteries: unknown[];
        rating: unknown;
    };
    message?: string;
}

export interface BatteryLogEntry {
    _id: string;
    action: string;
    actor?: {
        _id: string;
        email?: string;
        fullName?: string;
    } | string | null;
    note?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BatteryLogsResponseData {
    battery: BatteryDetail;
    logs: BatteryLogEntry[];
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

export const getBatteryDetail = async (batteryId: string): Promise<BatteryDetail> => {
    try {
        const response = await apiClient.get<ApiResponse>(`/staff/batteries/${batteryId}`);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch battery detail');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch battery detail');
        }
        throw new Error('Failed to fetch battery detail');
    }
}

export const getBatteryLogs = async (batteryId: string): Promise<BatteryLogsResponseData> => {
    try {
        const response = await apiClient.get<ApiResponse<BatteryLogsResponseData>>(`/staff/batteries/${batteryId}/logs`);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch battery logs');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch battery logs');
        }
        throw new Error('Failed to fetch battery logs');
    }
}

export const getStationById = async (stationId: string): Promise<Station> => {
    try {
        const response = await apiClient.get<StationDetailResponse>(`/stations/${stationId}`);
        if (response.data.success) {
            // The API returns station data nested in data.station
            return response.data.data.station;
        }
        throw new Error(response.data.message || 'Failed to fetch station detail');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch station detail');
        }
        throw new Error('Failed to fetch station detail');
    }
}
