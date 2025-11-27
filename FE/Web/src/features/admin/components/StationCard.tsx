import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { MapPin, Battery, Users, MoreVertical, Layers, PlusCircle } from 'lucide-react';
import type { Station } from '../types/station';

interface StationCardProps {
    station: Station;
    onSelect: (station: Station) => void;
    onEdit: (station: Station) => void;
    onViewDetails?: (station: Station) => void;
    onViewStaff?: (station: Station) => void;
    onViewPillars?: (station: Station) => void;
    onAddPillar?: (station: Station) => void;
    onDelete?: (station: Station) => void;
    isSaving?: boolean;
    staffCount?: number;
}

export const StationCard: React.FC<StationCardProps> = ({
    station,
    onSelect,
    onEdit,
    onViewDetails,
    onViewStaff,
    onViewPillars,
    onAddPillar,
    onDelete,
    isSaving = false,
    staffCount = 0
}) => {
    const formatSoh = (soh: number) => {
        return `${soh}%`;
    };

    return (
        <Card
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
            onClick={() => onSelect(station)}
        >
            <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                <MapPin className="h-5 w-5 flex-shrink-0" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-lg">{station.name}</h3>
                            <p className="text-sm text-slate-500 truncate">{station.address}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle menu actions
                        }}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate font-medium">{station.city}, {station.district}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Battery className="h-4 w-4 mr-2 text-green-500" />
                        <span>
                            {station.batteryCounts?.total ?? station.availableBatteries ?? 0} batteries
                            {typeof station.batteryCounts?.isBooking === 'number' && station.batteryCounts.isBooking > 0 && (
                                <span className="ml-2 text-xs text-amber-600">
                                    ({station.batteryCounts.isBooking} booking)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                        <span>{staffCount} staff</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                        <span className="font-medium">Average SOH:</span>
                        <span className="font-semibold">{formatSoh(station.sohAvg)}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {onViewDetails && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(station);
                            }}
                            disabled={isSaving}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                        >
                            View Details
                        </Button>
                    )}
                    {onViewStaff && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewStaff(station);
                            }}
                            disabled={isSaving}
                            className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                        >
                            <Users className="h-4 w-4 mr-1" />
                            Staff
                        </Button>
                    )}
                    {onViewPillars && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewPillars(station);
                            }}
                            disabled={isSaving}
                            className="hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                        >
                            <Layers className="h-4 w-4 mr-1" />
                            Pillars
                        </Button>
                    )}
                    {onAddPillar && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddPillar(station);
                            }}
                            disabled={isSaving}
                            className="hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                        >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Pillar
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(station);
                        }}
                        disabled={isSaving}
                        className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                    >
                        {isSaving ? (
                            <ButtonLoadingSpinner size="sm" variant="default" text="Saving..." />
                        ) : (
                            'Edit'
                        )}
                    </Button>
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(station);
                            }}
                            disabled={isSaving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
