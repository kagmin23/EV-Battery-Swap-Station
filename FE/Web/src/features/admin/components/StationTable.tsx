import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { MapPin, ExternalLink, Users } from 'lucide-react';
import type { Station, StationStatus } from '../types/station';

interface StationTableProps {
    stations: Station[];
    onSelect: (station: Station) => void;
    onEdit: (station: Station) => void;
    onSuspend: (station: Station) => void;
    onViewDetails?: (station: Station) => void;
    onViewStaff?: (station: Station) => void;
    suspendingStationId?: string | null;
    savingStationId?: string | null;
}

export const StationTable: React.FC<StationTableProps> = ({
    stations,
    onSelect,
    onEdit,
    onSuspend,
    onViewDetails,
    onViewStaff,
    suspendingStationId,
    savingStationId
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

    const formatCapacity = (capacity: number) => {
        return capacity.toLocaleString('vi-VN');
    };

    const formatSoh = (soh: number) => {
        return `${soh}%`;
    };

    return (
        <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Trạm</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Địa chỉ</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Thành phố</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Sức chứa</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Pin có sẵn</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">SOH TB</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {stations.map((station) => (
                    <tr key={station.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-800">{station.name}</div>
                                    <div className="text-sm text-slate-500">{station.district}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 max-w-xs truncate" title={station.address}>
                            {station.address}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800">{station.city}</td>
                        <td className="px-6 py-4">
                            {getStatusBadge(station.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800">{formatCapacity(station.capacity)}</td>
                        <td className="px-6 py-4 text-sm text-slate-800">{station.availableBatteries}</td>
                        <td className="px-6 py-4 text-sm text-slate-800">{formatSoh(station.sohAvg)}</td>
                        <td className="px-6 py-4">
                            <div className="flex space-x-2">
                                {onViewDetails && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewDetails(station)}
                                        disabled={savingStationId === station.id || suspendingStationId === station.id}
                                        className="flex-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Xem chi tiết
                                    </Button>
                                )}
                                {onViewStaff && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewStaff(station)}
                                        disabled={savingStationId === station.id || suspendingStationId === station.id}
                                        className="flex-1 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Users className="h-4 w-4 mr-1" />
                                        Nhân viên
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(station)}
                                    disabled={savingStationId === station.id || suspendingStationId === station.id}
                                    className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingStationId === station.id ? (
                                        <ButtonLoadingSpinner size="sm" variant="default" text="Đang lưu..." />
                                    ) : (
                                        'Sửa'
                                    )}
                                </Button>
                                {station.status !== 'INACTIVE' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSuspend(station)}
                                        disabled={suspendingStationId === station.id || savingStationId === station.id}
                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                    >
                                        {suspendingStationId === station.id ? (
                                            <ButtonLoadingSpinner size="sm" variant="default" text="Đang xử lý..." />
                                        ) : (
                                            'Tạm dừng'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
