import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { Activity, Users, Clock, Star, CreditCard, Car } from 'lucide-react';
import type { DriverStats, DriverActivity } from '../types/driver';

// Mock data - trong thực tế sẽ lấy từ API
// const mockDrivers: Driver[] = [
//     {
//         id: '1',
//         name: 'Nguyễn Văn A',
//         email: 'nguyenvana@example.com',
//         phone: '0123456789',
//         licenseNumber: 'A123456789',
//         licenseType: 'A2',
//         status: 'ACTIVE',
//         subscriptionPlan: {
//             id: '1',
//             name: 'Gói Premium',
//             type: 'PREMIUM',
//             price: 299000,
//             currency: 'VND',
//             duration: 30,
//             maxSwapsPerMonth: 50,
//             features: ['Đổi pin không giới hạn', 'Ưu tiên tại trạm', 'Hỗ trợ 24/7'],
//             isActive: true,
//             startDate: new Date('2024-01-01'),
//             endDate: new Date('2024-01-31')
//         },
//         vehicleId: 'v1',
//         vehicleModel: 'VinFast VF8',
//         vehiclePlate: '30A-12345',
//         totalSwaps: 45,
//         totalDistance: 2500,
//         rating: 4.8,
//         joinDate: new Date('2024-01-01'),
//         lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
//         address: '123 Đường ABC, Quận 1',
//         city: 'TP.HCM',
//         emergencyContact: {
//             name: 'Nguyễn Thị B',
//             phone: '0987654321',
//             relationship: 'Vợ'
//         },
//         preferences: {
//             preferredStations: ['station-1', 'station-2'],
//             notificationSettings: {
//                 email: true,
//                 sms: true,
//                 push: true
//             },
//             language: 'vi',
//             timezone: 'Asia/Ho_Chi_Minh'
//         },
//         createdAt: new Date('2024-01-01'),
//         updatedAt: new Date('2024-01-15')
//     },
//     {
//         id: '2',
//         name: 'Trần Thị B',
//         email: 'tranthib@example.com',
//         phone: '0987654321',
//         licenseNumber: 'B987654321',
//         licenseType: 'B2',
//         status: 'ACTIVE',
//         subscriptionPlan: {
//             id: '2',
//             name: 'Gói Basic',
//             type: 'BASIC',
//             price: 199000,
//             currency: 'VND',
//             duration: 30,
//             maxSwapsPerMonth: 20,
//             features: ['Đổi pin cơ bản', 'Hỗ trợ qua email'],
//             isActive: true,
//             startDate: new Date('2024-01-05'),
//             endDate: new Date('2024-02-05')
//         },
//         vehicleId: 'v2',
//         vehicleModel: 'Tesla Model 3',
//         vehiclePlate: '29B-67890',
//         totalSwaps: 18,
//         totalDistance: 1200,
//         rating: 4.5,
//         joinDate: new Date('2024-01-05'),
//         lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
//         address: '456 Đường XYZ, Quận 2',
//         city: 'TP.HCM',
//         emergencyContact: {
//             name: 'Trần Văn C',
//             phone: '0369258147',
//             relationship: 'Anh trai'
//         },
//         preferences: {
//             preferredStations: ['station-2'],
//             notificationSettings: {
//                 email: true,
//                 sms: false,
//                 push: true
//             },
//             language: 'vi',
//             timezone: 'Asia/Ho_Chi_Minh'
//         },
//         createdAt: new Date('2024-01-05'),
//         updatedAt: new Date('2024-01-10')
//     }
// ];

const mockActivities: DriverActivity[] = [
    {
        id: '1',
        driverId: '1',
        type: 'BATTERY_SWAP',
        description: 'Đổi pin tại trạm VinFast Quận 1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        stationId: 'station-1',
        batteryId: 'battery-123',
        amount: 50000,
        currency: 'VND'
    },
    {
        id: '2',
        driverId: '2',
        type: 'SUBSCRIPTION_CHANGE',
        description: 'Nâng cấp lên gói Premium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        amount: 299000,
        currency: 'VND'
    },
    {
        id: '3',
        driverId: '1',
        type: 'PAYMENT',
        description: 'Thanh toán gói thuê tháng 1',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        amount: 299000,
        currency: 'VND'
    }
];

const mockStats: DriverStats = {
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
    recentActivities: mockActivities
};

export const DriverOverviewPage: React.FC = () => {
    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Tổng quan tài xế"
                description="Thống kê và phân tích dữ liệu tài xế"
                showBackButton={false}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng số tài xế"
                    value={mockStats.totalDrivers.toLocaleString()}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Tài xế hoạt động"
                    value={mockStats.activeDrivers.toLocaleString()}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Tổng lượt đổi pin"
                    value={mockStats.totalSwaps.toLocaleString()}
                    icon={Car}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
                <StatsCard
                    title="Đánh giá trung bình"
                    value={`${mockStats.averageRating}/5`}
                    icon={Star}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Driver Status Distribution */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                            <Users className="h-6 w-6 mr-2 text-blue-600" />
                            Phân bố trạng thái tài xế
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
                                    {mockStats.activeDrivers.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Không hoạt động</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-600">
                                    {mockStats.inactiveDrivers.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Tạm khóa</span>
                                </div>
                                <span className="text-2xl font-bold text-red-600">
                                    {mockStats.suspendedDrivers.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="font-medium text-slate-700">Chờ xác thực</span>
                                </div>
                                <span className="text-2xl font-bold text-yellow-600">
                                    {mockStats.pendingVerification.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Plans Distribution */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                            <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
                            Phân bố gói thuê
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockStats.driversByPlan.map((plan, index) => {
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
                                        {activity.timestamp.toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                {activity.amount && (
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
