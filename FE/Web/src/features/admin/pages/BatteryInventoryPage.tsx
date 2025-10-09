import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Grid, List, Battery as BatteryIcon, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import type { Battery, BatteryFilters, BatteryStats, BatteryStatus } from '../types/battery';

// Mock data - trong thực tế sẽ lấy từ API
const mockBatteries: Battery[] = [
    {
        id: '1',
        serialNumber: 'BAT-001-2024',
        model: 'VF-BAT-100',
        manufacturer: 'VinFast',
        capacity: 100,
        currentCharge: 85,
        health: 92,
        status: 'AVAILABLE',
        location: {
            type: 'STATION',
            stationId: 'station-1',
            stationName: 'Trạm Hà Nội',
            slotId: 'slot-1'
        },
        lastMaintenance: new Date('2024-01-01'),
        nextMaintenance: new Date('2024-04-01'),
        totalCycles: 150,
        maxCycles: 2000,
        temperature: 25,
        voltage: 400,
        current: 50,
        power: 20,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
    },
    {
        id: '2',
        serialNumber: 'BAT-002-2024',
        model: 'TESLA-BAT-85',
        manufacturer: 'Tesla',
        capacity: 85,
        currentCharge: 45,
        health: 88,
        status: 'CHARGING',
        location: {
            type: 'STATION',
            stationId: 'station-1',
            stationName: 'Trạm Hà Nội',
            slotId: 'slot-2'
        },
        lastMaintenance: new Date('2023-12-15'),
        nextMaintenance: new Date('2024-03-15'),
        totalCycles: 200,
        maxCycles: 1500,
        temperature: 28,
        voltage: 350,
        current: 75,
        power: 26,
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-10')
    },
    {
        id: '3',
        serialNumber: 'BAT-003-2024',
        model: 'BYD-BAT-120',
        manufacturer: 'BYD',
        capacity: 120,
        currentCharge: 95,
        health: 95,
        status: 'IN_USE',
        location: {
            type: 'VEHICLE',
            vehicleId: 'vehicle-1',
            vehicleModel: 'VinFast VF8'
        },
        lastMaintenance: new Date('2024-01-05'),
        nextMaintenance: new Date('2024-04-05'),
        totalCycles: 80,
        maxCycles: 2500,
        temperature: 30,
        voltage: 450,
        current: 0,
        power: 0,
        createdAt: new Date('2023-11-01'),
        updatedAt: new Date('2024-01-12')
    },
    {
        id: '4',
        serialNumber: 'BAT-004-2024',
        model: 'VF-BAT-100',
        manufacturer: 'VinFast',
        capacity: 100,
        currentCharge: 0,
        health: 45,
        status: 'MAINTENANCE',
        location: {
            type: 'MAINTENANCE',
            warehouseId: 'warehouse-1',
            warehouseName: 'Kho bảo trì Hà Nội'
        },
        lastMaintenance: new Date('2024-01-10'),
        nextMaintenance: new Date('2024-01-20'),
        totalCycles: 1800,
        maxCycles: 2000,
        temperature: 22,
        voltage: 0,
        current: 0,
        power: 0,
        createdAt: new Date('2022-06-01'),
        updatedAt: new Date('2024-01-10')
    }
];

const mockStats: BatteryStats = {
    totalBatteries: 1250,
    availableBatteries: 800,
    inUseBatteries: 300,
    chargingBatteries: 100,
    maintenanceBatteries: 30,
    retiredBatteries: 15,
    defectiveBatteries: 5,
    averageHealth: 87.5,
    averageCharge: 72.3,
    totalSwaps: 15680,
    batteriesByStatus: [
        { status: 'AVAILABLE', count: 800 },
        { status: 'IN_USE', count: 300 },
        { status: 'CHARGING', count: 100 },
        { status: 'MAINTENANCE', count: 30 },
        { status: 'RETIRED', count: 15 },
        { status: 'DEFECTIVE', count: 5 }
    ],
    batteriesByLocation: [
        { location: 'Trạm Hà Nội', count: 400 },
        { location: 'Trạm TP.HCM', count: 350 },
        { location: 'Trạm Đà Nẵng', count: 200 },
        { location: 'Kho bảo trì', count: 50 },
        { location: 'Trên xe', count: 250 }
    ],
    batteriesByManufacturer: [
        { manufacturer: 'VinFast', count: 500 },
        { manufacturer: 'Tesla', count: 300 },
        { manufacturer: 'BYD', count: 250 },
        { manufacturer: 'CATL', count: 200 }
    ],
    recentSwaps: [],
    recentAlerts: []
};

interface BatteryInventoryPageProps {
    onBatterySelect?: (battery: Battery) => void;
}

export const BatteryInventoryPage: React.FC<BatteryInventoryPageProps> = ({ onBatterySelect }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<BatteryFilters>({
        search: '',
        status: 'ALL',
        location: 'ALL',
        manufacturer: 'ALL',
        healthRange: { min: 0, max: 100 },
        chargeRange: { min: 0, max: 100 }
    });

    const filteredBatteries = mockBatteries.filter(battery => {
        const matchesSearch = battery.serialNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
            battery.model.toLowerCase().includes(filters.search.toLowerCase()) ||
            battery.manufacturer.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStatus = filters.status === 'ALL' || battery.status === filters.status;
        const matchesLocation = filters.location === 'ALL' ||
            (battery.location.stationName === filters.location) ||
            (battery.location.warehouseName === filters.location);
        const matchesManufacturer = filters.manufacturer === 'ALL' || battery.manufacturer === filters.manufacturer;
        const matchesHealth = battery.health >= filters.healthRange.min && battery.health <= filters.healthRange.max;
        const matchesCharge = battery.currentCharge >= filters.chargeRange.min && battery.currentCharge <= filters.chargeRange.max;

        return matchesSearch && matchesStatus && matchesLocation && matchesManufacturer && matchesHealth && matchesCharge;
    });

    const handleBatterySelect = (battery: Battery) => {
        onBatterySelect?.(battery);
    };

    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800';
            case 'IN_USE': return 'bg-blue-100 text-blue-800';
            case 'CHARGING': return 'bg-yellow-100 text-yellow-800';
            case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
            case 'RETIRED': return 'bg-gray-100 text-gray-800';
            case 'DEFECTIVE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: BatteryStatus) => {
        switch (status) {
            case 'AVAILABLE': return 'Có sẵn';
            case 'IN_USE': return 'Đang sử dụng';
            case 'CHARGING': return 'Đang sạc';
            case 'MAINTENANCE': return 'Bảo trì';
            case 'RETIRED': return 'Nghỉ hưu';
            case 'DEFECTIVE': return 'Hỏng';
            default: return status;
        }
    };

    const getHealthColor = (health: number) => {
        if (health >= 80) return 'text-green-600';
        if (health >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Quản lý kho pin"
                description="Theo dõi và quản lý tình trạng pin trong hệ thống"
                showBackButton={false}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng số pin"
                    value={mockStats.totalBatteries.toLocaleString()}
                    icon={BatteryIcon}
                    gradientFrom="from-blue-500"
                    gradientTo="to-blue-600"
                    textColor="text-white"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Pin có sẵn"
                    value={mockStats.availableBatteries.toLocaleString()}
                    icon={Zap}
                    gradientFrom="from-green-500"
                    gradientTo="to-green-600"
                    textColor="text-white"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Đang sạc"
                    value={mockStats.chargingBatteries.toLocaleString()}
                    icon={TrendingUp}
                    gradientFrom="from-yellow-500"
                    gradientTo="to-yellow-600"
                    textColor="text-white"
                    iconBg="bg-yellow-500"
                />
                <StatsCard
                    title="Sức khỏe TB"
                    value={`${mockStats.averageHealth.toFixed(1)}%`}
                    icon={AlertTriangle}
                    gradientFrom="from-purple-500"
                    gradientTo="to-purple-600"
                    textColor="text-white"
                    iconBg="bg-purple-500"
                />
            </div>

            {/* Filters and Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                        <Button
                            onClick={() => console.log('Add battery modal')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm pin
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                            <input
                                type="text"
                                placeholder="Số seri, model, nhà SX..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="AVAILABLE">Có sẵn</option>
                                <option value="IN_USE">Đang sử dụng</option>
                                <option value="CHARGING">Đang sạc</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="RETIRED">Nghỉ hưu</option>
                                <option value="DEFECTIVE">Hỏng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Vị trí</label>
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="Trạm Hà Nội">Trạm Hà Nội</option>
                                <option value="Trạm TP.HCM">Trạm TP.HCM</option>
                                <option value="Trạm Đà Nẵng">Trạm Đà Nẵng</option>
                                <option value="Kho bảo trì">Kho bảo trì</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nhà SX</label>
                            <select
                                value={filters.manufacturer}
                                onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="VinFast">VinFast</option>
                                <option value="Tesla">Tesla</option>
                                <option value="BYD">BYD</option>
                                <option value="CATL">CATL</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sức khỏe (%)</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min="0"
                                    max="100"
                                    value={filters.healthRange.min}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        healthRange: { ...filters.healthRange, min: parseInt(e.target.value) || 0 }
                                    })}
                                    className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min="0"
                                    max="100"
                                    value={filters.healthRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        healthRange: { ...filters.healthRange, max: parseInt(e.target.value) || 100 }
                                    })}
                                    className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Dung lượng (%)</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min="0"
                                    max="100"
                                    value={filters.chargeRange.min}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        chargeRange: { ...filters.chargeRange, min: parseInt(e.target.value) || 0 }
                                    })}
                                    className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min="0"
                                    max="100"
                                    value={filters.chargeRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        chargeRange: { ...filters.chargeRange, max: parseInt(e.target.value) || 100 }
                                    })}
                                    className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Batteries List */}
            <div className="space-y-6">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBatteries.map((battery) => (
                            <Card key={battery.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                <BatteryIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{battery.serialNumber}</h3>
                                                <p className="text-sm text-slate-500">{battery.model}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(battery.status)}`}>
                                            {getStatusText(battery.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Nhà SX:</span>
                                            <span className="text-sm font-medium">{battery.manufacturer}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Dung lượng:</span>
                                            <span className="text-sm font-medium">{battery.capacity} kWh</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Sạc hiện tại:</span>
                                            <span className="text-sm font-medium">{battery.currentCharge}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Sức khỏe:</span>
                                            <span className={`text-sm font-medium ${getHealthColor(battery.health)}`}>
                                                {battery.health}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Vị trí:</span>
                                            <span className="text-sm font-medium">
                                                {battery.location.stationName || battery.location.warehouseName || 'Trên xe'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Chu kỳ:</span>
                                            <span className="text-sm font-medium">{battery.totalCycles}/{battery.maxCycles}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBatterySelect(battery)}
                                            className="flex-1"
                                        >
                                            Xem chi tiết
                                        </Button>
                                        {battery.status === 'AVAILABLE' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => console.log('Move battery')}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                Di chuyển
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Pin</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Nhà SX</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Dung lượng</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Sạc</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Sức khỏe</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Vị trí</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Trạng thái</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredBatteries.map((battery) => (
                                            <tr key={battery.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                                                            <BatteryIcon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{battery.serialNumber}</div>
                                                            <div className="text-sm text-slate-500">{battery.model}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.manufacturer}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.capacity} kWh</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.currentCharge}%</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium ${getHealthColor(battery.health)}`}>
                                                        {battery.health}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800">
                                                    {battery.location.stationName || battery.location.warehouseName || 'Trên xe'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(battery.status)}`}>
                                                        {getStatusText(battery.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleBatterySelect(battery)}
                                                        >
                                                            Xem
                                                        </Button>
                                                        {battery.status === 'AVAILABLE' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => console.log('Move battery')}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                Di chuyển
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {filteredBatteries.length === 0 && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <BatteryIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">Không tìm thấy pin</h3>
                        <p className="text-slate-500">Thử thay đổi bộ lọc để tìm kiếm pin khác.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
