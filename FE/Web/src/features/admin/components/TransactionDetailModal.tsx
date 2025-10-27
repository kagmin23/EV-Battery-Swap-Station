import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CreditCard,
    MapPin,
    User,
    Battery,
    Car,
    Calendar,
    DollarSign,
    FileText,
    X
} from 'lucide-react';
import type { TransactionDetailModalProps } from '../types/transaction';

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction
}) => {
    if (!transaction) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
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
            return { label: 'Đổi pin', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
        } else if (transaction.batteryGiven) {
            return { label: 'Lấy pin', variant: 'success' as const, color: 'bg-green-100 text-green-800' };
        } else if (transaction.batteryReturned) {
            return { label: 'Trả pin', variant: 'warning' as const, color: 'bg-orange-100 text-orange-800' };
        }
        return { label: 'Không xác định', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
    };

    const transactionType = getTransactionType();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-green-100 rounded-xl mr-3">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            Chi tiết giao dịch
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Transaction Header */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-slate-800">
                                {transaction.transactionId}
                            </h3>
                            <Badge className={transactionType.color}>
                                {transactionType.label}
                            </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                            <div className="flex items-center mb-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{formatDateTime(transaction.transactionTime)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* User Information */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <User className="h-5 w-5 mr-2 text-blue-500" />
                                Thông tin người dùng
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Tên:</span>
                                    <span className="ml-2 font-medium">{transaction.userName || 'Không xác định'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">ID:</span>
                                    <span className="ml-2 font-mono text-xs">{transaction.userId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Station Information */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-green-500" />
                                Thông tin trạm
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Tên trạm:</span>
                                    <span className="ml-2 font-medium">{transaction.stationName || 'Không xác định'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">ID:</span>
                                    <span className="ml-2 font-mono text-xs">{transaction.stationId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Battery Information */}
                    {(transaction.batteryGiven || transaction.batteryReturned) && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <Battery className="h-5 w-5 mr-2 text-purple-500" />
                                Thông tin pin
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {transaction.batteryGiven && (
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <div className="text-sm font-medium text-green-800 mb-1">Pin lấy</div>
                                        <div className="font-mono text-sm">{transaction.batteryGiven}</div>
                                    </div>
                                )}
                                {transaction.batteryReturned && (
                                    <div className="bg-orange-50 rounded-lg p-3">
                                        <div className="text-sm font-medium text-orange-800 mb-1">Pin trả</div>
                                        <div className="font-mono text-sm">{transaction.batteryReturned}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vehicle Information */}
                    {transaction.vehicleName && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <Car className="h-5 w-5 mr-2 text-indigo-500" />
                                Thông tin xe
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Tên xe:</span>
                                    <span className="ml-2 font-medium">{transaction.vehicleName}</span>
                                </div>
                                {transaction.vehicleId && (
                                    <div>
                                        <span className="text-slate-500">ID:</span>
                                        <span className="ml-2 font-mono text-xs">{transaction.vehicleId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Booking Information */}
                    {transaction.bookingId && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-cyan-500" />
                                Thông tin đặt chỗ
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-slate-500">ID đặt chỗ:</span>
                                    <span className="ml-2 font-mono text-xs">{transaction.bookingId}</span>
                                </div>
                                {transaction.bookingStatus && (
                                    <div>
                                        <span className="text-slate-500">Trạng thái:</span>
                                        <span className="ml-2 font-medium">{transaction.bookingStatus}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cost Information */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                            Chi phí giao dịch
                        </h4>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(transaction.cost)}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                    <Button onClick={onClose} className="px-6">
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
