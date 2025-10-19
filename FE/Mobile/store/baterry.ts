// import httpClient from "@/services/rootAPI";
import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

export interface BatteryStation {
    id: string;
    stationName: string;
    address: string;
}

export interface Battery {
    id: string;
    serial: string;
    model: string;
    soh: number;
    status: string;
    station: BatteryStation;
    manufacturer: string;
    capacityKWh: number;
    voltage: number;
    createdAt: string;
    updatedAt: string;

}

export const sBatteries = signify<Battery[]>([]);
export const useBatteries = () => sBatteries.use();

export const getAllBattery = async (): Promise<Battery[]> => {
    try {
        const res = await httpClient.get<{ data: Battery[] }>('/batteries/model');
        const data = toCamelCase(res.data) as Battery[];
        sBatteries.set(data);
        return data;
    } catch (error: any) {
        console.error(error);
        sBatteries.set([]);
        return [] as Battery[];
    }
}

