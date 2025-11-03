import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export type SupportRequestStatus = 'in-progress' | 'resolved' | 'completed' | 'closed';

export interface SupportRequestUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface SupportRequestBookingBattery {
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
  bookingId: string;
  scheduledTime: string;
  status: string;
  battery?: SupportRequestBookingBattery;
}

export interface SupportRequestItem {
  _id: string;
  user?: SupportRequestUser;
  booking: SupportRequestBooking;
  title: string;
  description?: string;
  images?: string[];
  status: SupportRequestStatus | string;
  resolvedBy?: SupportRequestUser;
  resolveNote?: string;
  closedBy?: SupportRequestUser;
  closeNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SupportService = {
  async getAdminSupportRequests(status?: SupportRequestStatus): Promise<SupportRequestItem[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await api.get('/support/admin/requests', { params });
    // API wraps in { success, data }
    return res.data?.data ?? [];
  },
  async resolveRequest(id: string, resolveNote?: string): Promise<SupportRequestItem> {
    const res = await api.patch(`/support/requests/${id}/resolve`, { resolveNote });
    return res.data?.data;
  },
  async closeRequest(id: string, closeNote: string): Promise<SupportRequestItem> {
    const res = await api.patch(`/support/requests/${id}/close`, { closeNote });
    return res.data?.data;
  },
};

export default SupportService;


