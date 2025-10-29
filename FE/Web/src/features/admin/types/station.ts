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
    batteryCounts?: {
        total: number;
        available: number;
        charging: number;
        inUse: number;
        faulty: number;
    };
    lastActive?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface StationFilters {
    search: string;
    city: string;
    district: string;
    limit: string;
}

export interface StationStats {
    totalStations: number;
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
}
