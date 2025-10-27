import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Brain,
    Sparkles,
    RefreshCw,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminService, type AIPrediction } from '@/services/api/adminService';

export const AIPredictionPage: React.FC = () => {
    const [prediction, setPrediction] = useState<AIPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPrediction = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await AdminService.getAIPredictions();
            setPrediction(data);
            toast.success('Tải dự đoán AI thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dự đoán AI';
            setError(errorMessage);
            console.error('Error loading AI prediction:', err);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPrediction();
    }, []);

    if (isLoading) {
        return <PageLoadingSpinner text="Đang tải dự đoán AI..." />;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">{error}</span>
                    </div>
                    <Button onClick={loadPrediction} variant="outline" size="sm">
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
                    <h1 className="text-3xl font-bold text-slate-900">Dự đoán AI</h1>
                    <p className="text-slate-600 mt-2">Phân tích và dự đoán nhu cầu hệ thống</p>
                </div>
                <Button onClick={loadPrediction} className="bg-purple-600 hover:bg-purple-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Prediction Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100/50 border-b border-purple-200/60">
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-purple-100 rounded-xl mr-3">
                            <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                        Dự đoán AI
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {prediction ? (
                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Gợi ý</h3>
                                    <p className="text-slate-700 text-base leading-relaxed">{prediction.suggest}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Mức độ ưu tiên</span>
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-purple-900">Cao</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-pink-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Trạng thái</span>
                                        <Lightbulb className="h-4 w-4 text-pink-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-pink-900">Đang xử lý</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Tác động</span>
                                        <Zap className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-indigo-900">Tích cực</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Brain className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có dự đoán</h3>
                            <p className="text-slate-600">Không có dữ liệu dự đoán AI.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Thuật toán AI</CardTitle>
                            <Brain className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">
                            Hệ thống sử dụng machine learning để phân tích dữ liệu và đưa ra dự đoán về nhu cầu sử dụng pin.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Độ chính xác</CardTitle>
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600">
                            Dự đoán được cập nhật liên tục dựa trên dữ liệu thực tế từ hệ thống.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

