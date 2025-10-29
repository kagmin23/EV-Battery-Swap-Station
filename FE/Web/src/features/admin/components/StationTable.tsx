import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { MapPin, ExternalLink, Users } from 'lucide-react';
import type { Station } from '../types/station';

interface StationTableProps {
    stations: Station[];
    onSelect: (station: Station) => void;
    onEdit: (station: Station) => void;
    onViewDetails?: (station: Station) => void;
    onViewStaff?: (station: Station) => void;
    savingStationId?: string | null;
}

export const StationTable: React.FC<StationTableProps> = ({
    stations,
    onSelect,
    onEdit,
    onViewDetails,
    onViewStaff,
    savingStationId
}) => {
    const formatCapacity = (capacity: number) => {
        return capacity.toLocaleString('vi-VN');
    };

    const formatSoh = (soh: number) => {
        return `${soh}%`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Station</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Address</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">City</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Capacity</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Available Batteries</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Avg SOH</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {stations.map((station) => (
                        <tr key={station.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        <MapPin className="h-5 w-5 flex-shrink-0" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800">{station.name}</div>
                                        <div className="text-sm text-slate-500">{station.district}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800 max-w-xs truncate" title={station.address}>
                                {station.address}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800">{station.city}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{formatCapacity(station.capacity)}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{station.batteryCounts?.total ?? station.availableBatteries ?? 0}</td>
                            <td className="px-6 py-4 text-sm text-slate-800">{formatSoh(station.sohAvg)}</td>
                            <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                    {onViewDetails && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onViewDetails(station)}
                                            disabled={savingStationId === station.id}
                                            className="flex-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            View Details
                                        </Button>
                                    )}
                                    {onViewStaff && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onViewStaff(station)}
                                            disabled={savingStationId === station.id}
                                            className="flex-1 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Users className="h-4 w-4 mr-1" />
                                            Staff
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(station)}
                                        disabled={savingStationId === station.id}
                                        className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {savingStationId === station.id ? (
                                            <ButtonLoadingSpinner size="sm" variant="default" text="Saving..." />
                                        ) : (
                                            'Edit'
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
