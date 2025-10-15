import httpClient from '@/services/rootAPI';
import { signify } from 'react-signify';

export type Vehicle = {
    id: string;
    carName: string;
    brand: string;
    batteryModel: string;
    vin?: string;
};

// Vehicle states
export const sVehicles = signify<Vehicle[]>([]);
export const sSelectedVehicle = signify<Vehicle | null>(null);


export const useVehicles = () => sVehicles.use();
export const useSelectedVehicle = () => sSelectedVehicle.use();
export const getAllVehicle = async (): Promise<Vehicle[]> => {
    try {
        const res = await httpClient.get<{ data: Vehicle[] }>('/vehicles');
        sVehicles.set(res.data);
        return res.data;
    } catch (error: any) {
        console.error(error);
        sVehicles.set([]);
        return [] as Vehicle[];
    }
}




