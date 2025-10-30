import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

export interface CreateFeedbackRequest {
  bookingId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface User {
  _id: string;
  email: string;
  fullName?: string;
}

export interface Station {
  _id: string;
  stationName: string;
  address: string;
  city: string;
  district: string;
  mapUrl: string;
  capacity: number;
  sohAvg: number;
  availableBatteries: number;
  batteryCounts: {
    total: number;
    available: number;
    charging: number;
    inUse: number;
    faulty: number;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Battery {
  _id: string;
  serial: string;
  model: string;
  soh: number;
  status: string;
  station: string;
  manufacturer: string;
  capacityKWh: number;
  price: number;
  voltage: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Booking {
  _id: string;
  bookingId: string;
  user: string;
  vehicle: string;
  station: Station;
  battery: Battery;
  scheduledTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Feedback {
  _id: string;
  user: User;
  booking: Booking;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export const sFeedbacks = signify<Feedback[]>([]);
export const useFeedbacks = () => sFeedbacks.use();

const normalizeFeedback = (data: any): Feedback => toCamelCase(data) as Feedback;

export const createFeedbackApi = async (
  body: CreateFeedbackRequest
): Promise<ApiResponse<Feedback>> => {
  const apiBody = await httpClient.post<ApiResponse<any>>("/feedback/requests", body);
  const camelData = normalizeFeedback(apiBody.data);
  try {
    await getAllFeedbacks();
  } catch {
    sFeedbacks.set([camelData]);
  }
  return { ...apiBody, data: camelData };
};

export const getFeedbacksByStationApi = async (
  stationId: string
): Promise<ApiResponse<Feedback[]>> => {
  const apiBody = await httpClient.get<ApiResponse<any[]>>(`/feedback/requests/station/${stationId}`);
  const camelData = Array.isArray(apiBody.data) ? apiBody.data.map(normalizeFeedback) : [];
  sFeedbacks.set(camelData);
  return { ...apiBody, data: camelData };
};

export const getAllFeedbacks = async (): Promise<Feedback[]> => {
  try {
    const apiBody = await httpClient.get<ApiResponse<any[]>>('/feedback/requests');
    if (apiBody && Array.isArray(apiBody.data)) {
      const data = apiBody.data.map(normalizeFeedback);
      sFeedbacks.set(data);
      return data;
    }
    sFeedbacks.set([]);
    return [];
  } catch {
    sFeedbacks.set([]);
    return [];
  }
};

export const getFeedbackByBookingApi = async (
  bookingId: string
): Promise<ApiResponse<Feedback>> => {
  const apiBody = await httpClient.get<ApiResponse<any>>(`/feedback/requests/booking/${bookingId}`);
  const camelData = normalizeFeedback(apiBody.data);

  try {
    await getAllFeedbacks();
  } catch {
    sFeedbacks.set([camelData]);
  }
  return { ...apiBody, data: camelData };
};
