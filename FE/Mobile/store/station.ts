import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify"



interface Station {
    id: string,
    stationName: string,
    address: string,
    city: string,
    district: string,
    mapUrl: string,
    capacity: number,
    sohAvg: number,
    availableBatteries: number
}


interface Location {
    lat: number,
    lng: number,

}
export const sStation = signify<Station[]>([]);
export const sSelectedStation = signify<Station | null>(null);


export const useStation = () => sStation.use();
export const useSelectedVehicle = () => sSelectedStation.use();

export const getListStationNear = async (payload: Location): Promise<Station[]> => {
    try {


        const res = await httpClient.get<{ data: Station[] }>('/stations', payload)


        if (res.data && Array.isArray(res.data)) {
            const station = toCamelCase(res.data)

            sStation.set(station)
            return station
        } else {
            console.warn('Invalid API response format:', res.data)
            sStation.set([])
            return []
        }
    } catch (error: any) {
        console.error('API Error details:', {
            message: error.message,
            success: error.success,
            errors: error.errors,
            isApiError: error.success !== undefined
        });

        // Log the full error object for debugging
        console.error('Full error object:', error);

        sStation.set([])
        return []
    }
}