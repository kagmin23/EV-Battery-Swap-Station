import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Grid, List, Users, Activity, Car, Star, Calendar, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DriverSearchBar } from '../components/DriverSearchBar';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { DriverService } from '@/services/api/driverService';
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

// Mock data removed - now using API data

interface DriverListPageProps {
    onDriverSelect?: (driver: Driver) => void;
}

export const DriverListPage: React.FC<DriverListPageProps> = ({ onDriverSelect }) => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<DriverFilters>({
        search: '',
        status: 'ALL',
        subscriptionPlan: 'ALL',
        licenseType: 'ALL',
        city: 'ALL'
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseType: '',
        address: '',
        city: '',
        subscriptionPlan: '',
        vehicleModel: '',
        vehiclePlate: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suspendingDriverId, setSuspendingDriverId] = useState<string | null>(null);
    const [activatingDriverId, setActivatingDriverId] = useState<string | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'suspend' | 'activate' | null>(null);
    const [targetDriver, setTargetDriver] = useState<Driver | null>(null);

    // Load drivers data from API
    const loadDrivers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const apiDrivers = await DriverService.getAllDrivers();

            // Convert API drivers to UI driver format
            const convertedDrivers: Driver[] = apiDrivers.map((apiDriver) => ({
                id: apiDriver._id,
                name: apiDriver.fullName || 'Chưa cập nhật',
                email: apiDriver.email || 'Chưa cập nhật',
                phone: apiDriver.phoneNumber || 'Chưa cập nhật',
                licenseNumber: 'Chưa cập nhật', // Not available in API response
                licenseType: 'A1', // Default license type - not available in API response
                status: apiDriver.status === 'active' ? 'ACTIVE' : 'INACTIVE',
                subscriptionPlan: mockSubscriptionPlans[0], // Default plan
                vehicleId: 'Chưa cập nhật', // Not available in API response
                vehicleModel: 'Chưa cập nhật', // Not available in API response
                vehiclePlate: 'Chưa cập nhật', // Not available in API response
                totalSwaps: 0, // Not available in API response
                totalDistance: 0, // Not available in API response
                rating: 0, // Not available in API response
                joinDate: new Date(apiDriver.createdAt),
                lastActive: new Date(apiDriver.updatedAt),
                address: 'Chưa cập nhật', // Not available in API response
                city: 'Chưa cập nhật', // Not available in API response
                avatar: apiDriver.avatar || undefined,
                emergencyContact: {
                    name: 'Chưa cập nhật',
                    phone: 'Chưa cập nhật',
                    relationship: 'Chưa cập nhật'
                },
                preferences: {
                    preferredStations: [],
                    notificationSettings: {
                        email: true,
                        sms: true,
                        push: true
                    },
                    language: 'vi',
                    timezone: 'Asia/Ho_Chi_Minh'
                },
                createdAt: new Date(apiDriver.createdAt),
                updatedAt: new Date(apiDriver.updatedAt),
            }));

            setDrivers(convertedDrivers);
            toast.success('Tải danh sách tài xế thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách tài xế';
            setError(errorMessage);
            console.error('Error loading drivers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadDrivers();
    }, []);

    const filteredDrivers = drivers.filter(driver => {
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
        setSelectedDriver(driver);
        setIsDetailsModalOpen(true);
        onDriverSelect?.(driver);
    };

    const handleAddDriver = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            licenseNumber: '',
            licenseType: '',
            address: '',
            city: '',
            subscriptionPlan: '',
            vehicleModel: '',
            vehiclePlate: ''
        });
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            // TODO: Implement add driver API call
            console.log('Add driver:', formData);
            handleCloseModal();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm tài xế';
            setError(errorMessage);
            console.error('Error adding driver:', err);
        } finally {
            setIsSubmitting(false);
        }
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
        setTargetDriver(driver);
        setActionType('suspend');
        setIsConfirmationModalOpen(true);
    };

    const handleActivateDriver = (driver: Driver) => {
        setTargetDriver(driver);
        setActionType('activate');
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!targetDriver || !actionType) return;

        try {
            if (actionType === 'suspend') {
                setSuspendingDriverId(targetDriver.id);
                await DriverService.changeDriverStatus(targetDriver.id, 'locked');

                // Update local state
                setDrivers(prev => prev.map(d =>
                    d.id === targetDriver.id
                        ? { ...d, status: 'INACTIVE' as const, updatedAt: new Date() }
                        : d
                ));

                toast.success(`Đã tạm khóa tài xế ${targetDriver.name}`);
            } else {
                setActivatingDriverId(targetDriver.id);
                await DriverService.changeDriverStatus(targetDriver.id, 'active');

                // Update local state
                setDrivers(prev => prev.map(d =>
                    d.id === targetDriver.id
                        ? { ...d, status: 'ACTIVE' as const, updatedAt: new Date() }
                        : d
                ));

                toast.success(`Đã kích hoạt tài xế ${targetDriver.name}`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : `Có lỗi xảy ra khi ${actionType === 'suspend' ? 'tạm khóa' : 'kích hoạt'} tài xế`;
            setError(errorMessage);
            console.error(`Error ${actionType}ing driver:`, err);
        } finally {
            setSuspendingDriverId(null);
            setActivatingDriverId(null);
            setIsConfirmationModalOpen(false);
            setTargetDriver(null);
            setActionType(null);
        }
    };

    const handleCancelAction = () => {
        setIsConfirmationModalOpen(false);
        setTargetDriver(null);
        setActionType(null);
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                    >
                        Đóng
                    </Button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng số tài xế"
                    value={drivers.length.toLocaleString()}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Tài xế hoạt động"
                    value={drivers.filter(d => d.status === 'ACTIVE').length.toLocaleString()}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Tổng lượt đổi pin"
                    value={drivers.reduce((sum, d) => sum + d.totalSwaps, 0).toLocaleString()}
                    icon={Car}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
                <StatsCard
                    title="Đánh giá trung bình"
                    value={drivers.length > 0 ? `${(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}/5` : '0/5'}
                    icon={Star}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <DriverSearchBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    subscriptionPlans={mockSubscriptionPlans}
                    onResetFilters={() => setFilters({
                        search: '',
                        status: 'ALL',
                        subscriptionPlan: 'ALL',
                        licenseType: 'ALL',
                        city: 'ALL'
                    })}
                />
            </div>

            {/* Drivers List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            Danh sách tài xế
                            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {filteredDrivers.length}
                            </span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl border-blue-600 hover:border-blue-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'list'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl border-blue-600 hover:border-blue-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleAddDriver}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700"
                            >
                                {isSubmitting ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Đang thêm..." />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm tài xế
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Đang tải danh sách tài xế..." />
                    ) : filteredDrivers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Không có tài xế nào</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.status !== 'ALL' || filters.subscriptionPlan !== 'ALL' || filters.licenseType !== 'ALL' || filters.city !== 'ALL'
                                    ? 'Không tìm thấy tài xế phù hợp với bộ lọc hiện tại.'
                                    : 'Chưa có tài xế nào được thêm vào hệ thống.'}
                            </p>
                            {(!filters.search && filters.status === 'ALL' && filters.subscriptionPlan === 'ALL' && filters.licenseType === 'ALL' && filters.city === 'ALL') && (
                                <Button
                                    onClick={handleAddDriver}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm tài xế đầu tiên
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                            {filteredDrivers.map((driver) => (
                                <Card
                                    key={driver.id}
                                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
                                    onClick={() => handleDriverSelect(driver)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {driver.avatar ? (
                                                    <img
                                                        src={driver.avatar}
                                                        alt={driver.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {driver.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">{driver.name}</h3>
                                                    <p className="text-sm text-slate-500">{driver.email}</p>
                                                    <p className="text-xs text-slate-400">{driver.phone}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                                {getStatusText(driver.status)}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">ID:</span>
                                                <span className="text-sm font-medium font-mono">{driver.id.slice(-8)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Trạng thái xác thực:</span>
                                                <span className="text-sm font-medium text-yellow-600">
                                                    Chưa xác thực
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Ngày tham gia:</span>
                                                <span className="text-sm font-medium">{driver.joinDate.toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Lần hoạt động cuối:</span>
                                                <span className="text-sm font-medium">{driver.lastActive.toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Gói thuê:</span>
                                                <span className="text-sm font-medium">{driver.subscriptionPlan.name}</span>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDriverSelect(driver);
                                                }}
                                                className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm"
                                            >
                                                Xem chi tiết
                                            </Button>
                                            {driver.status === 'ACTIVE' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSuspendDriver(driver);
                                                    }}
                                                    disabled={suspendingDriverId === driver.id || activatingDriverId === driver.id}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                                >
                                                    {suspendingDriverId === driver.id ? (
                                                        <ButtonLoadingSpinner size="sm" variant="default" text="Đang xử lý..." />
                                                    ) : (
                                                        'Khóa'
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleActivateDriver(driver);
                                                    }}
                                                    disabled={suspendingDriverId === driver.id || activatingDriverId === driver.id}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                                >
                                                    {activatingDriverId === driver.id ? (
                                                        <ButtonLoadingSpinner size="sm" variant="default" text="Đang xử lý..." />
                                                    ) : (
                                                        'Kích hoạt'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 ">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tài xế</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Số điện thoại</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Trạng thái</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Xác thực</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ngày tham gia</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Lần hoạt động cuối</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredDrivers.map((driver) => (
                                        <tr key={driver.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    {driver.avatar ? (
                                                        <img
                                                            src={driver.avatar}
                                                            alt={driver.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {driver.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-slate-800">{driver.name}</div>
                                                        <div className="text-sm text-slate-500">{driver.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-800">{driver.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                                    {getStatusText(driver.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-yellow-600">
                                                    Chưa xác thực
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-800">{driver.joinDate.toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-4 text-sm text-slate-800">{driver.lastActive.toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDriverSelect(driver)}
                                                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm"
                                                    >
                                                        Xem
                                                    </Button>
                                                    {driver.status === 'ACTIVE' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSuspendDriver(driver)}
                                                            disabled={suspendingDriverId === driver.id || activatingDriverId === driver.id}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                                        >
                                                            {suspendingDriverId === driver.id ? (
                                                                <ButtonLoadingSpinner size="sm" variant="default" text="Đang xử lý..." />
                                                            ) : (
                                                                'Khóa'
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleActivateDriver(driver)}
                                                            disabled={suspendingDriverId === driver.id || activatingDriverId === driver.id}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                                        >
                                                            {activatingDriverId === driver.id ? (
                                                                <ButtonLoadingSpinner size="sm" variant="default" text="Đang xử lý..." />
                                                            ) : (
                                                                'Kích hoạt'
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>


            {/* Driver Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Chi tiết tài xế
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết về tài xế {selectedDriver?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDriver && (
                        <div className="py-4 space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Thông tin cá nhân
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        {selectedDriver.avatar ? (
                                            <img
                                                src={selectedDriver.avatar}
                                                alt={selectedDriver.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                                {selectedDriver.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-lg">{selectedDriver.name}</h4>
                                            <p className="text-slate-500">{selectedDriver.email}</p>
                                            <p className="text-slate-500">{selectedDriver.phone}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">ID:</span>
                                            <span className="font-mono text-sm">{selectedDriver.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Trạng thái:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDriver.status)}`}>
                                                {getStatusText(selectedDriver.status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Vai trò:</span>
                                            <span className="text-sm font-medium text-blue-600">Tài xế</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Xác thực:</span>
                                            <span className="text-sm font-medium text-yellow-600">
                                                Chưa xác thực
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Thông tin tài khoản
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Ngày tham gia:</span>
                                            <span className="font-medium">{selectedDriver.joinDate.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Lần hoạt động cuối:</span>
                                            <span className="font-medium">{selectedDriver.lastActive.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Ngày tạo:</span>
                                            <span className="font-medium">{selectedDriver.createdAt.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Cập nhật cuối:</span>
                                            <span className="font-medium">{selectedDriver.updatedAt.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Gói thuê:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Loại gói:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Giá:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.price.toLocaleString('vi-VN')} VND</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Thời hạn:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.duration} ngày</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Thông tin bổ sung
                                </h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                        <span className="text-sm text-yellow-800">
                                            Thông tin chi tiết về bằng lái, địa chỉ, xe và hoạt động sẽ được cập nhật khi tài xế hoàn thiện hồ sơ.
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Bằng lái:</span>
                                            <span className="font-medium text-slate-400">Chưa cập nhật</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Loại bằng:</span>
                                            <span className="font-medium text-slate-400">Chưa cập nhật</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Địa chỉ:</span>
                                            <span className="font-medium text-slate-400">Chưa cập nhật</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Thành phố:</span>
                                            <span className="font-medium text-slate-400">Chưa cập nhật</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Xe:</span>
                                            <span className="font-medium text-slate-400">Chưa cập nhật</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Biển số:</span>
                                            <span className="font-medium text-slate-400">Chưa cập nhật</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Lượt đổi pin:</span>
                                            <span className="font-medium text-slate-400">0</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Đánh giá:</span>
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-slate-400">Chưa có</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDetailsModalOpen(false)}
                            className="hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm"
                        >
                            Đóng
                        </Button>
                        {selectedDriver && (
                            <Button
                                onClick={() => selectedDriver.status === 'ACTIVE' ? handleSuspendDriver(selectedDriver) : handleActivateDriver(selectedDriver)}
                                disabled={suspendingDriverId === selectedDriver.id || activatingDriverId === selectedDriver.id}
                                className={`${selectedDriver.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700' : 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700'} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg`}
                            >
                                {suspendingDriverId === selectedDriver.id ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Đang tạm khóa..." />
                                ) : activatingDriverId === selectedDriver.id ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Đang kích hoạt..." />
                                ) : (
                                    selectedDriver.status === 'ACTIVE' ? 'Tạm khóa' : 'Kích hoạt'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Driver Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Plus className="h-6 w-6" />
                            Thêm tài xế mới
                        </DialogTitle>
                        <DialogDescription>
                            Nhập thông tin tài xế để thêm vào hệ thống
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông tin cá nhân
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Họ và tên *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nhập họ và tên"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Nhập email"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Số điện thoại *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="Nhập số điện thoại"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Nhập địa chỉ"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">Thành phố</Label>
                                    <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn thành phố" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                            <SelectItem value="TP.HCM">TP.HCM</SelectItem>
                                            <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                            <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* License Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Thông tin bằng lái
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="licenseNumber">Số bằng lái *</Label>
                                    <Input
                                        id="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                        placeholder="Nhập số bằng lái"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="licenseType">Loại bằng lái *</Label>
                                    <Select value={formData.licenseType} onValueChange={(value) => setFormData(prev => ({ ...prev, licenseType: value }))}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn loại bằng lái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A1">A1 - Xe máy dưới 175cc</SelectItem>
                                            <SelectItem value="A2">A2 - Xe máy trên 175cc</SelectItem>
                                            <SelectItem value="B1">B1 - Ô tô số tự động</SelectItem>
                                            <SelectItem value="B2">B2 - Ô tô số sàn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Thông tin phương tiện
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="vehicleModel">Model xe</Label>
                                    <Input
                                        id="vehicleModel"
                                        value={formData.vehicleModel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                                        placeholder="Nhập model xe"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vehiclePlate">Biển số xe</Label>
                                    <Input
                                        id="vehiclePlate"
                                        value={formData.vehiclePlate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                                        placeholder="Nhập biển số xe"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subscription Plan */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Gói thuê
                            </h3>
                            <div>
                                <Label htmlFor="subscriptionPlan">Chọn gói thuê *</Label>
                                <Select value={formData.subscriptionPlan} onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionPlan: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Chọn gói thuê" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockSubscriptionPlans.map(plan => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.name} - {plan.price.toLocaleString('vi-VN')} VND
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isSubmitting}
                            className="hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm disabled:opacity-50"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700 transition-all duration-200 hover:shadow-lg"
                        >
                            {isSubmitting ? (
                                <ButtonLoadingSpinner size="sm" variant="white" text="Đang thêm..." />
                            ) : (
                                'Thêm tài xế'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCancelAction}
                onConfirm={handleConfirmAction}
                title={`Xác nhận ${actionType === 'suspend' ? 'tạm khóa' : 'kích hoạt'} tài xế`}
                message={
                    <div>
                        Bạn có chắc chắn muốn {actionType === 'suspend' ? 'tạm khóa' : 'kích hoạt'} tài xế <span className="font-bold text-slate-800">{targetDriver?.name}</span>?
                    </div>
                }
                confirmText={actionType === 'suspend' ? 'Tạm khóa' : 'Kích hoạt'}
                type="delete"
                isLoading={suspendingDriverId === targetDriver?.id || activatingDriverId === targetDriver?.id}
            />
        </div>
    );
};
