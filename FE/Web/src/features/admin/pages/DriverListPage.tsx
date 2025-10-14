import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Grid, List, Users, Activity, Car, Star } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import type { Driver, DriverFilters, SubscriptionPlan } from '../types/driver';

// Mock data - trong thực tế sẽ lấy từ API
const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
        id: '1',
        name: 'Gói Premium',
        type: 'PREMIUM',
        price: 299000,
        currency: 'VND',
        duration: 30,
        maxSwapsPerMonth: 50,
        features: ['Đổi pin không giới hạn', 'Ưu tiên tại trạm', 'Hỗ trợ 24/7'],
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
    },
    {
        id: '2',
        name: 'Gói Basic',
        type: 'BASIC',
        price: 199000,
        currency: 'VND',
        duration: 30,
        maxSwapsPerMonth: 20,
        features: ['Đổi pin cơ bản', 'Hỗ trợ qua email'],
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
    },
    {
        id: '3',
        name: 'Gói Unlimited',
        type: 'UNLIMITED',
        price: 499000,
        currency: 'VND',
        duration: 30,
        maxSwapsPerMonth: -1,
        features: ['Đổi pin không giới hạn', 'Ưu tiên cao nhất', 'Hỗ trợ VIP'],
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
    }
];

const mockDrivers: Driver[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        licenseNumber: 'A123456789',
        licenseType: 'A2',
        status: 'ACTIVE',
        subscriptionPlan: mockSubscriptionPlans[0],
        vehicleId: 'v1',
        vehicleModel: 'VinFast VF8',
        vehiclePlate: '30A-12345',
        totalSwaps: 45,
        totalDistance: 2500,
        rating: 4.8,
        joinDate: new Date('2024-01-01'),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        address: '123 Đường ABC, Quận 1',
        city: 'TP.HCM',
        emergencyContact: {
            name: 'Nguyễn Thị B',
            phone: '0987654321',
            relationship: 'Vợ'
        },
        preferences: {
            preferredStations: ['station-1', 'station-2'],
            notificationSettings: {
                email: true,
                sms: true,
                push: true
            },
            language: 'vi',
            timezone: 'Asia/Ho_Chi_Minh'
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
    },
    {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0987654321',
        licenseNumber: 'B987654321',
        licenseType: 'B2',
        status: 'ACTIVE',
        subscriptionPlan: mockSubscriptionPlans[1],
        vehicleId: 'v2',
        vehicleModel: 'Tesla Model 3',
        vehiclePlate: '29B-67890',
        totalSwaps: 18,
        totalDistance: 1200,
        rating: 4.5,
        joinDate: new Date('2024-01-05'),
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
        address: '456 Đường XYZ, Quận 2',
        city: 'TP.HCM',
        emergencyContact: {
            name: 'Trần Văn C',
            phone: '0369258147',
            relationship: 'Anh trai'
        },
        preferences: {
            preferredStations: ['station-2'],
            notificationSettings: {
                email: true,
                sms: false,
                push: true
            },
            language: 'vi',
            timezone: 'Asia/Ho_Chi_Minh'
        },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
    },
    {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0369258147',
        licenseNumber: 'C456789123',
        licenseType: 'A1',
        status: 'INACTIVE',
        subscriptionPlan: mockSubscriptionPlans[2],
        vehicleId: 'v3',
        vehicleModel: 'VinFast VF9',
        vehiclePlate: '51C-11111',
        totalSwaps: 32,
        totalDistance: 1800,
        rating: 4.2,
        joinDate: new Date('2024-01-10'),
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
        address: '789 Đường DEF, Quận 3',
        city: 'TP.HCM',
        emergencyContact: {
            name: 'Lê Thị D',
            phone: '0123456789',
            relationship: 'Chị gái'
        },
        preferences: {
            preferredStations: ['station-1'],
            notificationSettings: {
                email: false,
                sms: true,
                push: false
            },
            language: 'vi',
            timezone: 'Asia/Ho_Chi_Minh'
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12')
    }
];

interface DriverListPageProps {
    onDriverSelect?: (driver: Driver) => void;
}

export const DriverListPage: React.FC<DriverListPageProps> = ({ onDriverSelect }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<DriverFilters>({
        search: '',
        status: 'ALL',
        subscriptionPlan: 'ALL',
        licenseType: 'ALL',
        city: 'ALL'
    });
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    const filteredDrivers = mockDrivers.filter(driver => {
        const matchesSearch = driver.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            driver.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            driver.phone.includes(filters.search) ||
            driver.licenseNumber.includes(filters.search);

        const matchesStatus = filters.status === 'ALL' || driver.status === filters.status;
        const matchesPlan = filters.subscriptionPlan === 'ALL' || driver.subscriptionPlan.id === filters.subscriptionPlan;
        const matchesLicense = filters.licenseType === 'ALL' || driver.licenseType === filters.licenseType;
        const matchesCity = filters.city === 'ALL' || driver.city === filters.city;

        return matchesSearch && matchesStatus && matchesPlan && matchesLicense && matchesCity;
    });

    const handleDriverSelect = (driver: Driver) => {
        // setSelectedDriver(driver);
        onDriverSelect?.(driver);
    };

    // const handleAddDriver = (data: AddDriverRequest) => {
    //   // TODO: Implement add driver API call
    //   console.log('Add driver:', data);
    //   setIsAddModalOpen(false);
    // };

    // const handleUpdateDriver = (data: UpdateDriverRequest) => {
    //   // TODO: Implement update driver API call
    //   console.log('Update driver:', data);
    // };

    const handleSuspendDriver = (driver: Driver) => {
        if (window.confirm(`Bạn có chắc chắn muốn tạm khóa tài xế ${driver.name}?`)) {
            // TODO: Implement suspend driver API call
            console.log('Suspend driver:', driver);
        }
    };

    const handleActivateDriver = (driver: Driver) => {
        if (window.confirm(`Bạn có chắc chắn muốn kích hoạt tài xế ${driver.name}?`)) {
            // TODO: Implement activate driver API call
            console.log('Activate driver:', driver);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800';
            case 'SUSPENDED': return 'bg-red-100 text-red-800';
            case 'PENDING_VERIFICATION': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Hoạt động';
            case 'INACTIVE': return 'Không hoạt động';
            case 'SUSPENDED': return 'Tạm khóa';
            case 'PENDING_VERIFICATION': return 'Chờ xác thực';
            default: return status;
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Danh sách tài xế"
                description="Quản lý thông tin tài xế và phương tiện"
                showBackButton={false}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng số tài xế"
                    value={mockDrivers.length.toLocaleString()}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Tài xế hoạt động"
                    value={mockDrivers.filter(d => d.status === 'ACTIVE').length.toLocaleString()}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Tổng lượt đổi pin"
                    value={mockDrivers.reduce((sum, d) => sum + d.totalSwaps, 0).toLocaleString()}
                    icon={Car}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
                <StatsCard
                    title="Đánh giá trung bình"
                    value={`${(mockDrivers.reduce((sum, d) => sum + d.rating, 0) / mockDrivers.length).toFixed(1)}/5`}
                    icon={Star}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
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
                            onClick={() => console.log('Add driver modal')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm tài xế
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                            <input
                                type="text"
                                placeholder="Tên, email, SĐT, bằng lái..."
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
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Không hoạt động</option>
                                <option value="SUSPENDED">Tạm khóa</option>
                                <option value="PENDING_VERIFICATION">Chờ xác thực</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Gói thuê</label>
                            <select
                                value={filters.subscriptionPlan}
                                onChange={(e) => setFilters({ ...filters, subscriptionPlan: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả</option>
                                {mockSubscriptionPlans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Loại bằng lái</label>
                            <select
                                value={filters.licenseType}
                                onChange={(e) => setFilters({ ...filters, licenseType: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="A1">A1</option>
                                <option value="A2">A2</option>
                                <option value="A3">A3</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Thành phố</label>
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="TP.HCM">TP.HCM</option>
                                <option value="Hà Nội">Hà Nội</option>
                                <option value="Đà Nẵng">Đà Nẵng</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Drivers List */}
            <div className="space-y-6">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDrivers.map((driver) => (
                            <Card key={driver.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {driver.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{driver.name}</h3>
                                                <p className="text-sm text-slate-500">{driver.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                            {getStatusText(driver.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Bằng lái:</span>
                                            <span className="text-sm font-medium">{driver.licenseNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Xe:</span>
                                            <span className="text-sm font-medium">{driver.vehicleModel}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Gói thuê:</span>
                                            <span className="text-sm font-medium">{driver.subscriptionPlan.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Đánh giá:</span>
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                <span className="text-sm font-medium">{driver.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Lượt đổi pin:</span>
                                            <span className="text-sm font-medium">{driver.totalSwaps}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDriverSelect(driver)}
                                            className="flex-1"
                                        >
                                            Xem chi tiết
                                        </Button>
                                        {driver.status === 'ACTIVE' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSuspendDriver(driver)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Khóa
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleActivateDriver(driver)}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                Kích hoạt
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
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tài xế</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Bằng lái</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Xe</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Gói thuê</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Trạng thái</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Đánh giá</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Lượt đổi pin</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredDrivers.map((driver) => (
                                            <tr key={driver.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {driver.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{driver.name}</div>
                                                            <div className="text-sm text-slate-500">{driver.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{driver.licenseNumber}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{driver.vehicleModel}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{driver.subscriptionPlan.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                                        {getStatusText(driver.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                        <span className="text-sm font-medium">{driver.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{driver.totalSwaps}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDriverSelect(driver)}
                                                        >
                                                            Xem
                                                        </Button>
                                                        {driver.status === 'ACTIVE' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSuspendDriver(driver)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                Khóa
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleActivateDriver(driver)}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                Kích hoạt
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

            {filteredDrivers.length === 0 && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">Không tìm thấy tài xế</h3>
                        <p className="text-slate-500">Thử thay đổi bộ lọc để tìm kiếm tài xế khác.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
