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
}export interface BatteryRespon {
    id: string;
    serial: string;
    model: string;
    soh: number;
    status: string;
    station: string;
    manufacturer: string;
    capacityKWh: number;
    voltage: number;
    createdAt: string;
    updatedAt: string;
}

export const sBatteries = signify<Battery[]>([]);
export const sBatteriesInStation = signify<any>(null)

export const useBatteries = () => sBatteries.use();
export const useBatteriesInStation = () => sBatteriesInStation.use();

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
export const getAllBatteryByStationId = async (stationId: string): Promise<Battery[]> => {
    try {
        const res = await httpClient.get<{ data: Battery[] }>(`/batteries/station/${stationId}/management`);
        const data = toCamelCase(res.data)
        sBatteriesInStation.set(data)
        return res.data;
    } catch (error: any) {
        console.error(error);
        return [] as Battery[];
    }
}

