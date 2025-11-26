import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battery as BatteryIcon, Edit, Trash2 } from 'lucide-react';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import type { Battery, BatteryStatus } from '../types/battery';

interface BatteryTableProps {
    batteries: Battery[];
    onEdit: (battery: Battery) => void;
    onDelete: (battery: Battery) => void;
    onLogs?: (battery: Battery) => void;
    deletingBatteryId?: string | null;
}

export const BatteryTable: React.FC<BatteryTableProps> = ({
    batteries,
    onEdit,
    onDelete,
    onLogs,
    deletingBatteryId = null
}) => {
    const getStatusBadge = (status: BatteryStatus) => {
        switch (status) {
            case 'charging':
                return <Badge variant="warning">Charging</Badge>;
            case 'full':
                return <Badge variant="success">Full</Badge>;
            case 'faulty':
                return <Badge variant="destructive">Faulty</Badge>;
            case 'in-use':
                return <Badge variant="default">In Use</Badge>;
            case 'idle':
                return <Badge variant="secondary">Idle</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'charging':
                return 'text-orange-500';
            case 'full':
                return 'text-green-500';
            case 'faulty':
                return 'text-red-500';
            case 'in-use':
                return 'text-blue-500';
            case 'idle':
                return 'text-gray-500';
            default:
                return 'text-gray-400';
        }
    };

    const getSohColor = (soh: number) => {
        if (soh >= 80) return 'text-green-600 font-semibold';
        if (soh >= 60) return 'text-yellow-600 font-semibold';
        if (soh >= 40) return 'text-orange-600 font-semibold';
        return 'text-red-600 font-semibold';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Battery ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Model</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Station</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">SOH</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Capacity (kWh)</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Voltage (V)</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Manufacturer</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {batteries.map((battery) => (
                        <tr
                            key={battery.id}
                            className="hover:bg-slate-50 transition-colors"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        <BatteryIcon className="h-5 w-5 flex-shrink-0" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800">{battery.batteryId}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800">{battery.model || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{battery.stationName || 'Not assigned'}</td>
                            <td className="px-6 py-4">
                                {getStatusBadge(battery.status)}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-sm font-medium ${getSohColor(battery.soh)}`}>
                                    {battery.soh}%
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800">{battery.capacity_kWh || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{battery.voltage || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{battery.manufacturer || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">
                                {battery.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(battery.price) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                    {onLogs && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onLogs(battery);
                                        }}
                                        className="hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Logs
                                    </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(battery);
                                        }}
                                        disabled={deletingBatteryId === battery.id}
                                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(battery);
                                        }}
                                        disabled={deletingBatteryId === battery.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                    >
                                        {deletingBatteryId === battery.id ? (
                                            <ButtonLoadingSpinner size="sm" variant="default" text="Deleting..." />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

