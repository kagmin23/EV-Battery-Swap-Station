import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin,
    Calendar,
    Clock,
    Battery,
    Activity,
    X,
    ExternalLink,
    CheckCircle,
    Zap,
    AlertTriangle
} from 'lucide-react';
import type { Station } from '../types/station';

interface StationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    station: Station | null;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
    isOpen,
    onClose,
    station
}) => {
    if (!station) return null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCapacity = (capacity: number) => {
        return capacity.toLocaleString('en-US');
    };

    const formatSoh = (soh: number) => {
        return `${soh}%`;
    };

    const getUtilizationRate = () => {
        if (station.capacity === 0) return 0;
        const totalBatteries = station.batteryCounts?.total ?? station.availableBatteries ?? 0;
        return Math.round((totalBatteries / station.capacity) * 100);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                            Station Details
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Info */}
                    <Card className="shadow-sm border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        <MapPin className="h-10 w-10" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{station.name}</h2>
                                            <p className="text-lg text-slate-600 mb-3">{station.address}</p>
                                            <p className="text-sm text-slate-500 mb-3">{station.city}, {station.district}</p>
                                            </div>
                                        {station.mapUrl && (
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(station.mapUrl, '_blank')}
                                                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View on Google Maps
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Battery Information */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <Battery className="h-5 w-5 mr-2 text-green-600" />
                                Battery Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Battery className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Capacity</p>
                                        <p className="font-medium text-slate-800">{formatCapacity(station.capacity)} batteries</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Battery className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Total Batteries</p>
                                        <p className="font-medium text-slate-800">{station.batteryCounts?.total ?? station.availableBatteries ?? 0} batteries</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Activity className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Average SOH</p>
                                        <p className="font-medium text-slate-800">{formatSoh(station.sohAvg)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Utilization Rate */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Usage Rate</span>
                                    <span className="text-lg font-bold text-blue-600">{getUtilizationRate()}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getUtilizationRate()}%` }}
                                    />
                                </div>
                            </div>

                            {/* Battery Status Breakdown */}
                            {station.batteryCounts && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Battery Status Breakdown</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                                    Available
                                                </Badge>
                                            </div>
                                            <p className="text-2xl font-bold text-green-700">{station.batteryCounts.available}</p>
                                            <p className="text-xs text-slate-500 mt-1">Idle + Full</p>
                                        </div>
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <Zap className="h-4 w-4 text-yellow-600" />
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                                    Charging
                                                </Badge>
                                            </div>
                                            <p className="text-2xl font-bold text-yellow-700">{station.batteryCounts.charging}</p>
                                            <p className="text-xs text-slate-500 mt-1">In charging</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <Activity className="h-4 w-4 text-blue-600" />
                                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                                    In Use
                                                </Badge>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-700">{station.batteryCounts.inUse}</p>
                                            <p className="text-xs text-slate-500 mt-1">Currently in use</p>
                                    </div>
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                                    Faulty
                                                </Badge>
                                </div>
                                            <p className="text-2xl font-bold text-red-700">{station.batteryCounts.faulty}</p>
                                            <p className="text-xs text-slate-500 mt-1">Needs repair</p>
                                    </div>
                                </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                                Time Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Created Date</p>
                                        <p className="font-medium text-slate-800">{formatDate(station.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Last Updated</p>
                                        <p className="font-medium text-slate-800">{formatDate(station.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </DialogContent>
        </Dialog>
    );
};
