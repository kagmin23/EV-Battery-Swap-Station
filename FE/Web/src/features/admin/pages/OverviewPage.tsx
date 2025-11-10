import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    Users,
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
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminService, type FeedbackItem } from '@/services/api/adminService';
import { StationService } from '@/services/api/stationService';
import type { Station } from '@/services/api/stationService';
import { StaffService } from '@/services/api/staffService';
import type { Staff } from '@/services/api/staffService';
import { TransactionService } from '@/services/api/transactionService';
import type { Transaction, TransactionResponse } from '@/services/api/transactionService';
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
    const navigate = useNavigate();
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
        stations: { labels: ['Stations'], active: [0], maintenance: [0] },
        staff: { labels: ['Active', 'Suspended'], data: [0, 0] },
        complaints: { labels: ['Complaints'], pending: [0], resolved: [0] }
    });

    const handleNavigateToAIForecast = () => {
        navigate('/admin/ai-forecast');
    };

    const loadOverviewData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch data from multiple APIs in parallel
            const [stations, staff, feedbacks, transactionsResponse] = await Promise.all([
                StationService.getAllStations().catch((): Station[] => []),
                StaffService.getAllStaff().catch((): Staff[] => []),
                AdminService.getFeedbacks().catch((): FeedbackItem[] => []),
                TransactionService.getAllTransactions({}).catch(
                    (): TransactionResponse => ({ success: false, data: [] as Transaction[] })
                )
            ]);

            const stationsWithStatus = stations as Array<Station & { status?: string }>;
            const activeStations = stationsWithStatus.filter((station) => station.status === 'ACTIVE').length;
            const maintenanceStations = stationsWithStatus.filter((station) => station.status === 'MAINTENANCE').length;

            const activeStaffCount = staff.filter((staffMember) => staffMember.status === 'active').length;
            const suspendedStaffCount = staff.filter((staffMember) => staffMember.status === 'locked').length;

            const transactionsData: Transaction[] = transactionsResponse.data ?? [];
            const totalRevenue = transactionsData.reduce(
                (sum: number, transaction) => sum + (transaction.cost || 0),
                0
            );
            const averageTransactionCost =
                transactionsData.length > 0 ? totalRevenue / transactionsData.length : 0;

            const resolvedComplaints = feedbacks.filter(
                (feedback) => feedback.booking?.status === 'resolved'
            );
            const activeComplaints = feedbacks.filter(
                (feedback) => feedback.booking?.status !== 'resolved'
            );

            setStats({
                totalStations: stations.length,
                totalStaff: staff.length,
                totalDrivers: 0, // Would need driver service
                totalTransactions: transactionsData.length,
                totalRevenue,
                pendingComplaints: activeComplaints.length,
                activeBatteries: 0 // Would need battery service
            });

            // Set detailed stats for display
            setDetailedStats({
                activeStations,
                maintenanceStations,
                activeStaff: activeStaffCount,
                suspendedStaff: suspendedStaffCount,
                totalComplaints: feedbacks.length,
                resolvedComplaints: resolvedComplaints.length,
                averageTransactionCost
            });

            // Set chart data
            setChartData({
                stations: {
                    labels: ['Total'],
                    active: [activeStations],
                    maintenance: [maintenanceStations]
                },
                staff: {
                    labels: ['Active', 'Suspended'],
                    data: [activeStaffCount, suspendedStaffCount]
                },
                complaints: {
                    labels: ['Complaints'],
                    pending: [activeComplaints.length],
                    resolved: [resolvedComplaints.length]
                }
            });

            toast.success('Successfully loaded overview data');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error loading overview data';
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
        return <PageLoadingSpinner text="Loading overview data..." />;
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
                        Retry
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
                    <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
                    <p className="text-slate-600 mt-2">Statistics and overall data analysis</p>
                </div>
                <button
                    onClick={loadOverviewData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Total Stations</CardTitle>
                            <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{stats.totalStations}</div>
                        <p className="text-sm text-slate-600 mt-2">Battery swap stations</p>
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Active: {detailedStats.activeStations}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Maintenance: {detailedStats.maintenanceStations}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Total Staff</CardTitle>
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{stats.totalStaff}</div>
                        <p className="text-sm text-slate-600 mt-2">System staff</p>
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-green-200">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Active: {detailedStats.activeStaff}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Suspended: {detailedStats.suspendedStaff}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Total Transactions</CardTitle>
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">{stats.totalTransactions}</div>
                        <p className="text-sm text-slate-600 mt-2">Battery swap transactions</p>
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-purple-200">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-xs text-slate-600">
                                Avg: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', notation: 'compact' }).format(detailedStats.averageTransactionCost)}/transaction
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Complaints</CardTitle>
                            <MessageSquareText className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">{stats.pendingComplaints}</div>
                        <p className="text-sm text-slate-600 mt-2">Pending</p>
                        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-orange-200">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Pending: {stats.pendingComplaints}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-600">Resolved: {detailedStats.resolvedComplaints}</span>
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
                            <CardTitle className="text-slate-700 text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'VND',
                                notation: 'compact'
                            }).format(stats.totalRevenue)}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">From transactions</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Average / Transaction</CardTitle>
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-900">
                            {stats.totalTransactions > 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'VND',
                                    notation: 'compact'
                                }).format(stats.totalRevenue / stats.totalTransactions)
                                : '0'}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Average cost</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <Battery className="h-6 w-6 mr-2 text-blue-600" />
                            Battery Inventory
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">Manage battery inventory</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <UserCheck className="h-6 w-6 mr-2 text-green-600" />
                            Staff Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">Manage staff team</p>
                    </CardContent>
                </Card>

                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200"
                    onClick={handleNavigateToAIForecast}
                    role="button"
                >
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                            <Brain className="h-6 w-6 mr-2 text-purple-600" />
                            AI Predictions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">View predictions and suggestions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Statistics Charts</h2>
                <OverviewCharts
                    stationsData={chartData.stations}
                    staffData={chartData.staff}
                    complaintsData={chartData.complaints}
                />
            </div>
        </div>
    );
};
