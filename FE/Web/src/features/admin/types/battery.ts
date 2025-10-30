export interface Battery {
    id: string;
    batteryId: string;
    stationId: string;
    stationName: string;
    status: BatteryStatus;
    soh: number;
    voltage: number;
    current: number;
    temperature: number;
    cycleCount: number;
    lastMaintenance: Date;
    createdAt: Date;
    updatedAt: Date;
    // Additional fields for editing
    model?: string;
    manufacturer?: string;
    capacity_kWh?: number;
    price?: number;
}

export type BatteryStatus = 'charging' | 'full' | 'faulty' | 'in-use' | 'idle' | 'is-booking';

export interface BatteryFilters {
    search: string;
    stationId: string;
    status: BatteryStatus | 'ALL';
    sohMin: number;
    sohMax: number;
    sortBy: 'createdAt' | 'updatedAt' | 'soh';
    sortOrder: 'asc' | 'desc';
}

export interface BatteryStats {
    totalBatteries: number;
    byStatus: {
        charging: number;
        full: number;
        faulty: number;
        inUse: number;
        idle: number;
        isBooking: number;
    };
    byStation: Array<{
        stationId: string;
        stationName: string;
        count: number;
    }>;
    averageSoh: number;
    totalCycles: number;
}

export interface BatteryGroupedByStation {
    stationId: string;
    stationName: string;
    batteries: Battery[];
    stats: {
        total: number;
        charging: number;
        full: number;
        faulty: number;
        inUse: number;
        idle: number;
        averageSoh: number;
    };
}