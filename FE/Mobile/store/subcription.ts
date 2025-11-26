import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signify } from "react-signify";

export interface SubscriptionPlan {
  _id: string;
  subscriptionName: string;
  price: number;
  /** optional type: 'change' | 'periodic' */
  type?: string | null;
  durations: number;
  description: string;
  countSwap: number | null;
  quantitySlot: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  availableSlots?: number;
  userSubscription?: {
    id: string;
    status: string;
    remainingSwaps?: number | null;
    startDate?: string;
    endDate?: string;
  } | null;
}

export interface PurchaseSubscriptionRequest {
  planId: string;
  start_date: string; // ISO string
}

export interface PurchasedSubscription {
  _id: string;
  user: string;
  plan: string;
  /** optional type: 'change' | 'periodic' */
  type?: string | null;
  startDate: string;
  endDate: string;
  remainingSwaps: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateSubscriptionPaymentRequest {
  planId: string;
  returnUrl: string;
}

export interface CreateSubscriptionPaymentResponse {
  url: string;
  txnRef: string;
  paymentId: string;
  subscriptionId?: string;
}

export interface ConfirmSubscriptionRequest {
  subscriptionId: string;
  planId: string;
}

export interface SetMonthlyDayRequest {
  planId: string;
  monthly_day: string;
  station_id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const sSubscriptionPlans = signify<SubscriptionPlan[]>([]);
export const useSubscriptionPlans = () => sSubscriptionPlans.use();

export const sPurchasedSubscription = signify<PurchasedSubscription | null>(null);
export const usePurchasedSubscription = () => sPurchasedSubscription.use();

// Local-only schedule store for client-side scheduling (saved in memory across app session)
export type LocalSchedule = { monthlyDay?: string | null; stationId?: string | null };
export const sLocalSchedules = signify<Record<string, LocalSchedule>>({});
export const useLocalSchedules = () => sLocalSchedules.use();

// Note: use `useLocalSchedules()` inside React components to read the map,
// and call `sLocalSchedules.set(...)` to update it from non-hook contexts.

const STORAGE_KEY = 'evsb_local_schedules_v1';

export const saveLocalSchedulesToStorage = async (map: Record<string, LocalSchedule>) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map || {}));
  } catch (e) {
    console.warn('Failed to persist local schedules to storage', e);
  }
};

export const loadLocalSchedulesFromStorage = async (): Promise<Record<string, LocalSchedule>> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw || '{}');
    if (parsed && typeof parsed === 'object') {
      sLocalSchedules.set(parsed);
      return parsed as Record<string, LocalSchedule>;
    }
    return {};
  } catch (e) {
    console.warn('Failed to load local schedules from storage', e);
    return {};
  }
};

const normalizeSubscriptionPlan = (data: any): SubscriptionPlan =>
  toCamelCase(data) as SubscriptionPlan;

const normalizePurchasedSubscription = (data: any): PurchasedSubscription =>
  toCamelCase(data) as PurchasedSubscription;

export const getSubscriptionPlansApi = async (): Promise<
  ApiResponse<SubscriptionPlan[]>
> => {
  try {
    const response = await httpClient.get<ApiResponse<any[]>>(
      "/users/subscriptions/plans"
    );

    const camelData = Array.isArray(response.data)
      ? response.data.map(normalizeSubscriptionPlan)
      : [];
    sSubscriptionPlans.set(camelData);
    return { ...response, data: camelData };
  } catch (error) {
    sSubscriptionPlans.set([]);
    throw error;
  }
};

export const purchaseSubscriptionApi = async (
  body: PurchaseSubscriptionRequest
): Promise<ApiResponse<PurchasedSubscription>> => {
  try {
    const response = await httpClient.post<ApiResponse<any>>(
      "/users/subscriptions/purchase",
      body
    );

    const raw = (response as any).data;
    const payload = raw && raw.data ? raw.data : raw;
    const camelData = normalizePurchasedSubscription(payload);

    sPurchasedSubscription.set(camelData);
    return { ...(response as any), data: camelData };
  } catch (error) {
    throw error;
  }
};

export const createSubscriptionPaymentApi = async (
  body: CreateSubscriptionPaymentRequest
): Promise<ApiResponse<CreateSubscriptionPaymentResponse>> => {
  try {
    const response = await httpClient.post<ApiResponse<any>>(
      "/users/subscriptions/create-payment",
      body
    );

    const raw = (response as any).data;
    const payload = raw && raw.data ? raw.data : raw;
    const camelData = toCamelCase(payload) as CreateSubscriptionPaymentResponse;

    return { ...(response as any), data: camelData };
  } catch (error) {
    throw error;
  }
};

export const confirmSubscriptionApi = async (
  body: ConfirmSubscriptionRequest
): Promise<ApiResponse<PurchasedSubscription>> => {
  try {
    const response = await httpClient.post<ApiResponse<any>>(
      "/users/subscriptions/confirm",
      body
    );

    const raw = (response as any).data;
    const payload = raw && raw.data ? raw.data : raw;
    const camelData = normalizePurchasedSubscription(payload);

    sPurchasedSubscription.set(camelData);
    return { ...(response as any), data: camelData };
  } catch (error) {
    throw error;
  }
};

/**
 * Set or change the monthly swap day for the authenticated driver's active subscription.
 * POST /users/subscriptions/monthly-day
 * body: { planId, monthly_day, station_id }
 */
export const setMonthlySwapDayApi = async (
  body: SetMonthlyDayRequest
): Promise<ApiResponse<PurchasedSubscription>> => {
  try {
    const response = await httpClient.post<ApiResponse<any>>(
      "/users/subscriptions/monthly-day",
      body
    );

    const raw = (response as any).data;
    const payload = raw && raw.data ? raw.data : raw;
    const camelData = normalizePurchasedSubscription(payload);

    // update local purchased subscription store with returned subscription (pending)
    sPurchasedSubscription.set(camelData);
    return { ...(response as any), data: camelData };
  } catch (error) {
    throw error;
  }
};
