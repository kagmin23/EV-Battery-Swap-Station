import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    TrendingUp,
    Users,
    Clock,
    Car,
    Star,
    CreditCard,
    UserCheck,
    Battery,
    MapPin,
    AlertCircle,
    RefreshCw,
    DollarSign,
    FileText,
    MessageSquareText,
    Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminService } from '@/services/api/adminService';
import { StationService } from '@/services/api/stationService';
import { StaffService } from '@/services/api/staffService';
import { TransactionService } from '@/services/api/transactionService';
import { OverviewCharts } from '../components/OverviewCharts';

interface OverviewStats {
    totalStations: number;
    totalStaff: number;
    totalDrivers: number;
    totalTransactions: number;
    totalRevenue: number;
    pendingComplaints: number;
    activeBatteries: number;
}

interface DetailedStats {
    activeStations: number;
    maintenanceStations: number;
    activeStaff: number;
    suspendedStaff: number;
    totalComplaints: number;
    resolvedComplaints: number;
    averageTransactionCost: number;
}

export const OverviewPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<OverviewStats>({
        totalStations: 0,
        totalStaff: 0,
        totalDrivers: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        pendingComplaints: 0,
        activeBatteries: 0
    });
    const [detailedStats, setDetailedStats] = useState<DetailedStats>({
        activeStations: 0,
        maintenanceStations: 0,
        activeStaff: 0,
        suspendedStaff: 0,
        totalComplaints: 0,
        resolvedComplaints: 0,
        averageTransactionCost: 0
    });
    const [chartData, setChartData] = useState({
        stations: { labels: ['Trạm'], active: [0], maintenance: [0] },
        staff: { labels: ['Hoạt động', 'Tạm khóa'], data: [0, 0] },
        complaints: { labels: ['Khiếu nại'], pending: [0], resolved: [0] }
    });

    const loadOverviewData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch data from multiple APIs in parallel
            const [stations, staff, complaints, transactions] = await Promise.all([
                StationService.getAllStations().catch(() => []),
                StaffService.getAllStaff().catch(() => []),
                AdminService.getAllComplaints().catch(() => []),
                TransactionService.getAllTransactions({}).catch(() => ({ data: [] }))
            ]);

            // Calculate detailed stats
            const activeComplaints = complaints.filter((c: any) => c.status === 'pending');
            const resolvedComplaints = complaints.filter((c: any) => c.status === 'resolved');
            const totalRevenue = transactions.data.reduce((sum: number, t: any) => sum + (t.cost || 0), 0);
            const averageTransactionCost = transactions.data.length > 0 ? totalRevenue / transactions.data.length : 0;

            // Station stats
            const activeStations = stations.filter((s: any) => s.status === 'ACTIVE').length;
            const maintenanceStations = stations.filter((s: any) => s.status === 'MAINTENANCE').length;

            // Staff stats
            const activeStaff = staff.filter((s: any) => s.status === 'active').length;
            const suspendedStaff = staff.filter((s: any) => s.status === 'locked').length;

            setStats({
                totalStations: stations.length,
                totalStaff: staff.length,
                totalDrivers: 0, // Would need driver service
                totalTransactions: transactions.data.length,
                totalRevenue,
                pendingComplaints: activeComplaints.length,
                activeBatteries: 0 // Would need battery service
            });

            // Set detailed stats for display
            setDetailedStats({
                activeStations,
                maintenanceStations,
                activeStaff,
                suspendedStaff,
                totalComplaints: complaints.length,
                resolvedComplaints: resolvedComplaints.length,
                averageTransactionCost
            });

            // Set chart data
            setChartData({
                stations: {
                    labels: ['Tổng số'],
                    active: [activeStations],
                    maintenance: [maintenanceStations]
                },
                staff: {
                    labels: ['Hoạt động', 'Tạm khóa'],
                    data: [activeStaff, suspendedStaff]
                },
                complaints: {
                    labels: ['Khiếu nại'],
                    pending: [activeComplaints.length],
                    resolved: [resolvedComplaints.length]
                }
            });

            toast.success('Tải dữ liệu tổng quan thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu tổng quan';
            setError(errorMessage);
            console.error('Error loading overview:', err);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOverviewData();
    }, []);

    if (isLoading) {
        return <PageLoadingSpinner text="Đang tải dữ liệu tổng quan..." />;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">{error}</span>
                    </div>
                    <button
                        onClick={loadOverviewData}
                        className="px-4 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tổng quan hệ thống</h1>
                    <p className="text-slate-600 mt-2">Thống kê và phân tích dữ liệu tổng thể</p>
                </div>
                <button
                    onClick={loadOverviewData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Tổng số trạm</CardTitle>
                            <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{stats.totalStations}</div>
                        <p className="text-sm text-slate-600 mt-2">Trạm đổi pin</p>
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Hoạt động: {detailedStats.activeStations}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Bảo trì: {detailedStats.maintenanceStations}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Tổng nhân viên</CardTitle>
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{stats.totalStaff}</div>
                        <p className="text-sm text-slate-600 mt-2">Nhân viên hệ thống</p>
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-green-200">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Hoạt động: {detailedStats.activeStaff}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Tạm khóa: {detailedStats.suspendedStaff}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Tổng giao dịch</CardTitle>
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">{stats.totalTransactions}</div>
                        <p className="text-sm text-slate-600 mt-2">Giao dịch đổi pin</p>
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-purple-200">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-xs text-slate-600">
                                TB: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(detailedStats.averageTransactionCost)}/giao dịch
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Khiếu nại</CardTitle>
                            <MessageSquareText className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">{stats.pendingComplaints}</div>
                        <p className="text-sm text-slate-600 mt-2">Chờ xử lý</p>
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-orange-200">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Chờ: {stats.pendingComplaints}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Đã xử lý: {detailedStats.resolvedComplaints}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue and Transaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Tổng doanh thu</CardTitle>
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                                notation: 'compact'
                            }).format(stats.totalRevenue)}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Từ các giao dịch</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Trung bình / giao dịch</CardTitle>
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-900">
                            {stats.totalTransactions > 0
                                ? new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    notation: 'compact'
                                }).format(stats.totalRevenue / stats.totalTransactions)
                                : '0'}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Chi phí trung bình</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <Battery className="h-6 w-6 mr-2 text-blue-600" />
                            Kho pin
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">Quản lý kho pin</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <UserCheck className="h-6 w-6 mr-2 text-green-600" />
                            Quản lý nhân viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">Quản lý đội ngũ nhân viên</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <Brain className="h-6 w-6 mr-2 text-purple-600" />
                            Dự đoán AI
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">Xem dự đoán và đề xuất</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Biểu đồ thống kê</h2>
                <OverviewCharts
                    stationsData={chartData.stations}
                    staffData={chartData.staff}
                    complaintsData={chartData.complaints}
                />
            </div>
        </div>
    );
};
