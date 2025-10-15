// import httpClient from "@/services/rootAPI";
import axios from "axios";
import { signify } from "react-signify";

export type Battery = {
    id: string;
    name: string;
    capacity?: number;
    health?: number;
    status?: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

export const sBatteries = signify<Battery[]>([]);
export const useBatteries = () => sBatteries.use();

export const getAllBattery = async (): Promise<Battery[]> => {
    try {
        const res = await axios.get('https://666128ca63e6a0189fe8ac6a.mockapi.io/battery');
        const data = res.data as Battery[];
        sBatteries.set(data as Battery[]);
        return data;
    } catch (error: any) {
        console.error(error);
        sBatteries.set([]);
        return [] as Battery[];
    }
}