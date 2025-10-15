import httpClient from '@/services/rootAPI';
import { toCamelCase, toSnakeCase } from '@/utils/caseConverter';
import { signify } from 'react-signify';

export type Vehicle = {
    id?: string;
    carName: string;
    brand: string;
    batteryModel: string;
    vin?: string;
    modelYear?: number;
    licensePlate?: string
};

interface CreateVehicleResponse {
    success: boolean;
    data: {
        vehicle_id: string;
        user_id: string;
        vin: string;
        battery_model: string;
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
        const payload = toSnakeCase(data)

        const created = await httpClient.post<CreateVehicleResponse>('/vehicles', payload);
        await getAllVehicle();
        return created;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}




