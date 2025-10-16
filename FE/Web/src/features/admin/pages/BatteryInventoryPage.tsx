import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Battery as BatteryIcon,
    MapPin,
    Activity,
    AlertCircle,
    Zap,
    Thermometer,
    RotateCcw,
    TrendingUp,
    Filter,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService, type Battery as ApiBattery, type BatteryFilters as ApiBatteryFilters } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import type { Battery, BatteryStatus, BatteryGroupedByStation } from '../types/battery';

export const BatteryInventoryPage: React.FC = () => {
    const [batteries, setBatteries] = useState<Battery[]>([]);
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [groupedBatteries, setGroupedBatteries] = useState<BatteryGroupedByStation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStation, setSelectedStation] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<BatteryStatus | 'ALL'>('ALL');
    const [sohRange, setSohRange] = useState({ min: 0, max: 100 });

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

    // Load batteries data
    const loadBatteries = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const filters: Omit<ApiBatteryFilters, 'stationId'> = {
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                sohMin: sohRange.min,
                sohMax: sohRange.max,
                limit: 1000, // Get all batteries
                sort: 'soh',
                order: 'desc'
            };

            let response;
            if (selectedStation !== 'ALL') {
                // Get batteries from specific station
                response = await BatteryService.getBatteriesByStation(selectedStation, filters);
            } else {
                // Get batteries from all stations
                response = await BatteryService.getAllBatteriesFromAllStations(stations, filters);
            }
            const apiBatteries = response.data;

            // Convert API batteries to UI format
            const convertedBatteries: Battery[] = apiBatteries.map((apiBattery: ApiBattery & { stationName?: string }) => {
                return {
                    id: apiBattery._id,
                    batteryId: apiBattery.batteryId,
                    stationId: apiBattery.stationId,
                    stationName: apiBattery.stationName || stations.find(s => s.id === apiBattery.stationId)?.name || 'Unknown Station',
                    status: apiBattery.status,
                    soh: apiBattery.soh,
                    voltage: apiBattery.voltage,
                    current: apiBattery.current,
                    temperature: apiBattery.temperature,
                    cycleCount: apiBattery.cycleCount,
                    lastMaintenance: new Date(apiBattery.lastMaintenance),
                    createdAt: new Date(apiBattery.createdAt),
                    updatedAt: new Date(apiBattery.updatedAt),
                };
            });

            setBatteries(convertedBatteries);
            groupBatteriesByStation(convertedBatteries);
            toast.success('Tải danh sách pin thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách pin';
            setError(errorMessage);
            console.error('Error loading batteries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Group batteries by station
    const groupBatteriesByStation = (batteryList: Battery[]) => {
        const grouped = batteryList.reduce((acc, battery) => {
            const existing = acc.find(group => group.stationId === battery.stationId);
            if (existing) {
                existing.batteries.push(battery);
            } else {
                acc.push({
                    stationId: battery.stationId,
                    stationName: battery.stationName,
                    batteries: [battery],
                    stats: {
                        total: 0,
                        charging: 0,
                        full: 0,
                        faulty: 0,
                        inUse: 0,
                        idle: 0,
                        averageSoh: 0
                    }
                });
            }
            return acc;
        }, [] as BatteryGroupedByStation[]);

        // Calculate stats for each group
        grouped.forEach(group => {
            const total = group.batteries.length;
            const charging = group.batteries.filter(b => b.status === 'charging').length;
            const full = group.batteries.filter(b => b.status === 'full').length;
            const faulty = group.batteries.filter(b => b.status === 'faulty').length;
            const inUse = group.batteries.filter(b => b.status === 'in-use').length;
            const idle = group.batteries.filter(b => b.status === 'idle').length;
            const averageSoh = total > 0 ? group.batteries.reduce((sum, b) => sum + b.soh, 0) / total : 0;

            group.stats = {
                total,
                charging,
                full,
                faulty,
                inUse,
                idle,
                averageSoh: Math.round(averageSoh * 100) / 100
            };
        });

        setGroupedBatteries(grouped);
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            await loadStations();
            await loadBatteries();
        };
        loadData();
    }, []);

    // Reload batteries when filters change
    useEffect(() => {
        if (stations.length > 0) {
            loadBatteries();
        }
    }, [selectedStation, statusFilter, sohRange, stations]);

    const getStatusBadge = (status: BatteryStatus) => {
        switch (status) {
            case 'charging':
                return <Badge variant="warning">Đang sạc</Badge>;
            case 'full':
                return <Badge variant="success">Đầy</Badge>;
            case 'faulty':
                return <Badge variant="destructive">Lỗi</Badge>;
            case 'in-use':
                return <Badge variant="default">Đang sử dụng</Badge>;
            case 'idle':
                return <Badge variant="secondary">Nhàn rỗi</Badge>;
            default:
                return <Badge variant="secondary">Không xác định</Badge>;
        }
    };

    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'charging':
                return 'text-orange-500';
            case 'full':
                return 'text-green-500';
            case 'faulty':
                return 'text-red-500';
            case 'in-use':
                return 'text-blue-500';
            case 'idle':
                return 'text-gray-500';
            default:
                return 'text-gray-400';
        }
    };

    const getSohColor = (soh: number) => {
        if (soh >= 80) return 'text-green-600';
        if (soh >= 60) return 'text-yellow-600';
        if (soh >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Kho pin"
                description="Quản lý và theo dõi trạng thái pin tại các trạm đổi pin"
            />

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

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng pin"
                    value={batteries.length}
                    icon={BatteryIcon}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Đang sạc"
                    value={batteries.filter(b => b.status === 'charging').length}
                    icon={Zap}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="Sẵn sàng"
                    value={batteries.filter(b => b.status === 'full').length}
                    icon={Activity}
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
                                placeholder="Tìm kiếm pin theo ID, trạm..."
                                className="w-full pl-12 h-12 bg-white/90 border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
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
                                        value="faulty"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Lỗi
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

                            {/* SOH Range */}
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={sohRange.min}
                                    onChange={(e) => setSohRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                    className="w-20 h-12 bg-white/90 border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl px-3 text-slate-700 text-center"
                                    placeholder="Min"
                                />
                                <span className="flex items-center text-slate-500">-</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={sohRange.max}
                                    onChange={(e) => setSohRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                                    className="w-20 h-12 bg-white/90 border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl px-3 text-slate-700 text-center"
                                    placeholder="Max"
                                />
                            </div>

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

            {/* Battery Inventory by Station */}
            <div className="space-y-6">
                {isLoading ? (
                    <PageLoadingSpinner text="Đang tải danh sách pin..." />
                ) : groupedBatteries.length === 0 ? (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BatteryIcon className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Không có pin nào</h3>
                            <p className="text-slate-600 text-center">
                                Không tìm thấy pin phù hợp với bộ lọc hiện tại.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    groupedBatteries.map((group) => (
                        <Card key={group.stationId} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                                        <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                            <MapPin className="h-6 w-6 text-blue-600" />
                                        </div>
                                        {group.stationName}
                                        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                            {group.stats.total} pin
                                        </span>
                                    </CardTitle>
                                    <div className="flex space-x-4 text-sm text-slate-600">
                                        <span className="flex items-center">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                            Đang sạc: {group.stats.charging}
                                        </span>
                                        <span className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            Sẵn sàng: {group.stats.full}
                                        </span>
                                        <span className="flex items-center">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                            Lỗi: {group.stats.faulty}
                                        </span>
                                        <span className="text-slate-500">
                                            SOH TB: {group.stats.averageSoh}%
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.batteries.map((battery) => (
                                        <Card key={battery.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <BatteryIcon className={`h-5 w-5 ${getStatusColor(battery.status)}`} />
                                                        <span className="font-medium text-slate-800">{battery.batteryId}</span>
                                                    </div>
                                                    {getStatusBadge(battery.status)}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">SOH:</span>
                                                        <span className={`font-medium ${getSohColor(battery.soh)}`}>
                                                            {battery.soh}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">Điện áp:</span>
                                                        <span className="font-medium">{battery.voltage}V</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">Dòng điện:</span>
                                                        <span className="font-medium">{battery.current}A</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">Nhiệt độ:</span>
                                                        <span className="font-medium flex items-center">
                                                            <Thermometer className="h-3 w-3 mr-1" />
                                                            {battery.temperature}°C
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">Chu kỳ:</span>
                                                        <span className="font-medium flex items-center">
                                                            <RotateCcw className="h-3 w-3 mr-1" />
                                                            {battery.cycleCount}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};