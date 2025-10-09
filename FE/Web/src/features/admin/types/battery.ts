export interface Battery {
    id: string;
    serialNumber: string;
    model: string;
    manufacturer: string;
    capacity: number; // in kWh
    currentCharge: number; // percentage
    health: number; // percentage (State of Health)
    status: BatteryStatus;
    location: BatteryLocation;
    lastMaintenance: Date;
    nextMaintenance: Date;
    totalCycles: number;
    maxCycles: number;
    temperature: number; // in Celsius
    voltage: number; // in Volts
    current: number; // in Amperes
    power: number; // in Watts
    createdAt: Date;
    updatedAt: Date;
}

export type BatteryStatus = 'AVAILABLE' | 'IN_USE' | 'CHARGING' | 'MAINTENANCE' | 'RETIRED' | 'DEFECTIVE';

export interface BatteryLocation {
    type: 'STATION' | 'WAREHOUSE' | 'VEHICLE' | 'MAINTENANCE';
    stationId?: string;
    stationName?: string;
    slotId?: string;
    vehicleId?: string;
    vehicleModel?: string;
    warehouseId?: string;
    warehouseName?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface BatteryModel {
    id: string;
    name: string;
    manufacturer: string;
    capacity: number;
    voltage: number;
    maxCycles: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    weight: number;
    chargingTime: number; // in minutes
    specifications: {
        chemistry: string;
        operatingTemperature: {
            min: number;
            max: number;
        };
        storageTemperature: {
            min: number;
            max: number;
        };
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BatteryMaintenance {
    id: string;
    batteryId: string;
    type: 'ROUTINE' | 'REPAIR' | 'REPLACEMENT' | 'CALIBRATION' | 'CLEANING';
    description: string;
    performedBy: string;
    performedAt: Date;
    duration: number; // in minutes
    cost: number;
    currency: string;
    notes?: string;
    partsReplaced?: string[];
    nextMaintenance?: Date;
}

export interface BatterySwap {
    id: string;
    batteryId: string;
    driverId: string;
    driverName: string;
    stationId: string;
    stationName: string;
    oldBatteryId?: string;
    oldBatteryCharge?: number;
    newBatteryCharge: number;
    swapTime: Date;
    duration: number; // in minutes
    cost: number;
    currency: string;
    status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface BatteryAlert {
    id: string;
    batteryId: string;
    type: 'LOW_CHARGE' | 'HIGH_TEMPERATURE' | 'LOW_HEALTH' | 'MAINTENANCE_DUE' | 'DEFECTIVE' | 'CYCLE_LIMIT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    timestamp: Date;
    isResolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}

export interface BatteryFilters {
    search: string;
    status: BatteryStatus | 'ALL';
    location: string | 'ALL';
    manufacturer: string | 'ALL';
    healthRange: {
        min: number;
        max: number;
    };
    chargeRange: {
        min: number;
        max: number;
    };
}

export interface BatteryStats {
    totalBatteries: number;
    availableBatteries: number;
    inUseBatteries: number;
    chargingBatteries: number;
    maintenanceBatteries: number;
    retiredBatteries: number;
    defectiveBatteries: number;
    averageHealth: number;
    averageCharge: number;
    totalSwaps: number;
    batteriesByStatus: {
        status: BatteryStatus;
        count: number;
    }[];
    batteriesByLocation: {
        location: string;
        count: number;
    }[];
    batteriesByManufacturer: {
        manufacturer: string;
        count: number;
    }[];
    recentSwaps: BatterySwap[];
    recentAlerts: BatteryAlert[];
}

export interface AddBatteryRequest {
    serialNumber: string;
    modelId: string;
    status: BatteryStatus;
    location: Omit<BatteryLocation, 'coordinates'>;
    initialCharge?: number;
    initialHealth?: number;
}

export interface UpdateBatteryRequest {
    id: string;
    status?: BatteryStatus;
    location?: BatteryLocation;
    health?: number;
    temperature?: number;
    voltage?: number;
    current?: number;
    power?: number;
}

export interface BatteryInventory {
    id: string;
    stationId: string;
    stationName: string;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    batteries: Battery[];
    lastUpdated: Date;
}

export interface BatteryPerformance {
    batteryId: string;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    averageCharge: number;
    averageHealth: number;
    totalSwaps: number;
    totalEnergy: number; // in kWh
    efficiency: number; // percentage
    downtime: number; // in hours
    maintenanceCost: number;
    revenue: number;
}
