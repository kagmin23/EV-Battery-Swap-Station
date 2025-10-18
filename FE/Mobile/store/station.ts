import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signify } from "react-signify";



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
export const sFavorites = signify<string[]>([]);
let favoritesCache: string[] = [];


export const useStation = () => sStation.use();
export const useSelectedStation = () => sSelectedStation.use();
export const useFavorites = () => sFavorites.use();

const FAVORITES_KEY = "favoriteStations";

const loadFavorites = async (): Promise<string[]> => {
    try {
        const raw = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveFavorites = async (favorites: string[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
        // ignore persist errors
    }
};

export const initFavorites = async (): Promise<void> => {
    const stored = await loadFavorites();
    favoritesCache = stored;
    sFavorites.set(stored);
};

export const isFavorite = (stationId: string | undefined | null): boolean => {
    if (!stationId) return false;
    return favoritesCache.includes(stationId);
};

export const toggleFavorite = async (stationId: string | undefined | null): Promise<void> => {
    if (!stationId) return;
    const current = favoritesCache;
    const next = current.includes(stationId)
        ? current.filter((id: string) => id !== stationId)
        : [...current, stationId];
    favoritesCache = next;
    sFavorites.set(next);
    await saveFavorites(next);
};

export const clearFavorites = async (): Promise<void> => {
    favoritesCache = [];
    sFavorites.set([]);
    try {
        await AsyncStorage.removeItem(FAVORITES_KEY);
    } catch {
        // ignore
    }
};

export const getListStationNear = async (payload: Location): Promise<Station[]> => {
    try {
        const res = await httpClient.get<{ data: Station[] }>('/stations', payload)
        console.log(res)
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