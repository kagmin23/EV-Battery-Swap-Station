import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import {
    CreditCard,
    MapPin,
    User,
    Battery,
    Car,
    Calendar,
    DollarSign,
    FileText
} from 'lucide-react';
import type { TransactionDetailModalProps } from '../types/transaction';

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction
}) => {
    // Show loading state if transaction is not yet loaded
    if (!transaction) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-green-100 rounded-xl mr-3">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            Transaction Details
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-12">
                        <PageLoadingSpinner text="Loading transaction details..." />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    const getTransactionType = () => {
        if (transaction.batteryGiven && transaction.batteryReturned) {
            return { label: 'Battery Swap', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
        } else if (transaction.batteryGiven) {
            return { label: 'Pick Up', variant: 'success' as const, color: 'bg-green-100 text-green-800' };
        } else if (transaction.batteryReturned) {
            return { label: 'Return', variant: 'warning' as const, color: 'bg-orange-100 text-orange-800' };
        }
        return { label: 'Battery Exchange', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
    };

    const getStatusBadge = () => {
        switch (transaction.status) {
            case 'completed':
                return { label: 'Completed', color: 'bg-green-100 text-green-800' };
            case 'pending':
                return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
            case 'cancelled':
                return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
            default:
                return { label: 'Completed', color: 'bg-green-100 text-green-800' };
        }
    };

    const transactionType = getTransactionType();
    const statusBadge = getStatusBadge();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center text-2xl font-bold text-slate-800">
                        <div className="p-2 bg-green-100 rounded-xl mr-3">
                            <CreditCard className="h-6 w-6 text-green-600" />
                        </div>
                        Transaction Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Transaction Header */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-800 mb-1">
                                    {transaction.userName || 'User'} exchange battery
                                </h3>
                                <p className="text-base text-slate-500 font-mono">
                                    {transaction.transactionId}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={transactionType.color}>
                                    {transactionType.label}
                                </Badge>
                                <Badge className={statusBadge.color}>
                                    {statusBadge.label}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-slate-500" />
                                <span className="font-medium text-slate-800">{formatDateTime(transaction.transactionTime)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* User Information */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <User className="h-5 w-5 mr-2 text-blue-500" />
                                User Information
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-slate-600">Name</p>
                                    <p className="font-medium text-slate-800">{transaction.userName || 'User'}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-slate-600 mr-2">ID:</span>
                                    <span className="font-medium text-slate-800 font-mono">{transaction.userId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Station Information */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-green-500" />
                                Station Information
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-slate-600">Station Name</p>
                                    <p className="font-medium text-slate-800">{transaction.stationName || 'Station'}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-slate-600 mr-2">ID:</span>
                                    <span className="font-medium text-slate-800 font-mono">{transaction.stationId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Battery Information */}
                    {(transaction.batteryId || transaction.batterySerial || transaction.batteryModel) && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <Battery className="h-5 w-5 mr-2 text-purple-500" />
                                Battery Information
                            </h4>
                            <div className="space-y-2">
                                {transaction.batterySerial && (
                                    <div>
                                        <p className="text-sm text-slate-600">Serial</p>
                                        <p className="font-medium text-slate-800 font-mono">{transaction.batterySerial}</p>
                                    </div>
                                )}
                                {transaction.batteryModel && (
                                    <div>
                                        <p className="text-sm text-slate-600">Model</p>
                                        <p className="font-medium text-slate-800">{transaction.batteryModel}</p>
                                    </div>
                                )}
                                {transaction.batteryId && (
                                    <div className="flex items-center">
                                        <span className="text-sm text-slate-600 mr-2">ID:</span>
                                        <span className="font-medium text-slate-800 font-mono">{transaction.batteryId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vehicle Information */}
                    {transaction.vehicleId && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <Car className="h-5 w-5 mr-2 text-indigo-500" />
                                Vehicle Information
                            </h4>
                            <div className="space-y-2">
                                {transaction.vehicleName && (
                                    <div>
                                        <p className="text-sm text-slate-600">Vehicle Name</p>
                                        <p className="font-medium text-slate-800">{transaction.vehicleName}</p>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <span className="text-sm text-slate-600 mr-2">ID:</span>
                                    <span className="font-medium text-slate-800 font-mono">{transaction.vehicleId}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Information */}
                    {transaction.bookingId && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-cyan-500" />
                                Booking Information
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <span className="text-sm text-slate-600 mr-2">Booking ID:</span>
                                    <span className="font-medium text-slate-800 font-mono">{transaction.bookingId}</span>
                                </div>
                                {transaction.bookingStatus && (
                                    <div>
                                        <p className="text-sm text-slate-600">Status</p>
                                        <p className="font-medium text-slate-800">{transaction.bookingStatus}</p>
                                    </div>
                                )}
                                {transaction.bookingDescription && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <p className="text-sm text-slate-600 mb-1">Description</p>
                                        <p className="font-medium text-slate-800">{transaction.bookingDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cost Information */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                            Transaction Cost
                        </h4>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(transaction.cost)}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                    <Button onClick={onClose} className="px-6">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
