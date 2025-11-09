import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

// Battery interface
export interface Battery {
    id: string;
    serial: string;
    model: string;
    soh: number;
    status: "full" | "charging" | "faulty" | "idle" | "in-use" | "is-booking";
    price: number;
    manufacturer?: string;
    capacityKwh?: number;
    voltage?: number;
}

// Slot interface
export interface Slot {
    id: string;
    slotCode: string;
    pillar: string;
    station: string;
    slotNumber: number;
    battery: Battery | null;
    status: "occupied" | "empty" | "reserved" | "maintenance";
    isAlwaysEmpty: boolean;
    position: {
        column: number;
    };
    reservation?: {
        booking: {
            id: string;
            scheduledTime: string;
            status: string;
            bookingId: string;
        } | null;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        reservedAt: string;
        expiresAt: string;
    };
    lastActivity?: {
        action: string;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        battery: {
            id: string;
            serial: string;
            model: string;
        };
        timestamp: string;
    };
    createdAt: string;
    updatedAt: string;
    v?: number;
}

// Station info in Pillar
export interface StationInfo {
    id: string;
    stationName: string;
    address: string;
}

// Pillar interface
export interface Pillar {
    id: string;
    station: StationInfo;
    pillarName: string;
    pillarNumber: number;
    totalSlots: number;
    status: "active" | "inactive" | "maintenance";
    pillarCode: string;
    slotStats: {
        total: number;
        occupied: number;
        empty: number;
        reserved: number;
    };
    slots: Slot[];
    createdAt: string;
    updatedAt: string;
    v?: number;
}

// API Response interface
export interface PillarsResponse {
    message: string;
    pillars: Pillar[];
}

// Detailed Pillar Response interface
export interface PillarDetailResponse {
    success: boolean;
    message: string;
    data: {
        pillar: {
            id: string;
            pillarCode: string;
            pillarName: string;
            pillarNumber: number;
            status: string;
            station: {
                id: string;
                stationName: string;
                address: string;
                city: string;
                district: string;
            };
            slotStats: {
                total: number;
                occupied: number;
                empty: number;
                reserved: number;
            };
            createdAt: string;
            updatedAt: string;
        };
        statistics: {
            totalSlots: number;
            emptySlots: number;
            occupiedSlots: number;
            reservedSlots: number;
            lockedSlots: number;
            maintenanceSlots: number;
            errorSlots: number;
            availableBatteries: number;
        };
        slots: Slot[];
        batteries: {
            slotNumber: number;
            slotCode: string;
            battery: Battery;
            slotStatus: string;
        }[];
    };
}

// Signify stores
export const sPillars = signify<Pillar[]>([]);
export const sSelectedPillar = signify<Pillar | null>(null);
export const sPillarsLoading = signify<boolean>(false);

// Hooks
export const usePillars = () => sPillars.use();
export const useSelectedPillar = () => sSelectedPillar.use();
export const usePillarsLoading = () => sPillarsLoading.use();

/**
 * Get all pillars by station ID
 * @param stationId - Station ID
 * @returns Promise<Pillar[]>
 */
export const getPillarsByStationId = async (
    stationId: string
): Promise<Pillar[]> => {
    try {
        sPillarsLoading.set(true);

        const res = await httpClient.get<PillarsResponse>(
            `/battery-swap/pillars/station/${stationId}`
        );

        if (res.pillars && Array.isArray(res.pillars)) {
            const data = toCamelCase(res.pillars);
            sPillars.set(data);
            return data;
        } else {
            console.warn("Invalid API response format:", res);
            sPillars.set([]);
            return [];
        }
    } catch (error: any) {
        console.error("API Error - Get Pillars by Station:", {
            message: error.message,
            success: error.success,
            errors: error.errors,
        });

        sPillars.set([]);
        return [];
    } finally {
        sPillarsLoading.set(false);
    }
};

/**
 * Get pillar details by ID (with full slot and battery information)
 * @param pillarId - Pillar ID
 * @returns Promise<Pillar | null>
 */
export const getPillarDetailsById = async (
    pillarId: string
): Promise<Pillar | null> => {
    try {
        const res = await httpClient.get<PillarDetailResponse>(
            `/battery-swap/pillars/${pillarId}`
        );

        if (res.data && res.data.pillar && res.data.slots) {
            // Convert to camelCase
            const pillarData = toCamelCase(res.data.pillar);
            const slotsData = toCamelCase(res.data.slots);

            // Combine pillar info with slots
            const pillar: Pillar = {
                ...pillarData,
                station: {
                    id: pillarData.station.id,
                    stationName: pillarData.station.stationName,
                    address: pillarData.station.address,
                },
                totalSlots: pillarData.slotStats.total,
                status: pillarData.status as "active" | "inactive" | "maintenance",
                slots: slotsData,
            };

            // Update selected pillar
            sSelectedPillar.set(pillar);

            // Also update in pillars array if exists
            const currentPillars = sPillars.value;
            const index = currentPillars.findIndex((p: Pillar) => p.id === pillar.id);
            if (index !== -1) {
                const updatedPillars = [...currentPillars];
                updatedPillars[index] = pillar;
                sPillars.set(updatedPillars);
            }

            return pillar;
        } else {
            console.warn("Invalid API response format:", res);
            return null;
        }
    } catch (error: any) {
        console.error("API Error - Get Pillar Details by ID:", {
            message: error.message,
            success: error.success,
            errors: error.errors,
        });
        return null;
    }
};

/**
 * Get pillar details by ID
 * @param pillarId - Pillar ID
 * @returns Promise<Pillar | null>
 */
export const getPillarById = async (
    pillarId: string
): Promise<Pillar | null> => {
    try {
        const res = await httpClient.get<{ pillar: Pillar }>(
            `/battery-swap/pillars/${pillarId}`
        );

        if (res.pillar) {
            const data = toCamelCase(res.pillar);
            sSelectedPillar.set(data);
            return data;
        } else {
            console.warn("Invalid API response format:", res);
            return null;
        }
    } catch (error: any) {
        console.error("API Error - Get Pillar by ID:", {
            message: error.message,
            success: error.success,
            errors: error.errors,
        });
        return null;
    }
};

/**
 * Get available slots from a pillar
 * @param pillarId - Pillar ID
 * @param pillars - Current pillars array
 * @returns Slot[]
 */
export const getAvailableSlots = (pillarId: string, pillars: Pillar[]): Slot[] => {
    const pillar = pillars.find((p: Pillar) => p.id === pillarId);

    if (!pillar) return [];

    return pillar.slots.filter((slot: Slot) => slot.status === "empty");
};

/**
 * Get occupied slots from a pillar
 * @param pillarId - Pillar ID
 * @param pillars - Current pillars array
 * @returns Slot[]
 */
export const getOccupiedSlots = (pillarId: string, pillars: Pillar[]): Slot[] => {
    const pillar = pillars.find((p: Pillar) => p.id === pillarId);

    if (!pillar) return [];

    return pillar.slots.filter((slot: Slot) => slot.status === "occupied");
};

/**
 * Clear pillars store
 */
export const clearPillars = () => {
    sPillars.set([]);
    sSelectedPillar.set(null);
    sPillarsLoading.set(false);
};
