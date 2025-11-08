import { signify } from 'react-signify';
import httpClient from '@/services/rootAPI';
import { toCamelCase } from '@/utils/caseConverter';

// Types
export interface Position {
    row: number;
    column: number;
}

export interface GridBattery {
    id: string;
    serial: string;
    model: string;
    soh: number;
    status: string;
    manufacturer?: string;
    capacityKwh?: number;
    voltage?: number;
    price?: number;
}

export interface Reservation {
    booking: {
        id: string;
        scheduledTime: string;
        status: string;
        bookingId: string;
    };
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    reservedAt: string;
    expiresAt: string;
}

export interface LastActivity {
    action: string;
    user: string;
    battery: string;
    timestamp: string;
}

export interface GridSlot {
    id: string;
    slotNumber: number;
    slotCode: string;
    status: 'empty' | 'occupied' | 'reserved' | 'charging';
    position: Position;
    battery: GridBattery | null;
    reservation: Reservation | null;
    lastActivity?: LastActivity;
    isAlwaysEmpty: boolean;
}

export interface PillarInfo {
    id: string;
    pillarCode: string;
    pillarName: string;
    pillarNumber: number;
    status: string;
    station: {
        id: string;
        stationName: string;
        address: string;
    };
    slotStats: {
        total: number;
        occupied: number;
        empty: number;
        reserved: number;
    };
}

export interface GridLayout {
    rows: number;
    columns: number;
    totalSlots: number;
}

export interface PillarGridResponse {
    pillar: PillarInfo;
    gridLayout: GridLayout;
    grid: GridSlot[][];
    slotsList: GridSlot[];
}

// Signals
export const sPillarGrid = signify<PillarGridResponse | null>(null);
export const sPillarGridLoading = signify<boolean>(false);
export const sPillarGridError = signify<string | null>(null);

// Hooks
export const usePillarGrid = () => sPillarGrid.use();
export const usePillarGridLoading = () => sPillarGridLoading.use();
export const usePillarGridError = () => sPillarGridError.use();

// API Functions
export const getPillarGrid = async (pillarId: string, rows: number = 2, columns: number = 5) => {
    sPillarGridLoading.set(true);
    sPillarGridError.set(null);

    try {
        const response: any = await httpClient.get(
            `/battery-swap/pillars/${pillarId}/grid`,
            {
                params: { rows, columns }
            }
        );

        const data = toCamelCase(response.data);

        // Check if data has the expected structure (grid, pillar, gridLayout)
        if (data && data.grid && data.pillar && data.gridLayout) {
            sPillarGrid.set(data as PillarGridResponse);
            return data as PillarGridResponse;
        } else if (data.success && data.data) {
            // Fallback: if wrapped in success/data structure
            sPillarGrid.set(data.data as PillarGridResponse);
            return data.data as PillarGridResponse;
        } else {
            const errorMsg = data.message || 'Failed to fetch pillar grid';
            sPillarGridError.set(errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error.message || 'Network error';
        sPillarGridError.set(errorMsg);
        console.error('Pillar Grid Error:', errorMsg, error);
        throw error;
    } finally {
        sPillarGridLoading.set(false);
    }
};

// Clear grid data
export const clearPillarGrid = () => {
    sPillarGrid.set(null);
    sPillarGridError.set(null);
};
