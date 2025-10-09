import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Battery,
    Search,
    Download,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    RotateCcw,
    Zap,
    TrendingUp,
    Calendar,
    MapPin,
    User,
    Grid,
    List
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';

// Types
interface BatteryReturn {
    id: string;
    batteryId: string;
    serialNumber: string;
    model: string;
    manufacturer: string;
    driverId: string;
    driverName: string;
    vehicleId: string;
    vehicleModel: string;
    stationId: string;
    stationName: string;
    returnDate: Date;
    returnReason: 'NORMAL' | 'DAMAGED' | 'LOW_CHARGE' | 'MAINTENANCE' | 'OTHER';
    batteryStatus: 'GOOD' | 'DAMAGED' | 'LOW_CHARGE' | 'MAINTENANCE_REQUIRED';
    chargeLevel: number;
    healthLevel: number;
    damageDescription?: string;
    estimatedRepairCost?: number;
    status: 'PENDING' | 'INSPECTED' | 'APPROVED' | 'REJECTED' | 'REPAIRED';
    inspectorId?: string;
    inspectorName?: string;
    inspectionDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ReturnStats {
    totalReturns: number;
    pendingReturns: number;
    inspectedReturns: number;
    approvedReturns: number;
    rejectedReturns: number;
    averageInspectionTime: number;
    totalRepairCost: number;
}

// Mock data
const mockReturns: BatteryReturn[] = [
    {
        id: '1',
        batteryId: 'battery-1',
        serialNumber: 'BAT-001-2024',
        model: 'VF-BAT-100',
        manufacturer: 'VinFast',
        driverId: 'driver-1',
        driverName: 'Nguyễn Văn A',
        vehicleId: 'vehicle-1',
        vehicleModel: 'VinFast VF8',
        stationId: 'station-1',
        stationName: 'Trạm Hà Nội',
        returnDate: new Date('2024-01-15'),
        returnReason: 'NORMAL',
        batteryStatus: 'GOOD',
        chargeLevel: 85,
        healthLevel: 92,
        status: 'PENDING',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        id: '2',
        batteryId: 'battery-2',
        serialNumber: 'BAT-002-2024',
        model: 'TESLA-BAT-85',
        manufacturer: 'Tesla',
        driverId: 'driver-2',
        driverName: 'Trần Thị B',
        vehicleId: 'vehicle-2',
        vehicleModel: 'Tesla Model 3',
        stationId: 'station-2',
        stationName: 'Trạm TP.HCM',
        returnDate: new Date('2024-01-14'),
        returnReason: 'DAMAGED',
        batteryStatus: 'DAMAGED',
        chargeLevel: 45,
        healthLevel: 65,
        damageDescription: 'Vỏ pin bị nứt, cần thay thế',
        estimatedRepairCost: 2500000,
        status: 'INSPECTED',
        inspectorId: 'inspector-1',
        inspectorName: 'Lê Văn C',
        inspectionDate: new Date('2024-01-14'),
        notes: 'Pin cần sửa chữa trước khi đưa vào sử dụng',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
    },
    {
        id: '3',
        batteryId: 'battery-3',
        serialNumber: 'BAT-003-2024',
        model: 'BYD-BAT-120',
        manufacturer: 'BYD',
        driverId: 'driver-3',
        driverName: 'Phạm Văn D',
        vehicleId: 'vehicle-3',
        vehicleModel: 'BYD Atto 3',
        stationId: 'station-1',
        stationName: 'Trạm Hà Nội',
        returnDate: new Date('2024-01-13'),
        returnReason: 'LOW_CHARGE',
        batteryStatus: 'LOW_CHARGE',
        chargeLevel: 15,
        healthLevel: 88,
        status: 'APPROVED',
        inspectorId: 'inspector-2',
        inspectorName: 'Hoàng Thị E',
        inspectionDate: new Date('2024-01-13'),
        notes: 'Pin chỉ cần sạc lại, không có vấn đề gì',
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13')
    },
    {
        id: '4',
        batteryId: 'battery-4',
        serialNumber: 'BAT-004-2024',
        model: 'VF-BAT-100',
        manufacturer: 'VinFast',
        driverId: 'driver-4',
        driverName: 'Vũ Văn F',
        vehicleId: 'vehicle-4',
        vehicleModel: 'VinFast VF9',
        stationId: 'station-3',
        stationName: 'Trạm Đà Nẵng',
        returnDate: new Date('2024-01-12'),
        returnReason: 'MAINTENANCE',
        batteryStatus: 'MAINTENANCE_REQUIRED',
        chargeLevel: 70,
        healthLevel: 45,
        status: 'REJECTED',
        inspectorId: 'inspector-1',
        inspectorName: 'Lê Văn C',
        inspectionDate: new Date('2024-01-12'),
        notes: 'Pin cần bảo trì định kỳ, không thể sử dụng ngay',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
    }
];

const mockStats: ReturnStats = {
    totalReturns: 24,
    pendingReturns: 8,
    inspectedReturns: 12,
    approvedReturns: 3,
    rejectedReturns: 1,
    averageInspectionTime: 2.5,
    totalRepairCost: 7500000
};

export const BatteryStatusReturnPage: React.FC = () => {
    const [returns, setReturns] = useState<BatteryReturn[]>(mockReturns);
    const [stats] = useState<ReturnStats>(mockStats);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredReturns = returns.filter(returnItem => {
        const matchesSearch =
            returnItem.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            returnItem.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            returnItem.stationName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'INSPECTED':
                return <Eye className="h-4 w-4 text-blue-500" />;
            case 'APPROVED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'REPAIRED':
                return <RotateCcw className="h-4 w-4 text-purple-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ kiểm tra';
            case 'INSPECTED':
                return 'Đã kiểm tra';
            case 'APPROVED':
                return 'Đã duyệt';
            case 'REJECTED':
                return 'Từ chối';
            case 'REPAIRED':
                return 'Đã sửa chữa';
            default:
                return 'Không xác định';
        }
    };

    const getBatteryStatusColor = (status: string) => {
        switch (status) {
            case 'GOOD':
                return 'text-green-600 bg-green-100';
            case 'DAMAGED':
                return 'text-red-600 bg-red-100';
            case 'LOW_CHARGE':
                return 'text-yellow-600 bg-yellow-100';
            case 'MAINTENANCE_REQUIRED':
                return 'text-orange-600 bg-orange-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getBatteryStatusText = (status: string) => {
        switch (status) {
            case 'GOOD':
                return 'Tốt';
            case 'DAMAGED':
                return 'Hư hỏng';
            case 'LOW_CHARGE':
                return 'Pin yếu';
            case 'MAINTENANCE_REQUIRED':
                return 'Cần bảo trì';
            default:
                return 'Không xác định';
        }
    };

    const handleInspect = (returnId: string) => {
        setReturns(prev => prev.map(returnItem =>
            returnItem.id === returnId
                ? { ...returnItem, status: 'INSPECTED' as const, inspectionDate: new Date() }
                : returnItem
        ));
    };

    const handleApprove = (returnId: string) => {
        setReturns(prev => prev.map(returnItem =>
            returnItem.id === returnId
                ? { ...returnItem, status: 'APPROVED' as const }
                : returnItem
        ));
    };

    const handleReject = (returnId: string) => {
        setReturns(prev => prev.map(returnItem =>
            returnItem.id === returnId
                ? { ...returnItem, status: 'REJECTED' as const }
                : returnItem
        ));
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Quản lý trả pin"
                description="Theo dõi và quản lý việc trả pin của tài xế"
                showBackButton={false}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng số lần trả"
                    value={stats.totalReturns.toLocaleString()}
                    icon={Battery}
                    gradientFrom="from-blue-500"
                    gradientTo="to-blue-600"
                    textColor="text-white"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Chờ kiểm tra"
                    value={stats.pendingReturns.toLocaleString()}
                    icon={Clock}
                    gradientFrom="from-yellow-500"
                    gradientTo="to-yellow-600"
                    textColor="text-white"
                    iconBg="bg-yellow-500"
                />
                <StatsCard
                    title="Đã kiểm tra"
                    value={stats.inspectedReturns.toLocaleString()}
                    icon={Eye}
                    gradientFrom="from-green-500"
                    gradientTo="to-green-600"
                    textColor="text-white"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Chi phí sửa chữa"
                    value={`${(stats.totalRepairCost / 1000000).toFixed(1)}M VNĐ`}
                    icon={TrendingUp}
                    gradientFrom="from-purple-500"
                    gradientTo="to-purple-600"
                    textColor="text-white"
                    iconBg="bg-purple-500"
                />
            </div>

            {/* Filters and Actions */}
            <Card className="shadow-lg border-2 border-slate-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => console.log('Export Excel')}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Xuất Excel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => console.log('Refresh')}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Số serial, tài xế, trạm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ kiểm tra</option>
                                <option value="INSPECTED">Đã kiểm tra</option>
                                <option value="APPROVED">Đã duyệt</option>
                                <option value="REJECTED">Từ chối</option>
                                <option value="REPAIRED">Đã sửa chữa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Lý do trả</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả lý do</option>
                                <option value="NORMAL">Bình thường</option>
                                <option value="DAMAGED">Hư hỏng</option>
                                <option value="LOW_CHARGE">Pin yếu</option>
                                <option value="MAINTENANCE">Cần bảo trì</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Returns List */}
            <div className="space-y-4">
                {filteredReturns.map((returnItem) => (
                    <Card key={returnItem.id} className="hover:shadow-lg transition-all duration-200 border-2 border-slate-200 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <Battery className="h-6 w-6 text-blue-600" />
                                            <span className="font-semibold text-xl">{returnItem.serialNumber}</span>
                                            <span className="text-base text-gray-500">({returnItem.model})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(returnItem.status)}
                                            <span className="font-semibold text-lg">{getStatusText(returnItem.status)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-base">
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <span className="font-semibold">Tài xế:</span>
                                            <span className="font-medium">{returnItem.driverName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <span className="font-semibold">Trạm:</span>
                                            <span className="font-medium">{returnItem.stationName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <span className="font-semibold">Ngày trả:</span>
                                            <span className="font-medium">{returnItem.returnDate.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-gray-400" />
                                            <span className="font-semibold">Pin:</span>
                                            <span className="font-medium">{returnItem.chargeLevel}%</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <span className={`px-3 py-2 rounded-full text-sm font-semibold ${getBatteryStatusColor(returnItem.batteryStatus)}`}>
                                            {getBatteryStatusText(returnItem.batteryStatus)}
                                        </span>
                                        {returnItem.estimatedRepairCost && (
                                            <span className="px-3 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                                                Chi phí: {returnItem.estimatedRepairCost.toLocaleString('vi-VN')} VNĐ
                                            </span>
                                        )}
                                    </div>

                                    {returnItem.damageDescription && (
                                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <p className="text-base font-semibold text-yellow-800">Mô tả hư hỏng:</p>
                                                    <p className="text-base text-yellow-700">{returnItem.damageDescription}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {returnItem.notes && (
                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                            <p className="text-base font-semibold text-blue-800">Ghi chú:</p>
                                            <p className="text-base text-blue-700">{returnItem.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    {returnItem.status === 'PENDING' && (
                                        <div className="flex gap-3">
                                            <Button
                                                size="default"
                                                onClick={() => handleInspect(returnItem.id)}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base px-6 py-2"
                                            >
                                                <Eye className="h-5 w-5 mr-2" />
                                                Kiểm tra
                                            </Button>
                                        </div>
                                    )}

                                    {returnItem.status === 'INSPECTED' && (
                                        <div className="flex gap-3">
                                            <Button
                                                size="default"
                                                onClick={() => handleApprove(returnItem.id)}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-base px-6 py-2"
                                            >
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Duyệt
                                            </Button>
                                            <Button
                                                size="default"
                                                variant="outline"
                                                onClick={() => handleReject(returnItem.id)}
                                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-base px-6 py-2"
                                            >
                                                <XCircle className="h-5 w-5 mr-2" />
                                                Từ chối
                                            </Button>
                                        </div>
                                    )}

                                    {returnItem.inspectorName && (
                                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                            <p className="font-semibold">Kiểm tra bởi: {returnItem.inspectorName}</p>
                                            <p className="font-medium">Ngày: {returnItem.inspectionDate?.toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredReturns.length === 0 && (
                <Card className="shadow-lg border-2 border-slate-200 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <Battery className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">Không tìm thấy dữ liệu</h3>
                        <p className="text-lg text-slate-500">Không có lần trả pin nào phù hợp với bộ lọc hiện tại.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
