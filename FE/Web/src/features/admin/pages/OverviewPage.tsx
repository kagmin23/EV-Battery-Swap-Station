import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { Activity, TrendingUp, Users, Clock, Car, Star, CreditCard, UserCheck } from 'lucide-react';
import type { StaffStats, StaffActivity } from '../types/staff';
import type { DriverStats, DriverActivity } from '../types/driver';

// Mock data - trong thực tế sẽ lấy từ API
const mockStaffStats: StaffStats = {
    totalStaff: 45,
    onlineStaff: 32,
    shiftActiveStaff: 28,
    suspendedStaff: 2,
    staffByStation: [
        { stationId: '1', stationName: 'Trạm Hà Nội', count: 20 },
        { stationId: '2', stationName: 'Trạm TP.HCM', count: 15 },
        { stationId: '3', stationName: 'Trạm Đà Nẵng', count: 10 }
    ],
    recentActivities: []
};

const mockDriverStats: DriverStats = {
    totalDrivers: 1250,
    activeDrivers: 1100,
    inactiveDrivers: 100,
    suspendedDrivers: 30,
    pendingVerification: 20,
    driversByPlan: [
        { planId: '1', planName: 'Premium', count: 400 },
        { planId: '2', planName: 'Basic', count: 600 },
        { planId: '3', planName: 'Unlimited', count: 100 }
    ],
    driversByCity: [
        { city: 'TP.HCM', count: 600 },
        { city: 'Hà Nội', count: 400 },
        { city: 'Đà Nẵng', count: 150 },
        { city: 'Khác', count: 100 }
    ],
    totalSwaps: 15680,
    averageRating: 4.6,
    recentActivities: []
};

const mockActivities: (StaffActivity | DriverActivity)[] = [
    {
        id: '1',
        staffId: '1',
        type: 'BATTERY_SWAP',
        description: 'Nhân viên Nguyễn Văn A thực hiện đổi pin cho xe ABC-123',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        stationId: '1',
        customerId: 'customer-1',
        batteryId: 'battery-1',
    },
    {
        id: '2',
        driverId: '1',
        type: 'BATTERY_SWAP',
        description: 'Tài xế Trần Thị B đổi pin tại trạm VinFast Quận 1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        stationId: 'station-1',
        batteryId: 'battery-123',
        amount: 50000,
        currency: 'VND'
    },
    {
        id: '3',
        staffId: '2',
        type: 'PAYMENT',
        description: 'Nhân viên Lê Văn C xử lý thanh toán cho giao dịch #12345',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        stationId: '1',
        customerId: 'customer-2',
    }
];

export const OverviewPage: React.FC = () => {
    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Tổng quan hệ thống"
                description="Thống kê và phân tích dữ liệu tổng thể"
                showBackButton={false}
            />

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng nhân viên"
                    value={mockStaffStats.totalStaff.toLocaleString()}
                    icon={Users}
                    gradientFrom="from-blue-500"
                    gradientTo="to-blue-600"
                    textColor="text-white"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Tổng tài xế"
                    value={mockDriverStats.totalDrivers.toLocaleString()}
                    icon={UserCheck}
                    gradientFrom="from-green-500"
                    gradientTo="to-green-600"
                    textColor="text-white"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Tổng lượt đổi pin"
                    value={mockDriverStats.totalSwaps.toLocaleString()}
                    icon={Car}
                    gradientFrom="from-purple-500"
                    gradientTo="to-purple-600"
                    textColor="text-white"
                    iconBg="bg-purple-500"
                />
                <StatsCard
                    title="Đánh giá trung bình"
                    value={`${mockDriverStats.averageRating}/5`}
                    icon={Star}
                    gradientFrom="from-orange-500"
                    gradientTo="to-orange-600"
                    textColor="text-white"
                    iconBg="bg-orange-500"
                />
            </div>

            {/* Staff and Driver Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Staff Status */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                            <Users className="h-6 w-6 mr-2 text-blue-600" />
                            Trạng thái nhân viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Đang online</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">
                                    {mockStaffStats.onlineStaff.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Đang ca</span>
                                </div>
                                <span className="text-2xl font-bold text-blue-600">
                                    {mockStaffStats.shiftActiveStaff.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Tạm khóa</span>
                                </div>
                                <span className="text-2xl font-bold text-red-600">
                                    {mockStaffStats.suspendedStaff.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Driver Status */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                            <UserCheck className="h-6 w-6 mr-2 text-green-600" />
                            Trạng thái tài xế
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Hoạt động</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">
                                    {mockDriverStats.activeDrivers.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Không hoạt động</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-600">
                                    {mockDriverStats.inactiveDrivers.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Chờ xác thực</span>
                                </div>
                                <span className="text-2xl font-bold text-yellow-600">
                                    {mockDriverStats.pendingVerification.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Staff by Station */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                            Phân bố nhân viên theo trạm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockStaffStats.staffByStation.map((station, index) => {
                                const colors = [
                                    'bg-blue-500',
                                    'bg-green-500',
                                    'bg-purple-500',
                                    'bg-orange-500'
                                ];
                                const bgColors = [
                                    'bg-blue-50',
                                    'bg-green-50',
                                    'bg-purple-50',
                                    'bg-orange-50'
                                ];
                                const textColors = [
                                    'text-blue-600',
                                    'text-green-600',
                                    'text-purple-600',
                                    'text-orange-600'
                                ];

                                return (
                                    <div key={station.stationId} className={`flex items-center justify-between p-4 ${bgColors[index]} rounded-lg`}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
                                            <span className="font-medium text-slate-700">{station.stationName}</span>
                                        </div>
                                        <span className={`text-2xl font-bold ${textColors[index]}`}>
                                            {station.count.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Driver Subscription Plans */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                            <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
                            Phân bố gói thuê tài xế
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockDriverStats.driversByPlan.map((plan, index) => {
                                const colors = [
                                    'bg-blue-500',
                                    'bg-green-500',
                                    'bg-purple-500',
                                    'bg-orange-500'
                                ];
                                const bgColors = [
                                    'bg-blue-50',
                                    'bg-green-50',
                                    'bg-purple-50',
                                    'bg-orange-50'
                                ];
                                const textColors = [
                                    'text-blue-600',
                                    'text-green-600',
                                    'text-purple-600',
                                    'text-orange-600'
                                ];

                                return (
                                    <div key={plan.planId} className={`flex items-center justify-between p-4 ${bgColors[index]} rounded-lg`}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
                                            <span className="font-medium text-slate-700">{plan.planName}</span>
                                        </div>
                                        <span className={`text-2xl font-bold ${textColors[index]}`}>
                                            {plan.count.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                        <Clock className="h-6 w-6 mr-2 text-indigo-600" />
                        Hoạt động gần đây
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{activity.description}</p>
                                    <p className="text-sm text-slate-500">
                                        {new Intl.DateTimeFormat('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }).format(activity.timestamp)}
                                    </p>
                                </div>
                                {'amount' in activity && activity.amount && (
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">
                                            +{activity.amount.toLocaleString()} {activity.currency}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
