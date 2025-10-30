import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    Eye
} from 'lucide-react';
import type { TransactionCardProps } from '../types/transaction';

export const TransactionCard: React.FC<TransactionCardProps> = ({
    transaction,
    onViewDetails
}) => {
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
            minute: '2-digit'
        }).format(date);
    };

    const getTransactionType = () => {
        if (transaction.batteryGiven && transaction.batteryReturned) {
            return { label: 'Đổi pin', variant: 'default' as const };
        } else if (transaction.batteryGiven) {
            return { label: 'Lấy pin', variant: 'success' as const };
        } else if (transaction.batteryReturned) {
            return { label: 'Trả pin', variant: 'warning' as const };
        }
        return { label: 'Không xác định', variant: 'secondary' as const };
    };

    const transactionType = getTransactionType();

    return (
        <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                <CreditCard className="h-7 w-7" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-lg">
                                {transaction.transactionId}
                            </h3>
                            <p className="text-sm text-slate-500 truncate">
                                {transaction.userName || 'Unknown User'}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                                <Badge variant={transactionType.variant}>
                                    {transactionType.label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate font-medium">
                            {transaction.stationName || 'Trạm không xác định'}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="truncate font-medium">
                            {formatDateTime(transaction.transactionTime)}
                        </span>
                    </div>

                    {transaction.batteryGiven && (
                        <div className="flex items-center text-sm text-slate-600 bg-green-50 p-2 rounded-lg">
                            <Battery className="h-4 w-4 mr-2 text-green-500" />
                            <span className="truncate font-medium">
                                Pin lấy: {transaction.batteryGiven}
                            </span>
                        </div>
                    )}

                    {transaction.batteryReturned && (
                        <div className="flex items-center text-sm text-slate-600 bg-orange-50 p-2 rounded-lg">
                            <Battery className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="truncate font-medium">
                                Pin trả: {transaction.batteryReturned}
                            </span>
                        </div>
                    )}

                    {transaction.vehicleName && (
                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Car className="h-4 w-4 mr-2 text-indigo-500" />
                            <span className="truncate font-medium">
                                {transaction.vehicleName}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                        <span className="font-medium">Chi phí:</span>
                        <span className="font-semibold text-green-600">
                            {formatCurrency(transaction.cost)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(transaction);
                        }}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
