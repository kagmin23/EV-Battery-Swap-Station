export interface Transaction {
    id: string;
    transactionId: string;
    userId: string;
    stationId: string;
    batteryGiven: string | null;
    batteryReturned: string | null;
    vehicleId: string | null;
    batteryId: string | null;
    bookingId: string | null;
    transactionTime: Date;
    cost: number;
    // Additional fields for display
    userName?: string;
    stationName?: string;
    vehicleName?: string;
    batterySerial?: string;
    bookingStatus?: string;
}

export interface TransactionFilters {
    search: string;
    stationId: string;
    date: string;
    minCost: number;
    maxCost: number;
    limit: string;
}

export interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export interface TransactionCardProps {
    transaction: Transaction;
    onViewDetails: (transaction: Transaction) => void;
}
