import httpClient from "@/services/rootAPI";
import { toCamelCase } from "@/utils/caseConverter";
import { signify } from "react-signify";

export interface SubscriptionPlan {
  _id: string;
  subscriptionName: string;
  price: number;
  durations: number;
  description: string;
  countSwap: number | null;
  quantitySlot: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PurchaseSubscriptionRequest {
  planId: string;
  start_date: string; // ISO string
}

export interface PurchasedSubscription {
  _id: string;
  user: string;
  plan: string;
  start_date: string;
  end_date: string;
  remaining_swaps: number | null;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const sSubscriptionPlans = signify<SubscriptionPlan[]>([]);
export const useSubscriptionPlans = () => sSubscriptionPlans.use();

export const sPurchasedSubscription = signify<PurchasedSubscription | null>(null);
export const usePurchasedSubscription = () => sPurchasedSubscription.use();

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
