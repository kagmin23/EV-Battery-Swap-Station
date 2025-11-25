import httpClient from '@/services/rootAPI';
import { toCamelCase, toSnakeCase } from '@/utils/caseConverter';
import { signify } from 'react-signify';

export type Vehicle = {
    vehicleId?: string;
    carName: string;
    brand: string;
    batteryId?: string
    battery?: {
        stationId?: string;
        serial?: string;
        model?: string;
        manufacturer?: string;
        capacityKWh?: number;
        price?: number;
        voltage?: number;
    };
    vin: string | null;
    modelYear: number | null;
    licensePlate: string;
};

interface CreateVehicleResponse {
    success: boolean;
    data: {
        vehicle_id: string;
        user_id: string;
        vin: string;
        battery_id: string;
        license_plate: string;
        car_name: string;
        brand: string;
        model_year: number;
        created_at: string;
        updated_at: string;
    };
    message: string;
}

// Vehicle states
export const sVehicles = signify<Vehicle[]>([]);
export const sSelectedVehicle = signify<Vehicle | null>(null);


export const useVehicles = () => sVehicles.use();
export const useSelectedVehicle = () => sSelectedVehicle.use();
export const getAllVehicle = async (): Promise<Vehicle[]> => {
    try {
        const res = await httpClient.get<{ data: Vehicle[] }>('/vehicles');

        sVehicles.set(toCamelCase(res.data));
        return res.data;
    } catch (error: any) {
        console.error(error);
        sVehicles.set([]);
        return [] as Vehicle[];
    }
}

export const creatVehicle = async (data: Vehicle
): Promise<CreateVehicleResponse> => {
    try {
        // Build payload to match backend expectations when battery object is provided
        const payload: any = {
            vin: data.vin,
            license_plate: data.licensePlate,
            car_name: data.carName,
            brand: data.brand,
            model_year: data.modelYear,
        };

        if (data.battery) {
            payload.battery = {
                station: data.battery.stationId || '',
                serial: data.battery.serial || '',
                model: data.battery.model || '',
                manufacturer: data.battery.manufacturer || '',
                // Use the key name expected by backend. Use provided camelCase field if available.
                capacity_kWh: data.battery.capacityKWh ?? data.battery.capacityKWh ?? 0,
                price: data.battery.price ?? 0,
                voltage: data.battery.voltage ?? 0,
            };
        }

        // If battery not provided, include other fields by converting to snake_case for compatibility
        if (!payload.battery) {
            Object.assign(payload, toSnakeCase(data));
        }

        const created = await httpClient.post<CreateVehicleResponse>('/vehicles', payload);
        await getAllVehicle();
        return created;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}


export const getNameVehicleById = (vehicles: Vehicle[] | undefined, vehicleId: string) => {
    const vehicle = vehicles?.find((v: Vehicle) => v.vehicleId === vehicleId);
    return vehicle || null;
}

/**
 * Get vehicle detail by ID (includes current battery info)
 * @param vehicleId - Vehicle ID
 * @returns Vehicle with current battery information
 */
export const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
    try {
        const res = await httpClient.get<{ data: any }>(`/vehicles/${vehicleId}`);
        // Convert keys to camelCase first
        const raw = toCamelCase(res.data || {});

        // If backend returns battery fields at top-level (e.g. battery_id, serial, model, capacity_kWh),
        // normalize them into a nested `battery` object expected by our frontend `Vehicle` type.
        const hasBatteryTopLevel = !!(raw.batteryId || raw.serial || raw.model || raw.manufacturer || raw.capacityKWh || raw.price || raw.voltage || raw.soh || raw.status);

        let vehicleData: any = { ...raw };

        if (hasBatteryTopLevel) {
            const battery = {
                serial: raw.serial ?? '',
                model: raw.model ?? '',
                manufacturer: raw.manufacturer ?? '',
                capacityKWh: raw.capacityKWh ?? raw.capacity ?? 0,
                price: raw.price ?? 0,
                voltage: raw.voltage ?? 0,
            };

            vehicleData.battery = battery;

            // Remove top-level battery keys to avoid duplication
            delete vehicleData.serial;
            delete vehicleData.model;
            delete vehicleData.manufacturer;
            delete vehicleData.capacityKWh;
            delete vehicleData.capacity;
            delete vehicleData.price;
            delete vehicleData.voltage;
            delete vehicleData.batteryId;
            delete vehicleData.soh;
            delete vehicleData.status;
        }

        return vehicleData as Vehicle;
    } catch (error: any) {
        console.error('Error fetching vehicle:', error);
        return null;
    }
}

