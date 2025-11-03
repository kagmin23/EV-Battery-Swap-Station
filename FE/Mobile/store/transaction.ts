import httpClient from '@/services/rootAPI';
import { toCamelCase } from '@/utils/caseConverter';
import { signify } from 'react-signify';

export interface Transaction {
    transactionId: string;
    userId: string;
    stationId: string;
    vehicleId: string;
    batteryId: string;
    bookingId: string;
    transactionTime: string;
    cost: number;
}

interface TransactionResponse {
    success: boolean;
    data: Transaction[];
}

// Transaction state
export const sTransactions = signify<Transaction[]>([]);

export const useTransactions = () => sTransactions.use();


export const getMyTransaction = async (): Promise<Transaction[]> => {
    try {
        const res = await httpClient.get<TransactionResponse>('/transactions/me');

        if (res.success && Array.isArray(res.data)) {
            const transactions = toCamelCase(res.data) as Transaction[];
            sTransactions.set(transactions);
            return transactions;
        } else {
            console.warn('Invalid API response format:', res);
            sTransactions.set([]);
            return [];
        }
    } catch (error: any) {
        console.error('API Error details:', {
            message: error.message,
            success: error.success,
            errors: error.errors,
            isApiError: error.success !== undefined
        });
        console.error('Full error object:', error);
        sTransactions.set([]);
        return [];
    }
};


export const getTransactionById = (
    transactions: Transaction[] | undefined,
    transactionId: string
): Transaction | null => {
    const transaction = transactions?.find((t: Transaction) => t.transactionId === transactionId);
    return transaction || null;
};


export const getTransactionsByStation = (
    transactions: Transaction[] | undefined,
    stationId: string
): Transaction[] => {
    if (!transactions) return [];
    return transactions.filter((t: Transaction) => t.stationId === stationId);
};


export const getTransactionsByVehicle = (
    transactions: Transaction[] | undefined,
    vehicleId: string
): Transaction[] => {
    if (!transactions) return [];
    return transactions.filter((t: Transaction) => t.vehicleId === vehicleId);
};


export const calculateTotalCost = (transactions: Transaction[]): number => {
    return transactions.reduce((sum, t) => sum + (t.cost || 0), 0);
};
