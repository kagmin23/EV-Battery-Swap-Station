import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

export interface Booking {
  bookingId: string;
  userId: string;
  stationId: string;
  vehicleId: string;
  batteryId?: string;
  scheduledTime: string;
  status: string;
  createdAt: string;
}

export const sBookings = signify<Booking[]>([]);
export const sBookingDetails = signify<Booking | null>(null);

export const useBookings = () => sBookings.use();
export const useBookingDetails = () => sBookingDetails.use();

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const res = await httpClient.get<{ data: Booking[] }>("/booking");
    if (res.data && Array.isArray(res.data)) {
      const data = toCamelCase(res.data);
      sBookings.set(data);
      return data;
    } else {
      console.warn("Invalid API response format:", res.data);
      sBookings.set([]);
      return [];
    }
  } catch (error: any) {
    console.error("API Error details:", {
      message: error.message,
      success: error.success,
      errors: error.errors,
      isApiError: error.success !== undefined,
    });

    console.error("Full error object:", error);
    return [];
  }
};

export const cancelBooking = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await httpClient.put<{
      success: boolean;
      message: string;
      data: null;
    }>(`/booking/${id}/cancel`);

    if (response?.success) {
      // Refresh bookings from server to ensure consistent state
      try {
        await getAllBookings();
      } catch {
        // If refresh fails, still return success for the cancel operation
      }

      return {
        success: true,
        message: response.message || "Booking cancelled",
      };
    }

    return {
      success: false,
      message: response?.message || "Failed to cancel booking",
    };
  } catch (error: any) {
    return {
      success: false,
      message: (error as any)?.message || "Request failed",
    };
  }
};

export const completeBooking = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await httpClient.put<{
      success: boolean;
      message: string;
      data: null;
    }>(`/booking/${id}/complete`);

    if (response?.success) {
      // Refresh the booking list to keep the UI updated
      try {
        await getAllBookings();
      } catch {
        // Ignore refresh failure, operation itself succeeded
      }

      return {
        success: true,
        message: response.message || "Booking completed successfully",
      };
    }

    return {
      success: false,
      message: response?.message || "Failed to complete booking",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Request failed",
    };
  }
};
