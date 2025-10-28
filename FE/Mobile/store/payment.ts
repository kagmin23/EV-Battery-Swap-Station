import httpClient from "@/services/rootAPI";
import { showErrorToast } from "@/utils/toast";
import { useCallback, useState } from "react";

/** ---------- Interfaces ---------- */
export interface CreateVnPayPaymentRequest {
  amount: number;
  orderInfo?: string;
  bookingId?: string;
  returnUrl: string;
}

export interface CreateVnPayPaymentResponse {
  success: true;
  data: {
    url: string;
    txnRef: string;
    payment_id: string;
  };
}

export interface CreateVnPayPaymentError {
  success: false;
  message: string;
}

interface UseVnPayReturn {
  loading: boolean;
  createPayment: (payload: CreateVnPayPaymentRequest) => Promise<CreateVnPayPaymentResponse["data"] | null>;
}

/** ---------- Type Guard ---------- */
/**
 * Type guard giúp TS hiểu chắc chắn response là success
 */
function isVnPaySuccess(
  res: CreateVnPayPaymentResponse | CreateVnPayPaymentError
): res is CreateVnPayPaymentResponse {
  return res.success === true;
}

/** ---------- Hook ---------- */
export const useVnPay = (): UseVnPayReturn => {
  const [loading, setLoading] = useState(false);

  const createPayment = useCallback(
    async (payload: CreateVnPayPaymentRequest) => {
      setLoading(true);
      try {
        const res = await httpClient.post<CreateVnPayPaymentResponse | CreateVnPayPaymentError>(
          "/payments/vnpay/create",
          payload
        );

        const data = res.data;

        // ✅ Dùng type guard để TS hiểu rõ
        if (isVnPaySuccess(data)) {
          return data.data; // đây là url, txnRef, payment_id
        } else {
          showErrorToast(data.message);
          return null;
        }
      } catch (err: any) {
        showErrorToast(err?.message || "Payment error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, createPayment };
};
