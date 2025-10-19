import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8001/api';

// Types for station management
export interface Station {
    _id: string;
    stationName: string;
    address: string;
    city: string;
    district: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    map_url: string;
    capacity: number;
    sohAvg: number;
    availableBatteries: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CreateStationRequest {
    stationName: string;
    address: string;
    city: string;
    district: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    map_url: string;
    capacity: number;
    sohAvg?: number;
    availableBatteries?: number;
}

export interface UpdateStationRequest {
    stationName?: string;
    address?: string;
    city?: string;
    district?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    map_url?: string;
    capacity?: number;
    sohAvg?: number;
    availableBatteries?: number;
}

export interface ChangeStationStatusRequest {
    status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
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

// Station Service
export class StationService {
    // Get all stations
    static async getAllStations(): Promise<Station[]> {
        try {
            const response = await api.get('/admin/stations');
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch stations');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with error status
                    const status = error.response.status;
                    const message = error.response.data?.message || 'Server error';

                    switch (status) {
                        case 400:
                            throw new Error(`Bad Request: ${message}`);
                        case 401:
                            throw new Error('Unauthorized: Please login again');
                        case 403:
                            throw new Error('Forbidden: You do not have permission to access stations');
                        case 404:
                            throw new Error('Not Found: Stations endpoint not found');
                        case 409:
                            throw new Error(`Conflict: ${message}`);
                        case 500:
                            throw new Error('Internal Server Error: Please try again later');
                        default:
                            throw new Error(`Error ${status}: ${message}`);
                    }
                } else if (error.request) {
                    // Network error
                    throw new Error('Network Error: Please check your internet connection');
                } else {
                    // Other error
                    throw new Error(`Request Error: ${error.message}`);
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Get station by ID
    static async getStationById(id: string): Promise<Station> {
        try {
            const response = await api.get(`/admin/stations/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch station');
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
                            throw new Error('Forbidden: You do not have permission to access this station');
                        case 404:
                            throw new Error('Not Found: Station not found');
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

    // Create new station
    static async createStation(data: CreateStationRequest): Promise<Station> {
        try {
            const response = await api.post('/admin/stations', data);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create station');
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
                            throw new Error('Forbidden: You do not have permission to create stations');
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

    // Update station
    static async updateStation(id: string, data: UpdateStationRequest): Promise<Station> {
        try {
            const response = await api.put(`/admin/stations/${id}`, data);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update station');
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
                            throw new Error('Forbidden: You do not have permission to update this station');
                        case 404:
                            throw new Error('Not Found: Station not found');
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

    // Delete station
    static async deleteStation(id: string): Promise<void> {
        try {
            const response = await api.delete(`/admin/stations/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete station');
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
                            throw new Error('Forbidden: You do not have permission to delete this station');
                        case 404:
                            throw new Error('Not Found: Station not found');
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

    // Get staff by station
    static async getStaffByStation(stationId: string): Promise<any[]> {
        try {
            const response = await api.get(`/admin/stations/${stationId}/staff`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch station staff');
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
                            throw new Error('Forbidden: You do not have permission to access station staff');
                        case 404:
                            throw new Error('Not Found: Station or staff not found');
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

    // Add staff to station
    static async addStaffToStation(stationId: string, staffId: string): Promise<void> {
        try {
            const response = await api.post(`/admin/stations/${stationId}/staff`, { staffId });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to add staff to station');
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
                            throw new Error('Forbidden: You do not have permission to add staff to station');
                        case 404:
                            throw new Error('Not Found: Station or staff not found');
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

    // Assign staff to station (new API endpoint)
    static async assignStaffToStation(stationId: string, staffIds: string[]): Promise<any[]> {
        try {
            const response = await api.post(`/admin/stations/${stationId}/assign-staff`, { staffIds });
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to assign staff to station');
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
                            throw new Error('Forbidden: You do not have permission to assign staff to station');
                        case 404:
                            throw new Error('Not Found: Station or staff not found');
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

    // Remove staff from station
    static async removeStaffFromStation(stationId: string, staffId: string): Promise<void> {
        try {
            const response = await api.delete(`/admin/stations/${stationId}/staff/${staffId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to remove staff from station');
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
                            throw new Error('Forbidden: You do not have permission to remove staff from station');
                        case 404:
                            throw new Error('Not Found: Station or staff not found');
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

    // Change station status
    static async changeStationStatus(id: string, status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'): Promise<Station> {
        try {
            const response = await api.patch(`/admin/stations/${id}/status`, { status });
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to change station status');
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
                            throw new Error('Forbidden: You do not have permission to change station status');
                        case 404:
                            throw new Error('Not Found: Station not found');
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
}

export default StationService;
