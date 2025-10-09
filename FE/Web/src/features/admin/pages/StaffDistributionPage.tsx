import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffDistributionChart } from '../components/StaffDistributionChart';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { BarChart3, MapPin, Users, TrendingUp } from 'lucide-react';
import type { Staff, StaffStats } from '../types/staff';

// Mock data - trong thực tế sẽ lấy từ API
const mockStaff: Staff[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        role: 'MANAGER',
        stationId: '1',
        stationName: 'Trạm Hà Nội',
        status: 'ONLINE',
        permissions: [],
        lastActive: new Date(Date.now() - 5 * 60 * 1000),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0987654321',
        role: 'SUPERVISOR',
        stationId: '1',
        stationName: 'Trạm Hà Nội',
        status: 'SHIFT_ACTIVE',
        permissions: [],
        lastActive: new Date(Date.now() - 2 * 60 * 1000),
        shiftStart: new Date(Date.now() - 8 * 60 * 60 * 1000),
        shiftEnd: new Date(Date.now() + 4 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10'),
    },
    {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0369258147',
        role: 'STAFF',
        stationId: '2',
        stationName: 'Trạm TP.HCM',
        status: 'OFFLINE',
        permissions: [],
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
    },
    {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0369258148',
        role: 'STAFF',
        stationId: '2',
        stationName: 'Trạm TP.HCM',
        status: 'ONLINE',
        permissions: [],
        lastActive: new Date(Date.now() - 1 * 60 * 1000),
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-14'),
    },
    {
        id: '5',
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0369258149',
        role: 'SUPERVISOR',
        stationId: '3',
        stationName: 'Trạm Đà Nẵng',
        status: 'OFFLINE',
        permissions: [],
        lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-13'),
    },
];

const mockStats: StaffStats = {
    totalStaff: mockStaff.length,
    onlineStaff: mockStaff.filter(s => s.status === 'ONLINE').length,
    shiftActiveStaff: mockStaff.filter(s => s.status === 'SHIFT_ACTIVE').length,
    suspendedStaff: mockStaff.filter(s => s.status === 'SUSPENDED').length,
    staffByStation: [
        { stationId: '1', stationName: 'Trạm Hà Nội', count: 2 },
        { stationId: '2', stationName: 'Trạm TP.HCM', count: 2 },
        { stationId: '3', stationName: 'Trạm Đà Nẵng', count: 1 },
    ],
    recentActivities: [],
};

export const StaffDistributionPage: React.FC = () => {
    // Tính toán thống kê phân bố
    const staffByRole = mockStaff.reduce((acc, staff) => {
        acc[staff.role] = (acc[staff.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // const staffByStatus = mockStaff.reduce((acc, staff) => {
    //     acc[staff.status] = (acc[staff.status] || 0) + 1;
    //     return acc;
    // }, {} as Record<string, number>);

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Phân bố nhân viên"
                description="Phân tích và thống kê phân bố nhân viên theo trạm và vai trò"
            />

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng nhân viên"
                    value={mockStats.totalStaff}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Trạm hoạt động"
                    value={mockStats.staffByStation.length}
                    icon={MapPin}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Tỷ lệ online"
                    value={`${Math.round((mockStats.onlineStaff / mockStats.totalStaff) * 100)}%`}
                    icon={TrendingUp}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="TB/Trạm"
                    value={Math.round(mockStats.totalStaff / mockStats.staffByStation.length)}
                    icon={BarChart3}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Staff Distribution by Station */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Phân bố theo trạm</h3>
                        </div>
                        <StaffDistributionChart stats={mockStats} />
                    </div>
                </div>

                {/* Staff Distribution by Role */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Phân bố theo vai trò</h3>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(staffByRole).map(([role, count]) => (
                                <div key={role} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-slate-800">
                                            {role === 'MANAGER' ? 'Quản lý' :
                                                role === 'SUPERVISOR' ? 'Giám sát' :
                                                    role === 'STAFF' ? 'Nhân viên' : role}
                                        </div>
                                        <div className="text-sm text-slate-500">Vai trò</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-2xl font-bold text-green-600">{count}</div>
                                        <div className="text-sm text-slate-500">người</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Station Information */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                        <div className="p-2 bg-blue-100 rounded-xl mr-3">
                            <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        Chi tiết từng trạm
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockStats.staffByStation.map((station) => {
                            const stationStaff = mockStaff.filter(s => s.stationId === station.stationId);
                            const onlineCount = stationStaff.filter(s => s.status === 'ONLINE').length;
                            const shiftActiveCount = stationStaff.filter(s => s.status === 'SHIFT_ACTIVE').length;

                            return (
                                <div key={station.stationId} className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-200/50">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">{station.stationName}</h4>
                                            <p className="text-sm text-slate-500">ID: {station.stationId}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-600">Tổng nhân viên:</span>
                                                <span className="font-bold text-slate-800">{station.count}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-600">Đang online:</span>
                                                <span className="font-bold text-green-600">{onlineCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-600">Đang ca:</span>
                                                <span className="font-bold text-orange-600">{shiftActiveCount}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/50">
                                            <div className="text-xs text-slate-500">
                                                Tỷ lệ hoạt động: {Math.round(((onlineCount + shiftActiveCount) / station.count) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
