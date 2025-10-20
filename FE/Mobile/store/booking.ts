import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

export interface Booking {
    bookingId: string;
    userId: string;
    stationId: string;
    vehicleId: string;
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
        }
        else {
            console.warn('Invalid API response format:', res.data)
            sBookings.set([])
            return []
        }
    } catch (error: any) {
        console.error('API Error details:', {
            message: error.message,
            success: error.success,
            errors: error.errors,
            isApiError: error.success !== undefined
        });

        console.error('Full error object:', error);
        return [];
    }
}