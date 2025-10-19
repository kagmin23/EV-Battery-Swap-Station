import React, { useState, useEffect } from 'react';
import { AlertTriangle, Battery as BatteryIcon, Eye, AlertCircle, TrendingUp, Search, Filter, Grid, List, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService, type Battery as ApiBattery } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import type { BatteryStatus } from '../types/battery';

interface FaultyBatteryCardProps {
    battery: ApiBattery;
    onClick: () => void;
}

const FaultyBatteryCard: React.FC<FaultyBatteryCardProps> = ({ battery, onClick }) => {
    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'charging':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'full':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-use':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'idle':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'Lỗi';
            case 'charging':
                return 'Đang sạc';
            case 'full':
                return 'Đầy';
            case 'in-use':
                return 'Đang sử dụng';
            case 'idle':
                return 'Nhàn rỗi';
            default:
                return 'Không xác định';
        }
    };

    const getSohColor = (soh: number) => {
        if (soh >= 80) return 'text-green-600';
        if (soh >= 60) return 'text-yellow-600';
        if (soh >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <Card
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                <BatteryIcon className="h-7 w-7" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-lg">{battery.serial}</h3>
                            <p className="text-sm text-slate-500 truncate">{battery.model || 'N/A'}</p>
                            <div className="flex items-center space-x-2 mt-2">
                                <Badge className={`${getStatusColor(battery.status)} border`}>
                                    {getStatusText(battery.status)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate font-medium">{battery.station?.stationName || 'Chưa gán'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <BatteryIcon className="h-4 w-4 mr-2 text-green-500" />
                        <span>{battery.capacity_kWh || 'N/A'} kWh</span>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                        <span className="font-medium">SOH:</span> <span className={`font-semibold ${getSohColor(battery.soh)}`}>{battery.soh}%</span>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Điện áp:</span>
                        <span className="font-medium">{battery.voltage || 'N/A'}V</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Nhà SX:</span>
                        <span className="font-medium">{battery.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-red-100">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">
                                Pin cần được kiểm tra và sửa chữa
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const FaultyBatteryDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    battery: ApiBattery | null;
}> = ({ isOpen, onClose, battery }) => {
    if (!isOpen || !battery) return null;

    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'charging':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'full':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-use':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'idle':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'Lỗi';
            case 'charging':
                return 'Đang sạc';
            case 'full':
                return 'Đầy';
            case 'in-use':
                return 'Đang sử dụng';
            case 'idle':
                return 'Nhàn rỗi';
            default:
                return 'Không xác định';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <BatteryIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    Chi tiết pin lỗi
                                </h2>
                                <p className="text-slate-500">
                                    Pin #{battery.serial}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-10 w-10 rounded-full hover:bg-slate-100"
                        >
                            ×
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Thông tin cơ bản */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Thông tin cơ bản
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Serial Pin</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.serial}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Trạm</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.station?.stationName || 'Chưa gán'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                                    <Badge className={`${getStatusColor(battery.status)} border`}>
                                        {getStatusText(battery.status)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">SOH</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.soh}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Dung lượng</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.capacity_kWh || 'N/A'} kWh
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Điện áp</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.voltage || 'N/A'}V
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Model</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.model || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Nhà sản xuất</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.manufacturer || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin lỗi */}
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center space-x-2 mb-4">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h3 className="text-lg font-semibold text-red-800">
                                    Thông tin lỗi
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-red-600 mb-1">Loại lỗi</p>
                                    <p className="font-medium text-red-800">
                                        Pin bị lỗi hệ thống
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-600 mb-1">Mô tả lỗi</p>
                                    <p className="text-red-700">
                                        Pin có SOH thấp ({battery.soh}%) và cần được kiểm tra kỹ thuật.
                                        Có thể do quá trình sạc/xả không đúng cách hoặc lỗi phần cứng.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-600 mb-1">Khuyến nghị</p>
                                    <p className="text-red-700">
                                        • Kiểm tra hệ thống sạc<br />
                                        • Thay thế pin nếu cần thiết<br />
                                        • Báo cáo cho kỹ thuật viên
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin thời gian */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Thông tin thời gian
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Ngày tạo</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(battery.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Cập nhật cuối</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(battery.updatedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-6 py-2"
                        >
                            Đóng
                        </Button>
                        <Button
                            className="px-6 py-2 bg-red-600 hover:bg-red-700"
                        >
                            Báo cáo sửa chữa
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaultyBatteryPage: React.FC = () => {
    const [batteries, setBatteries] = useState<ApiBattery[]>([]);
    const [filteredBatteries, setFilteredBatteries] = useState<ApiBattery[]>([]);
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBattery, setSelectedBattery] = useState<ApiBattery | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BatteryStatus | 'ALL'>('ALL');
    const [selectedStation, setSelectedStation] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Load stations data
    const loadStations = async () => {
        try {
            const apiStations = await StationService.getAllStations();
            const stationList = apiStations.map((station: ApiStation) => ({
                id: station._id,
                name: station.stationName
            }));
            setStations(stationList);
        } catch (err) {
            console.error('Error loading stations:', err);
        }
    };

    const loadFaultyBatteries = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await BatteryService.getFaultyBatteries();
            setBatteries(response.data);
            setFilteredBatteries(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách pin lỗi');
        } finally {
            setLoading(false);
        }
    };

    // Filter batteries based on search term, status, and station
    const filterBatteries = () => {
        let filtered = batteries;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(battery =>
                battery.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (battery.station?.stationName && battery.station.stationName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(battery => battery.status === statusFilter);
        }

        // Filter by station
        if (selectedStation !== 'ALL') {
            filtered = filtered.filter(battery => battery.station?._id === selectedStation);
        }

        setFilteredBatteries(filtered);
    };

    useEffect(() => {
        loadStations();
        loadFaultyBatteries();
    }, []);

    useEffect(() => {
        filterBatteries();
    }, [searchTerm, statusFilter, selectedStation, batteries]);

    const handleBatteryClick = (battery: ApiBattery) => {
        setSelectedBattery(battery);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedBattery(null);
    };

    // Remove the early return for loading state - handle it inside the CardContent like StaffListPage

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Pin lỗi"
                description="Quản lý và theo dõi các pin bị lỗi trong hệ thống"
            />

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng pin lỗi"
                    value={batteries.length}
                    icon={BatteryIcon}
                    gradientFrom="from-red-50"
                    gradientTo="to-red-100/50"
                    textColor="text-red-900"
                    iconBg="bg-red-500"
                />
                <StatsCard
                    title="Cần sửa chữa"
                    value={batteries.length}
                    icon={AlertCircle}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="Đã kiểm tra"
                    value={0}
                    icon={Eye}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="SOH trung bình"
                    value={`${batteries.length > 0 ? Math.round(batteries.reduce((sum, b) => sum + b.soh, 0) / batteries.length) : 0}%`}
                    icon={TrendingUp}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Search className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Tìm kiếm & Lọc</h3>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tìm theo ID pin hoặc tên trạm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Station Filter */}
                            <Select value={selectedStation} onValueChange={setSelectedStation}>
                                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Chọn trạm" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="ALL"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Tất cả trạm
                                    </SelectItem>
                                    {stations.map(station => (
                                        <SelectItem
                                            key={station.id}
                                            value={station.id}
                                            className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                        >
                                            {station.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BatteryStatus | 'ALL')}>
                                <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="ALL"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Tất cả trạng thái
                                    </SelectItem>
                                    <SelectItem
                                        value="faulty"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Pin lỗi
                                    </SelectItem>
                                    <SelectItem
                                        value="charging"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Đang sạc
                                    </SelectItem>
                                    <SelectItem
                                        value="full"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Đầy
                                    </SelectItem>
                                    <SelectItem
                                        value="in-use"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Đang sử dụng
                                    </SelectItem>
                                    <SelectItem
                                        value="idle"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Nhàn rỗi
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear Filters Button */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setSelectedStation('ALL');
                                }}
                                className="h-12 px-4 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
                            >
                                Xóa bộ lọc
                            </Button>

                            {/* Filter Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
                            >
                                <Filter className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-sm"
                    >
                        Đóng
                    </Button>
                </div>
            )}

            {/* Battery List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-red-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-red-100 rounded-xl mr-3">
                                <BatteryIcon className="h-6 w-6 text-red-600" />
                            </div>
                            Danh sách pin lỗi
                            <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                {filteredBatteries.length}
                            </span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl border-red-600 hover:border-red-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'table'
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl border-red-600 hover:border-red-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <PageLoadingSpinner text="Đang tải danh sách pin lỗi..." />
                    ) : filteredBatteries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <BatteryIcon className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {batteries.length === 0 ? 'Không có pin lỗi' : 'Không tìm thấy pin phù hợp'}
                            </h3>
                            <p className="text-slate-600 text-center mb-6">
                                {batteries.length === 0
                                    ? 'Hiện tại không có pin nào bị lỗi trong hệ thống.'
                                    : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả.'
                                }
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBatteries.map((battery) => (
                                <FaultyBatteryCard
                                    key={battery._id}
                                    battery={battery}
                                    onClick={() => handleBatteryClick(battery)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            {/* Table view will be implemented here */}
                            <div className="text-center py-8 text-slate-500">
                                Chế độ xem bảng sẽ được triển khai
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <FaultyBatteryDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                battery={selectedBattery}
            />
        </div>
    );
};

export default FaultyBatteryPage;
