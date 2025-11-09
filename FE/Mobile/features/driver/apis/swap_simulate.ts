import httpClient from '@/services/rootAPI';
import { toCamelCase } from '@/utils/caseConverter';

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

export interface InsertOldBatteryPayload {
    swapId: string;
    slotId: string;
    oldBatterySerial: string;
    // Optional battery info if creating new battery record
    model?: string;
    manufacturer?: string;
    capacity_kWh?: number;
    voltage?: number;
    price?: number;
}

export interface InsertOldBatteryResponse {
    message: string;
    swapId: string;
    oldBattery: {
        serial: string;
        slotNumber: number;
    };
    nextStep: string;
}

export interface CompleteSwapResponse {
    message: string;
    swapId: string;
    summary: {
        oldBattery: string;
        newBattery: string;
        newBatteryCharge: number;
        swapDuration: number;
        completedAt: string;
    };
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

        const endpoint = '/battery-swap/swap/initiate';
        console.log('🚀 INITIATE SWAP - Full Request Details:');
        console.log('   URL:', `${endpoint}`);
        console.log('   Method: POST');
        console.log('   Body:', JSON.stringify(requestBody, null, 2));

        const responseData: any = await httpClient.post(
            endpoint,
            requestBody
        );

        console.log('✅ INITIATE SWAP - Response received:', responseData);

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

        console.log('❌ INITIATE SWAP - Error Details:');
        console.log('   Status:', error?.response?.status);
        console.log('   Status Text:', error?.response?.statusText);
        console.log('   Error Data:', JSON.stringify(error?.response?.data, null, 2));
        console.log('   Error Message:', error?.message);

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
 * Insert old battery into reserved empty slot
 * @param payload - Swap ID, Slot ID, and old battery information
 * @returns Confirmation and next step instructions
 */
export const insertOldBattery = async (
    payload: InsertOldBatteryPayload
): Promise<InsertOldBatteryResponse> => {
    try {
        const endpoint = '/battery-swap/swap/insert-old-battery';
        console.log('🔄 INSERT OLD BATTERY - Full Request Details:');
        console.log('   URL:', endpoint);
        console.log('   Method: POST');
        console.log('   Body:', JSON.stringify(payload, null, 2));

        // Try different possible endpoints (backend might use different naming)
        const response: any = await httpClient.post(
            endpoint,
            payload
        );

        console.log('✅ INSERT OLD BATTERY - Response received:', response);
        console.log('📦 Raw response:', response);

        // Handle response data structure
        const data = toCamelCase(response);
        const actualData = data?.data || data;

        console.log('✅ Old battery inserted successfully:', actualData);

        // Validate response has required fields
        if (!actualData?.swapId && !actualData?.swap_id) {
            console.error('⚠️ Response missing swapId:', actualData);
            throw new Error('Invalid response: missing swapId');
        }

        return actualData as InsertOldBatteryResponse;
    } catch (error: any) {
        console.log('❌ INSERT OLD BATTERY - Error Details:');
        console.log('   Status:', error?.response?.status);
        console.log('   Status Text:', error?.response?.statusText);
        console.log('   Error Data:', JSON.stringify(error?.response?.data, null, 2));
        console.log('   Error Message:', error?.message);

        console.error('API Error - Insert Old Battery:', {
            message: error.message,
            response: error.response?.data,
        });

        let errorMessage = 'Failed to insert old battery';
        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Complete battery swap process
 * @param swapId - Swap ID
 * @returns Completion confirmation with summary
 */
export const completeBatterySwap = async (
    swapId: string
): Promise<CompleteSwapResponse> => {
    try {
        const endpoint = '/battery-swap/swap/complete';
        const requestBody = { swapId };

        console.log('🔄 COMPLETE SWAP - Full Request Details:');
        console.log('   URL:', endpoint);
        console.log('   Method: POST');
        console.log('   Body:', JSON.stringify(requestBody, null, 2));

        const response: any = await httpClient.post(
            endpoint,
            requestBody
        );

        console.log('✅ COMPLETE SWAP - Response received:', response);
        console.log('📦 Complete swap response:', response);

        const data = toCamelCase(response);
        const actualData = data?.data || data;

        console.log('✅ Swap completed successfully:', actualData);

        return actualData as CompleteSwapResponse;
    } catch (error: any) {
        console.log('❌ COMPLETE SWAP - Error Details:');
        console.log('   Status:', error?.response?.status);
        console.log('   Status Text:', error?.response?.statusText);
        console.log('   Error Data:', JSON.stringify(error?.response?.data, null, 2));
        console.log('   Error Message:', error?.message);

        console.error('❌ API Error - Complete Battery Swap:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            error: error.response?.data?.error,
        });

        let errorMessage = 'Failed to complete battery swap';

        // Priority: backend error message > response message > generic error
        if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
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
