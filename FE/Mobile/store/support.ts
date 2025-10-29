import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

/** ---------- Interfaces ---------- */
export interface User {
  _id: string;
  email: string;
  fullName: string;
}

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
  status: "in-progress" | "resolved" | "completed" | "closed";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  __v: number;

  // Resolved info
  resolveNote?: string | null;
  resolvedAt?: string | null; // ISO string
  resolvedBy?: User | null;

  // Closed info
  closeNote?: string | null;
  closedAt?: string | null; // ISO string
  closedBy?: User | null;

  // Completed
  completedAt?: string | null; // ISO string
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

/** ---------- Store ---------- */
export const sSupportRequests = signify<SupportRequest[]>([]);
export const sSupportRequestDetails = signify<SupportRequest | null>(null);

export const useSupportRequests = () => sSupportRequests.use();
export const useSupportRequestDetails = () => sSupportRequestDetails.use();

/** ---------- API Functions ---------- */
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

export const updateSupportRequestStatus = async (
  id: string,
  status: "in-progress" | "resolved" | "closed"
): Promise<{ success: boolean; data?: SupportRequest; message: string }> => {
  try {
    // PATCH expects backend to accept partial update
    const response: any = await httpClient.patch(`/support/requests/${id}`, { status });

    if (response && response.success && response.data) {
      const data = toCamelCase(response.data);
      // refresh list
      try {
        await getAllSupportRequests();
      } catch {
        // ignore
      }
      return { success: true, data, message: response.message || "Support request updated" };
    }

    return { success: false, message: response?.message || "Failed to update support request" };
  } catch (error: any) {
    console.error("API Error updating support request:", error);
    return { success: false, message: error?.message || "Request failed" };
  }
};

export interface CompleteSupportRequestResponse {
  success: boolean;
  data: SupportRequest;
  message: string;
}

export const completeSupportRequest = async (
  id: string
): Promise<{ success: boolean; data?: SupportRequest; message: string }> => {
  if (!id) {
    console.error("completeSupportRequest called with empty id");
    return { success: false, message: "Missing support request id" };
  }

  try {
    const response = await httpClient.patch<CompleteSupportRequestResponse>(
      `/support/requests/${id}/complete`
    );

    if (response && response.success && response.data) {
      const data = toCamelCase(response.data);
      try {
        await getAllSupportRequests();
      } catch {
      }
      return { success: true, data, message: response.message || "Support request completed" };
    }

    return { success: false, message: response?.message || "Failed to complete support request" };
  } catch (error: any) {
    console.error("API Error completing support request:", error);
    return { success: false, message: error?.message || "Request failed" };
  }
};
