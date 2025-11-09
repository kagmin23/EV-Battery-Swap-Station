import httpClient from "@/services/rootAPI";
import { toSnakeCase } from "@/utils/caseConverter";
import { useMutation } from "@tanstack/react-query";

export interface BookingRequest {
    stationId: string;
    scheduledTime: string;
    vehicleId: string;
    batteryId: string;
    pillarId?: string; // Make optional if backend doesn't require it
}

export interface BookingResponse {
    success: boolean;
    message: string;
    bookingId?: string;

}


export const bookingAPI = {
    async createBooking(data: BookingRequest): Promise<BookingResponse> {

        const payload = await toSnakeCase(data);

        const endpoint = "/booking";
        console.log('🚀 CREATE BOOKING - Full Request Details:');
        console.log('   URL:', endpoint);
        console.log('   Method: POST');
        console.log('   Original Data:', JSON.stringify(data, null, 2));
        console.log('   Payload (snake_case):', JSON.stringify(payload, null, 2));

        try {
            const response = await httpClient.post<BookingResponse>(endpoint, payload, {
                "Content-Type": "application/json",
            });

            console.log('✅ CREATE BOOKING - Response received:', response);
            return response;
        } catch (error: any) {
            console.log('❌ CREATE BOOKING - Error Details:');
            console.log('   Status:', error?.response?.status);
            console.log('   Status Text:', error?.response?.statusText);
            console.log('   Error Data:', JSON.stringify(error?.response?.data, null, 2));
            console.log('   Error Message:', error?.message);
            console.log('   Sent Payload:', JSON.stringify(payload, null, 2));

            console.error('❌ Booking API Error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                payload: payload,
            });
            throw error;
        }
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






