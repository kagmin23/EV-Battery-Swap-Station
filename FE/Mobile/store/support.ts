import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

export interface Battery {
  _id: string;
  serial: string;
  model: string;
  soh: number;
  status: string;
  manufacturer: string;
  capacity_kWh: number;
  voltage: number;
}

export interface Booking {
  _id: string;
  bookingId: string;
  battery: Battery;
  scheduledTime: string; // ISO string
  status: string;
}

export interface SupportRequest {
  _id: string;
  user: string;
  booking: Booking;
  title: string;
  description: string;
  images: string[];
  status: "in-progress" | "resolved" | "closed";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  __v: number;
}

export interface GetSupportRequestsResponse {
  success: boolean;
  data: SupportRequest[];
}

export interface CreateSupportRequestResponse {
  success: boolean;
  data: SupportRequest;
  message: string;
}

export const sSupportRequests = signify<SupportRequest[]>([]);
export const sSupportRequestDetails = signify<SupportRequest | null>(null);

export const useSupportRequests = () => sSupportRequests.use();
export const useSupportRequestDetails = () => sSupportRequestDetails.use();

export const getAllSupportRequests = async (): Promise<SupportRequest[]> => {
  try {
    const response = await httpClient.get<GetSupportRequestsResponse>("/support/requests");

    if (response && Array.isArray(response.data)) {
      const data = toCamelCase(response.data);
      sSupportRequests.set(data);
      return data;
    } else {
      console.warn("Invalid API response format:", response);
      sSupportRequests.set([]);
      return [];
    }
  } catch (error: any) {
    console.error("API Error getting support requests:", error);
    sSupportRequests.set([]);
    return [];
  }
};

export const createSupportRequest = async (payload: {
  bookingId: string;
  title: string;
  description?: string;
  images?: string[];
}): Promise<{ success: boolean; data?: SupportRequest; message: string }> => {
  try {
    const response = await httpClient.post<CreateSupportRequestResponse>("/support/requests", payload);

    if (response && response.success && response.data) {
      const data = toCamelCase(response.data);
      // Refresh the list so store is consistent
      try {
        await getAllSupportRequests();
      } catch {
        // ignore
      }
      return { success: true, data, message: response.message || "Support request created" };
    }

    return { success: false, message: response?.message || "Failed to create support request" };
  } catch (error: any) {
    console.error("API Error creating support request:", error);
    return { success: false, message: error?.message || "Request failed" };
  }
};
