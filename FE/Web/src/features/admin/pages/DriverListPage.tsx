import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Grid, List, Users, Activity, Car, Star, Calendar, User, AlertCircle, ChevronLeft, ChevronRight, UserX } from 'lucide-react';
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
        city: 'ALL',
        limit: '20'
    });
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [suspendingDriverId, setSuspendingDriverId] = useState<string | null>(null);
    const [activatingDriverId, setActivatingDriverId] = useState<string | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'suspend' | 'activate' | null>(null);
    const [targetDriver, setTargetDriver] = useState<Driver | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

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
            // Success message removed to avoid notification spam
        } catch (err) {
            setError('Unable to load driver list. Please try again later.');
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

    // Calculate pagination
    const limitNum = Number(filters.limit) || 20;
    const totalPages = Math.ceil(filteredDrivers.length / limitNum);
    const paginatedDrivers = filteredDrivers.slice(
        (currentPage - 1) * limitNum,
        currentPage * limitNum
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.status, filters.subscriptionPlan, filters.licenseType, filters.city, filters.limit]);

    const handleDriverSelect = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDetailsModalOpen(true);
        onDriverSelect?.(driver);
    };



    const handleSuspendDriver = (driver: Driver) => {
        setTargetDriver(driver);
        setActionType('suspend');
        setSubmitError(null);
        setIsConfirmationModalOpen(true);
    };

    const handleActivateDriver = (driver: Driver) => {
        setTargetDriver(driver);
        setActionType('activate');
        setSubmitError(null);
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!targetDriver || !actionType) return;
        setSubmitError(null);
        try {
            if (actionType === 'suspend') {
                setSuspendingDriverId(targetDriver.id);
                await DriverService.changeDriverStatus(targetDriver.id, 'locked');
                setDrivers(prev => prev.map(d =>
                    d.id === targetDriver.id
                        ? { ...d, status: 'INACTIVE' as const, updatedAt: new Date() }
                        : d
                ));
                toast.success(`Driver "${targetDriver.name}" locked successfully`);
            } else {
                setActivatingDriverId(targetDriver.id);
                await DriverService.changeDriverStatus(targetDriver.id, 'active');
                setDrivers(prev => prev.map(d =>
                    d.id === targetDriver.id
                        ? { ...d, status: 'ACTIVE' as const, updatedAt: new Date() }
                        : d
                ));
                toast.success(`Driver "${targetDriver.name}" activated successfully`);
            }
            setIsConfirmationModalOpen(false);
            setTargetDriver(null);
            setActionType(null);
        } catch (err) {
            const msg = err instanceof Error ? err.message : `Unable to ${actionType === 'suspend' ? 'lock' : 'activate'} driver. Please try again.`;
            setSubmitError(msg);
        } finally {
            setSuspendingDriverId(null);
            setActivatingDriverId(null);
        }
    };

    const handleCancelAction = () => {
        setIsConfirmationModalOpen(false);
        setTargetDriver(null);
        setActionType(null);
        setSubmitError(null);
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
            case 'ACTIVE': return 'Active';
            case 'INACTIVE': return 'Inactive';
            case 'SUSPENDED': return 'Suspended';
            case 'PENDING_VERIFICATION': return 'Pending Verification';
            default: return status;
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Driver List"
                description="Manage driver and vehicle information"
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
                        Close
                    </Button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Drivers"
                    value={drivers.length.toLocaleString()}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Active Drivers"
                    value={drivers.filter(d => d.status === 'ACTIVE').length.toLocaleString()}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Locked Drivers"
                    value={drivers.filter(d => d.status === 'INACTIVE').length.toLocaleString()}
                    icon={UserX}
                    gradientFrom="from-gray-50"
                    gradientTo="to-gray-100/50"
                    textColor="text-gray-900"
                    iconBg="bg-gray-500"
                />
            </div>


            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <DriverSearchBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    subscriptionPlans={mockSubscriptionPlans}
                    isResetting={isResetting}
                    onResetFilters={async () => {
                        setIsResetting(true);
                        setFilters({
                            search: '',
                            status: 'ALL',
                            subscriptionPlan: 'ALL',
                            licenseType: 'ALL',
                            city: 'ALL',
                            limit: '20'
                        });
                        setCurrentPage(1);
                        await new Promise(resolve => setTimeout(resolve, 300));
                        setIsResetting(false);
                    }}
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
                            Driver List
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
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Loading driver list..." />
                    ) : filteredDrivers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No drivers found</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.status !== 'ALL' || filters.subscriptionPlan !== 'ALL' || filters.licenseType !== 'ALL' || filters.city !== 'ALL'
                                    ? 'No drivers found matching the current filters.'
                                    : 'No drivers have been added to the system yet.'}
                            </p>
                            {(!filters.search && filters.status === 'ALL' && filters.subscriptionPlan === 'ALL' && filters.licenseType === 'ALL' && filters.city === 'ALL')}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                            {paginatedDrivers.map((driver) => (
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
                                                <span className="text-sm text-slate-600">Verification status:</span>
                                                <span className="text-sm font-medium text-yellow-600">
                                                    Not verified
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Join date:</span>
                                                <span className="text-sm font-medium">{driver.joinDate.toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Last active:</span>
                                                <span className="text-sm font-medium">{driver.lastActive.toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Subscription:</span>
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
                                                View Details
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
                                                        <ButtonLoadingSpinner size="sm" variant="default" text="Processing..." />
                                                    ) : (
                                                        'Lock'
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
                                                        <ButtonLoadingSpinner size="sm" variant="default" text="Processing..." />
                                                    ) : (
                                                        'Activate'
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
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Driver</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Phone</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Verification</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Join Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Last Active</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedDrivers.map((driver) => (
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
                                                    Not verified
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
                                                        View
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
                                                                <ButtonLoadingSpinner size="sm" variant="default" text="Processing..." />
                                                            ) : (
                                                                'Lock'
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
                                                                <ButtonLoadingSpinner size="sm" variant="default" text="Processing..." />
                                                            ) : (
                                                                'Activate'
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

            {/* Pagination - copied logic/markup from StaffListPage */}
            {filteredDrivers.length > 0 && (
                <div className="flex flex-col items-center py-4 gap-3">
                    <nav className="flex items-center -space-x-px" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || totalPages === 1}
                            className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-s-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:block">Previous</span>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i === 4 ? totalPages : i + 1;
                                if (i === 3) {
                                    return (
                                        <React.Fragment key={`fragment-${i}`}>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                            <button
                                                key={totalPages}
                                                type="button"
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === totalPages
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
                                            >
                                                {totalPages}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                            } else if (currentPage >= totalPages - 2) {
                                if (i === 0) {
                                    return (
                                        <React.Fragment key={`fragment-start-${i}`}>
                                            <button
                                                key={1}
                                                type="button"
                                                onClick={() => setCurrentPage(1)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === 1
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
                                            >
                                                1
                                            </button>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                        </React.Fragment>
                                    );
                                }
                                pageNum = totalPages - 4 + i;
                            } else {
                                if (i === 0) {
                                    return (
                                        <React.Fragment key={`fragment-mid-start`}>
                                            <button
                                                key={1}
                                                type="button"
                                                onClick={() => setCurrentPage(1)}
                                                className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                1
                                            </button>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                        </React.Fragment>
                                    );
                                } else if (i === 4) {
                                    return (
                                        <React.Fragment key={`fragment-mid-end`}>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                            <button
                                                key={totalPages}
                                                type="button"
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                {totalPages}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                                pageNum = currentPage + i - 2;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === pageNum
                                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
                                    aria-current={currentPage === pageNum ? "page" : undefined}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 1}
                            className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-e-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next"
                        >
                            <span className="hidden sm:block">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </nav>
                    {/* Items info */}
                    <div className="text-sm text-gray-800">
                        Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * limitNum + 1}</span> to {" "}
                        <span className="font-semibold text-slate-900">{Math.min(currentPage * limitNum, filteredDrivers.length)}</span> of {" "}
                        <span className="font-semibold text-slate-900">{filteredDrivers.length}</span> results
                    </div>
                </div>
            )}

            {/* Driver Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Driver Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed information about driver {selectedDriver?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDriver && (
                        <div className="py-4 space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
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
                                            <span className="text-slate-600">Status:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDriver.status)}`}>
                                                {getStatusText(selectedDriver.status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Role:</span>
                                            <span className="text-sm font-medium text-blue-600">Driver</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Verification:</span>
                                            <span className="text-sm font-medium text-yellow-600">
                                                Not verified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Account Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Join date:</span>
                                            <span className="font-medium">{selectedDriver.joinDate.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Last active:</span>
                                            <span className="font-medium">{selectedDriver.lastActive.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Created date:</span>
                                            <span className="font-medium">{selectedDriver.createdAt.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Last updated:</span>
                                            <span className="font-medium">{selectedDriver.updatedAt.toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Subscription:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Plan type:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Price:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.price.toLocaleString('vi-VN')} VND</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Duration:</span>
                                            <span className="font-medium">{selectedDriver.subscriptionPlan.duration} days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Additional Information
                                </h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                        <span className="text-sm text-yellow-800">
                                            Detailed information about driver's license, address, vehicle and activity will be updated when the driver completes their profile.
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">License:</span>
                                            <span className="font-medium text-slate-400">Not updated</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">License type:</span>
                                            <span className="font-medium text-slate-400">Not updated</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Address:</span>
                                            <span className="font-medium text-slate-400">Not updated</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">City:</span>
                                            <span className="font-medium text-slate-400">Not updated</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Vehicle:</span>
                                            <span className="font-medium text-slate-400">Not updated</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Plate number:</span>
                                            <span className="font-medium text-slate-400">Not updated</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Total swaps:</span>
                                            <span className="font-medium text-slate-400">0</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Rating:</span>
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-slate-400">None</span>
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
                            Close
                        </Button>
                        {selectedDriver && (
                            <Button
                                onClick={() => selectedDriver.status === 'ACTIVE' ? handleSuspendDriver(selectedDriver) : handleActivateDriver(selectedDriver)}
                                disabled={suspendingDriverId === selectedDriver.id || activatingDriverId === selectedDriver.id}
                                className={`${selectedDriver.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700' : 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700'} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg`}
                            >
                                {suspendingDriverId === selectedDriver.id ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Locking..." />
                                ) : activatingDriverId === selectedDriver.id ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Activating..." />
                                ) : (
                                    selectedDriver.status === 'ACTIVE' ? 'Lock' : 'Activate'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCancelAction}
                onConfirm={handleConfirmAction}
                title={`Confirm ${actionType === 'suspend' ? 'lock' : 'activate'} driver`}
                message={
                    <div>
                        Are you sure you want to {actionType === 'suspend' ? 'lock' : 'activate'} driver <span className="font-bold text-slate-800">{targetDriver?.name}</span>?
                        {submitError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-3 mb-1 rounded-lg">
                                <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                                <span className="font-medium">{submitError}</span>
                            </div>
                        )}
                    </div>
                }
                confirmText={actionType === 'suspend' ? 'Lock' : 'Activate'}
                type="delete"
                isLoading={suspendingDriverId === targetDriver?.id || activatingDriverId === targetDriver?.id}
            />
        </div>
    );
};
