import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

export interface ApiPillarSlot {
    _id: string;
    slotNumber: number;
    slotCode: string;
    status: string;
    battery?: {
        _id: string;
        serial: string;
        model?: string;
        soh?: number;
        status?: string;
        price?: number;
    } | null;
}

export interface ApiPillar {
    _id: string;
    pillarName: string;
    pillarCode: string;
    pillarNumber: number;
    totalSlots: number;
    status: string;
    slotStats?: {
        total: number;
        occupied: number;
        empty: number;
        reserved: number;
    };
    station?: {
        _id: string;
        stationName: string;
        address?: string;
    } | string;
    slots?: ApiPillarSlot[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePillarRequest {
    stationId: string;
    pillarName: string;
    pillarNumber: number;
    totalSlots?: number;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export class PillarService {
    static async createPillar(data: CreatePillarRequest): Promise<ApiPillar> {
        try {
            const response = await api.post('/battery-swap/pillars', data);
            if (response.status === 201 || response.data?.pillar) {
                return response.data.pillar;
            }
            throw new Error(response.data?.message || 'Failed to create pillar');
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
                            throw new Error('Forbidden: You do not have permission to create pillars');
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

    static async getPillarsByStation(stationId: string, status?: string): Promise<ApiPillar[]> {
        try {
            const params = new URLSearchParams();
            if (status) {
                params.append('status', status);
            }

            const query = params.toString();
            const response = await api.get(`/battery-swap/pillars/station/${stationId}${query ? `?${query}` : ''}`);

            if (response.data?.pillars) {
                return response.data.pillars;
            }
            throw new Error(response.data?.message || 'Failed to retrieve pillars');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const statusCode = error.response.status;
                    const message = error.response.data?.message || 'Server error';

                    switch (statusCode) {
                        case 400:
                            throw new Error(`Bad Request: ${message}`);
                        case 401:
                            throw new Error('Unauthorized: Please login again');
                        case 403:
                            throw new Error('Forbidden: You do not have permission to view pillars');
                        case 404:
                            throw new Error('Not Found: Station or pillars not found');
                        case 500:
                            throw new Error('Internal Server Error: Please try again later');
                        default:
                            throw new Error(`Error ${statusCode}: ${message}`);
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

export default PillarService;
