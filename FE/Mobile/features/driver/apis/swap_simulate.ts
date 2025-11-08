import httpClient from '@/services/rootAPI';
import { toCamelCase } from '@/utils/caseConverter';
import { config } from '@/config/env';

// Interfaces
export interface SwapInstructions {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
}

export interface EmptySlot {
    id: string;
    slotCode: string;
    slotNumber: number;
}

export interface BookedBattery {
    id: string;
    serial: string;
    model: string;
    slotNumber: number;
    slotCode: string;
    soh: number;
}

export interface Pillar {
    id: string;
    pillarCode: string;
    pillarName: string;
    pillarNumber: number;
}

export interface BookingInfo {
    bookingId: string;
    status: string;
    scheduledTime: string;
}

export interface SwapResponse {
    message: string;
    swapId: string;
    instructions: SwapInstructions;
    booking: BookingInfo;
    pillar: Pillar;
    emptySlot: EmptySlot;
    bookedBattery: BookedBattery;
}

export interface InitiateSwapPayload {
    vehicleId: string;
    bookingId?: string; // UUID format (fallback)
    id?: string; // MongoDB ObjectId (preferred for bookingId)
}

/**
 * Initiate battery swap process
 * @param payload - Vehicle ID, Station ID, and Booking ID (userId is handled by backend)
 * @returns Swap instructions and details
 */
export const initiateBatterySwap = async (
    payload: InitiateSwapPayload
): Promise<SwapResponse> => {
    try {
        // Validate required fields
        if (!payload.id && !payload.bookingId) {
            throw new Error('Either id (ObjectId) or bookingId (UUID) is required');
        }


        const requestBody = {
            vehicleId: payload.vehicleId,
            bookingId: payload.id || payload.bookingId
        };

        console.log('🚀 About to send POST request...');
        const responseData: any = await httpClient.post(
            '/battery-swap/swap/initiate',
            requestBody
        );

        const data = toCamelCase(responseData);

        // Check if data is wrapped (e.g., {success: true, data: {...}})
        const actualData = data?.data || data;
        const swapId = actualData?.swapId || (actualData as any)?.swap_id;

        if (swapId) {
            console.log('✅ Found swapId:', swapId);
            return actualData as SwapResponse;
        } else {

            throw new Error(data?.message || actualData?.message || 'Invalid response from server - missing swapId');
        }
    } catch (error: any) {


        // Extract error message from various possible locations
        let errorMessage = 'Failed to initiate battery swap';

        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Complete battery swap process
 * @param swapId - Swap ID
 * @returns Completion confirmation
 */
export const completeBatterySwap = async (
    swapId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response: any = await httpClient.post(
            '/battery-swap/complete',
            { swapId }
        );

        const data = toCamelCase(response.data);
        return data;
    } catch (error: any) {
        console.error('API Error - Complete Battery Swap:', {
            message: error.message,
            response: error.response?.data,
        });

        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            'Failed to complete battery swap'
        );
    }
};

/**
 * Cancel battery swap process
 * @param swapId - Swap ID
 * @returns Cancellation confirmation
 */
export const cancelBatterySwap = async (
    swapId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response: any = await httpClient.post(
            '/battery-swap/cancel',
            { swapId }
        );

        const data = toCamelCase(response.data);
        return data;
    } catch (error: any) {
        console.error('API Error - Cancel Battery Swap:', {
            message: error.message,
            response: error.response?.data,
        });

        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            'Failed to cancel battery swap'
        );
    }
};
