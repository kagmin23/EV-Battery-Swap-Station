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

// Types
export interface Position {
    row: number;
    column: number;
}

export interface Battery {
    _id: string;
    serial: string;
    model: string;
    soh: number;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle' | 'is-booking';
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    price?: number;
    currentSlot?: string | null;
    currentPillar?: string | null;
}

export interface User {
    _id: string;
    email: string;
    fullName: string;
}

export interface LastActivity {
    action: 'insert' | 'remove';
    user: User;
    battery: Battery;
    timestamp: string;
}

export interface Slot {
    _id: string;
    slotCode: string;
    pillar: string;
    station: string;
    slotNumber: number;
    battery: Battery | null;
    status: 'empty' | 'occupied' | 'reserved';
    position: Position;
    reservation: any;
    isAlwaysEmpty: boolean;
    lastActivity?: LastActivity;
    createdAt: string;
    updatedAt: string;
}

export interface SlotStats {
    total: number;
    occupied: number;
    empty: number;
    reserved: number;
}

export interface Station {
    _id: string;
    stationName: string;
    address: string;
    city?: string;
    district?: string;
}

export interface Pillar {
    _id: string;
    pillarCode: string;
    pillarName: string;
    pillarNumber: number;
    status: 'active' | 'inactive' | 'maintenance' | 'error';
    station: Station;
    slotStats: SlotStats;
    totalSlots: number;
    createdAt: string;
    updatedAt: string;
}

export interface PillarDetail extends Pillar {
    slots: Slot[];
}

export interface GridLayout {
    rows: number;
    columns: number;
    totalSlots: number;
}

export interface GridSlot extends Slot {
    position: Position;
}

export interface PillarGridResponse {
    success?: boolean;
    message: string;
    data: {
        pillar: Pillar;
        slotStats: SlotStats;
        gridLayout: GridLayout;
        grid: GridSlot[][];
    };
}

export interface PillarListResponse {
    success?: boolean;
    message: string;
    pillars: Pillar[];
}

export interface PillarDetailResponse {
    success: boolean;
    message: string;
    data: {
        pillar: Pillar;
        slotStats: SlotStats;
        statistics: any;
        slots: Slot[];
    };
}

export interface AvailableSlotsResponse {
    success: boolean;
    message: string;
    count: number;
    data: Slot[];
}

export interface AssignBatteryRequest {
    batteryId: string;
    slotId: string;
}

export interface RemoveBatteryRequest {
    slotId: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

// Swap History Types
export interface SwapBatteryInfo {
    battery: {
        _id: string;
        serial: string;
        model: string;
    };
    soh: number;
    chargeLevel: number;
    status: string;
}

export interface SwapHistoryRecord {
    _id: string;
    oldBattery?: SwapBatteryInfo;
    newBattery?: SwapBatteryInfo;
    user: {
        _id: string;
        email: string;
    };
    vehicle?: string;
    station: {
        _id: string;
        stationName: string;
        address: string;
    };
    pillar: {
        _id: string;
        pillarName: string;
        pillarCode: string;
    };
    slot: string;
    booking?: string;
    status: 'initiated' | 'in-progress' | 'completed' | 'cancelled';
    cost: {
        amount: number;
        currency: string;
        paymentMethod: string;
    };
    swapId: string;
    swapTime: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface SwapHistoryFilters {
    userId?: string;
    stationId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface SwapHistoryResponse {
    message: string;
    history: SwapHistoryRecord[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class BatterySwapService {
    // Get all pillars by station
    static async getPillarsByStation(stationId: string, status?: string): Promise<Pillar[]> {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);

            const url = status 
                ? `/battery-swap/pillars/station/${stationId}?${params.toString()}`
                : `/battery-swap/pillars/station/${stationId}`;

            console.log('Fetching pillars from URL:', url);
            const response = await api.get<PillarListResponse>(url);
            console.log('Pillars API response:', response.data);
            
            // Handle both response formats: with or without success field
            if (response.data.success === false) {
                throw new Error(response.data.message || 'Failed to fetch pillars');
            }
            
            if (response.data.pillars && Array.isArray(response.data.pillars)) {
                console.log('Returning pillars array:', response.data.pillars);
                return response.data.pillars;
            }
            
            throw new Error('Invalid pillars data received');
        } catch (error) {
            console.error('Error in getPillarsByStation:', error);
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message || 'Failed to fetch pillars';
                throw new Error(message);
            }
            throw error;
        }
    }

    // Get pillar details by ID
    static async getPillarById(pillarId: string): Promise<PillarDetailResponse['data']> {
        try {
            const response = await api.get<PillarDetailResponse>(`/battery-swap/pillars/${pillarId}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch pillar details');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch pillar details');
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Get pillar grid layout
    static async getPillarGrid(pillarId: string, rows: number = 2, columns: number = 5): Promise<PillarGridResponse['data']> {
        try {
            const url = `/battery-swap/pillars/${pillarId}/grid?rows=${rows}&columns=${columns}`;
            console.log('Fetching pillar grid from URL:', url);
            const response = await api.get<PillarGridResponse>(url);
            console.log('Pillar grid API response:', response.data);
            
            // Handle both response formats: with or without success field
            if (response.data.success === false) {
                throw new Error(response.data.message || 'Failed to fetch pillar grid');
            }
            
            if (response.data.data) {
                console.log('Returning grid data:', response.data.data);
                return response.data.data;
            }
            
            throw new Error('Invalid grid data received');
        } catch (error) {
            console.error('Error in getPillarGrid:', error);
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message || 'Failed to fetch pillar grid';
                throw new Error(message);
            }
            throw error;
        }
    }

    // Get slots in a pillar
    static async getPillarSlots(pillarId: string): Promise<Slot[]> {
        try {
            const response = await api.get<ApiResponse>(`/battery-swap/pillars/${pillarId}/slots`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch slots');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch slots');
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Get available empty slots
    static async getAvailableSlots(stationId?: string, pillarId?: string, needEmpty: boolean = false): Promise<Slot[]> {
        try {
            const params = new URLSearchParams();
            if (stationId) params.append('stationId', stationId);
            if (pillarId) params.append('pillarId', pillarId);
            if (needEmpty) params.append('needEmpty', 'true');

            const response = await api.get<AvailableSlotsResponse>(`/battery-swap/slots/available?${params.toString()}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch available slots');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch available slots');
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Assign battery to slot
    static async assignBatteryToSlot(request: AssignBatteryRequest): Promise<ApiResponse> {
        try {
            console.log('Assign battery API call:', request);
            const response = await api.post<ApiResponse>('/battery-swap/slots/assign-battery', request);
            console.log('Assign battery API response:', response.data);
            
            // Handle both response formats
            if (response.data.success === false) {
                throw new Error(response.data.message || 'Failed to assign battery');
            }
            
            if (response.data.success || response.data.message) {
                return response.data;
            }
            
            throw new Error('Failed to assign battery');
        } catch (error) {
            console.error('Error in assignBatteryToSlot:', error);
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message || 'Failed to assign battery';
                throw new Error(message);
            }
            throw error;
        }
    }

    // Remove battery from slot
    static async removeBatteryFromSlot(request: RemoveBatteryRequest): Promise<ApiResponse> {
        try {
            console.log('Remove battery API call:', request);
            const response = await api.post<ApiResponse>('/battery-swap/slots/remove-battery', request);
            console.log('Remove battery API response:', response.data);
            
            // Handle both response formats
            if (response.data.success === false) {
                throw new Error(response.data.message || 'Failed to remove battery');
            }
            
            if (response.data.success || response.data.message) {
                return response.data;
            }
            
            throw new Error('Failed to remove battery');
        } catch (error) {
            console.error('Error in removeBatteryFromSlot:', error);
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message || 'Failed to remove battery';
                throw new Error(message);
            }
            throw error;
        }
    }

    // Get swap history with filters and pagination
    static async getSwapHistory(filters: SwapHistoryFilters = {}): Promise<SwapHistoryResponse> {
        try {
            const params = new URLSearchParams();
            
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.stationId) params.append('stationId', filters.stationId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            
            const url = `/battery-swap/swap/history${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await api.get<SwapHistoryResponse>(url);
            
            return response.data;
        } catch (error) {
            console.error('Error in getSwapHistory:', error);
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message || 'Failed to fetch swap history';
                throw new Error(message);
            }
            throw error;
        }
    }
}

