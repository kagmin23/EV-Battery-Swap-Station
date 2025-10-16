import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin,
    Calendar,
    Clock,
    Battery,
    Activity,
    X,
    ExternalLink
} from 'lucide-react';
import type { Station, StationStatus } from '../types/station';

interface StationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    station: Station | null;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
    isOpen,
    onClose,
    station
}) => {
    if (!station) return null;

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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCapacity = (capacity: number) => {
        return capacity.toLocaleString('vi-VN');
    };

    const formatSoh = (soh: number) => {
        return `${soh}%`;
    };

    const getUtilizationRate = () => {
        if (station.capacity === 0) return 0;
        return Math.round((station.availableBatteries / station.capacity) * 100);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                            Chi tiết trạm đổi pin
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
                    {/* Header Info */}
                    <Card className="shadow-sm border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        <MapPin className="h-10 w-10" />
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${getStatusColor(station.status)}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{station.name}</h2>
                                            <p className="text-lg text-slate-600 mb-3">{station.address}</p>
                                            <p className="text-sm text-slate-500 mb-3">{station.city}, {station.district}</p>
                                            <div className="flex items-center space-x-3">
                                                {getStatusBadge(station.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Station Information */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                                Thông tin trạm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Địa chỉ</p>
                                        <p className="font-medium text-slate-800">{station.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Thành phố</p>
                                        <p className="font-medium text-slate-800">{station.city}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Quận/Huyện</p>
                                        <p className="font-medium text-slate-800">{station.district}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Activity className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Trạng thái</p>
                                        <p className="font-medium text-slate-800">
                                            {station.status === 'ACTIVE' ? 'Hoạt động' :
                                                station.status === 'MAINTENANCE' ? 'Bảo trì' : 'Ngừng hoạt động'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Battery Information */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <Battery className="h-5 w-5 mr-2 text-green-600" />
                                Thông tin pin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Battery className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Sức chứa</p>
                                        <p className="font-medium text-slate-800">{formatCapacity(station.capacity)} pin</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Battery className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Pin có sẵn</p>
                                        <p className="font-medium text-slate-800">{station.availableBatteries} pin</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Activity className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">SOH trung bình</p>
                                        <p className="font-medium text-slate-800">{formatSoh(station.sohAvg)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Utilization Rate */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Tỷ lệ sử dụng</span>
                                    <span className="text-lg font-bold text-blue-600">{getUtilizationRate()}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getUtilizationRate()}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Information */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                                Thông tin vị trí
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Vĩ độ</p>
                                        <p className="font-medium text-slate-800">{station.coordinates.lat}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Kinh độ</p>
                                        <p className="font-medium text-slate-800">{station.coordinates.lng}</p>
                                    </div>
                                </div>
                            </div>

                            {station.mapUrl && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(station.mapUrl, '_blank')}
                                        className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Xem trên Google Maps
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                                Thông tin thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Ngày tạo</p>
                                        <p className="font-medium text-slate-800">{formatDate(station.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Cập nhật lần cuối</p>
                                        <p className="font-medium text-slate-800">{formatDate(station.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};
