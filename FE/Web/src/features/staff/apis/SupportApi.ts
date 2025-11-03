import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

export interface SupportRequestBattery {
  _id: string;
  serial: string;
  model: string;
  soh: number;
  status: string;
  manufacturer?: string;
  capacity_kWh?: number;
  voltage?: number;
}

export interface SupportRequestBooking {
  _id: string;
  battery: SupportRequestBattery;
  scheduledTime: string;
  status: string;
  bookingId: string;
}

export interface SupportUserInfo {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export type SupportStatus = 'in-progress' | 'resolved' | 'completed' | 'closed';

export interface SupportRequest {
  _id: string;
  user: SupportUserInfo;
  booking: SupportRequestBooking;
  title: string;
  description: string;
  images: string[];
  status: SupportStatus;
  resolvedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  resolveNote?: string | null;
  closeNote?: string | null;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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

export const SupportApi = {
  async getRequestsByStation(stationId: string): Promise<SupportRequest[]> {
    try {
      const res = await apiClient.get<ApiListResponse<SupportRequest>>(`/support/station/${stationId}/requests`);
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch support requests');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || 'Failed to fetch support requests');
      }
      throw new Error('Failed to fetch support requests');
    }
  },

  async closeRequest(requestId: string, closeNote: string): Promise<SupportRequest> {
    try {
      const res = await apiClient.patch<ApiItemResponse<SupportRequest>>(`/support/requests/${requestId}/close`, { closeNote });
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || 'Failed to close support request');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || 'Failed to close support request');
      }
      throw new Error('Failed to close support request');
    }
  }
};
