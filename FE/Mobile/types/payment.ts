export interface VnPayResponse {
    success: boolean;
    data?: {
        url: string;
        txnRef: string;
        paymentId: string;
    };
    message?: string;
}

export interface CreateVnPayPaymentParams {
    amount: number;
    bookingId: string;
    orderInfo?: string;
    returnUrl: string;
}