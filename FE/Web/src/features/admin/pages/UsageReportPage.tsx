import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    Users,
    BarChart3,
    RefreshCw,
    AlertCircle,
    Activity,
    Clock,
    Battery
} from 'lucide-react';
import { toast } from 'sonner';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminService, type UsageReport } from '@/services/api/adminService';

export const UsageReportPage: React.FC = () => {
    const [report, setReport] = useState<UsageReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadReport = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await AdminService.getUsageReports();
            setReport(data);
            toast.success('Tải báo cáo sử dụng thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải báo cáo sử dụng';
            setError(errorMessage);
            console.error('Error loading usage report:', err);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    if (isLoading) {
        return <PageLoadingSpinner text="Đang tải báo cáo sử dụng..." />;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">{error}</span>
                    </div>
                    <Button onClick={loadReport} variant="outline" size="sm">
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Báo cáo sử dụng</h1>
                    <p className="text-slate-600 mt-2">Theo dõi và phân tích mô hình sử dụng hệ thống</p>
                </div>
                <Button onClick={loadReport} className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Frequency Report */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-blue-100 rounded-xl mr-3">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        Tần suất sử dụng
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {report?.frequency && report.frequency.length > 0 ? (
                        <div className="space-y-4">
                            {report.frequency.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <span className="font-medium text-slate-900">{JSON.stringify(item)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Activity className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có dữ liệu</h3>
                            <p className="text-slate-600">Không có dữ liệu tần suất sử dụng.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Peak Hours Report */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-green-100 rounded-xl mr-3">
                            <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        Giờ cao điểm
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {report?.peakHours && report.peakHours.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {report.peakHours.map((hour: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-slate-900">{JSON.stringify(hour)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Clock className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có dữ liệu</h3>
                            <p className="text-slate-600">Không có dữ liệu giờ cao điểm.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Dữ liệu tần suất</CardTitle>
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">
                            {report?.frequency?.length || 0}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Bản ghi tần suất</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Dữ liệu giờ cao điểm</CardTitle>
                            <Battery className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900">
                            {report?.peakHours?.length || 0}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Bản ghi giờ cao điểm</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

