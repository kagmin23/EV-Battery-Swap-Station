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
    paymentId: string;
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

        const data = (res as any).data;

        // check if response has success field
        if (data && typeof data === 'object') {
          if (data.success === true && data.data) {
            // response is in format { success: true, data: { url, txnRef, paymentId } }
            return data.data;
          } else if (data.url && data.txnRef) {
            // response is directly in format { url, txnRef, payment_id }
            return data;
          } else if (data.success === false) {
            // error response
            showErrorToast(data.message);
            return null;
          }
        }

        showErrorToast('Invalid payment response');
        return null;
      } catch (err: any) {
        showErrorToast(err?.response?.data?.message || err?.message || 'Payment error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  return { loading, createPayment };
};
