import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { MapPin, Battery, Users, ExternalLink, MoreVertical } from 'lucide-react';
import type { Station, StationStatus } from '../types/station';

interface StationCardProps {
    station: Station;
    onSelect: (station: Station) => void;
    onEdit: (station: Station) => void;
    onSuspend: (station: Station) => void;
    onViewDetails?: (station: Station) => void;
    isSuspending?: boolean;
    isSaving?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({
    station,
    onSelect,
    onEdit,
    onSuspend,
    onViewDetails,
    isSuspending = false,
    isSaving = false
}) => {
    const getStatusBadge = (status: StationStatus) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="success">Hoạt động</Badge>;
            case 'MAINTENANCE':
                return <Badge variant="warning">Bảo trì</Badge>;
            case 'INACTIVE':
                return <Badge variant="destructive">Ngừng hoạt động</Badge>;
            default:
                return <Badge variant="secondary">Không xác định</Badge>;
        }
    };

    const getStatusColor = (status: StationStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500';
            case 'MAINTENANCE':
                return 'bg-orange-500';
            case 'INACTIVE':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const formatCapacity = (capacity: number) => {
        return capacity.toLocaleString('vi-VN');
    };

    const formatSoh = (soh: number) => {
        return `${soh}%`;
    };

    return (
        <Card
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
            onClick={() => onSelect(station)}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                <MapPin className="h-7 w-7" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(station.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-lg">{station.name}</h3>
                            <p className="text-sm text-slate-500 truncate">{station.address}</p>
                            <div className="flex items-center space-x-2 mt-2">
                                {getStatusBadge(station.status)}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle menu actions
                        }}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate font-medium">{station.city}, {station.district}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Battery className="h-4 w-4 mr-2 text-green-500" />
                        <span>{formatCapacity(station.capacity)} pin</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                        <span className="font-medium">SOH trung bình:</span>
                        <span className="font-semibold">{formatSoh(station.sohAvg)}</span>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                    {onViewDetails && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(station);
                            }}
                            disabled={isSaving || isSuspending}
                            className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                        >
                            Xem chi tiết
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(station);
                        }}
                        disabled={isSaving || isSuspending}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                    >
                        {isSaving ? (
                            <ButtonLoadingSpinner size="sm" variant="default" text="Đang lưu..." />
                        ) : (
                            'Chỉnh sửa'
                        )}
                    </Button>
                    {station.status !== 'INACTIVE' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSuspend(station);
                            }}
                            disabled={isSuspending || isSaving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        >
                            {isSuspending ? (
                                <ButtonLoadingSpinner size="sm" variant="default" text="Đang xử lý..." />
                            ) : (
                                'Tạm dừng'
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
