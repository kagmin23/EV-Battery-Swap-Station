import httpClient from "@/services/rootAPI";
import { toSnakeCase } from "@/utils/caseConverter";
import { useMutation } from "@tanstack/react-query";

export interface BookingRequest {
    stationId: string;
    scheduledTime: string;
    vehicleId: string;
    batteryId: string
    pillarId: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    bookingId?: string;

}


export const bookingAPI = {
    async createBooking(data: BookingRequest): Promise<BookingResponse> {
        const payload = await toSnakeCase(data)

        return httpClient.post<BookingResponse>("/booking", payload, {
            "Content-Type": "application/json",
        });
    },
};

export const useCreateBooking = () => {
    return useMutation<BookingResponse, Error, BookingRequest>({
        mutationFn: async (data: BookingRequest) => {
            return await bookingAPI.createBooking(data);
        },
        onSuccess: (response) => {
            // Toast will be handled in the component
        },
        onError: (error) => {
            // Toast will be handled in the component
            console.error("Booking creation failed:", error.message);
        },
    });
};






