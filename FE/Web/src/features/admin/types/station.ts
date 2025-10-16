export interface Station {
    id: string;
    name: string;
    address: string;
    city: string;
    district: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    mapUrl: string;
    capacity: number;
    sohAvg: number;
    availableBatteries: number;
    status: StationStatus;
    lastActive?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type StationStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export interface StationFilters {
    search: string;
    city: string;
    district: string;
    status: StationStatus | 'ALL';
}

export interface StationStats {
    totalStations: number;
    activeStations: number;
    maintenanceStations: number;
    inactiveStations: number;
    totalCapacity: number;
    totalAvailableBatteries: number;
    averageSoh: number;
    stationsByCity: {
        city: string;
        count: number;
    }[];
}

export interface AddStationRequest {
    name: string;
    address: string;
    city: string;
    district: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    mapUrl: string;
    capacity: number;
    sohAvg?: number;
    availableBatteries?: number;
}

export interface UpdateStationRequest {
    id: string;
    name?: string;
    address?: string;
    city?: string;
    district?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    mapUrl?: string;
    capacity?: number;
    sohAvg?: number;
    availableBatteries?: number;
    status?: StationStatus;
}
