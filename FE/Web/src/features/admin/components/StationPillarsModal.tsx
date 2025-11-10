import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ButtonLoadingSpinner, PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { Battery, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import type { Station } from '../types/station';
import type { Pillar } from '../types/pillar.ts';

interface StationPillarsModalProps {
    isOpen: boolean;
    onClose: () => void;
    station: Station | null;
    pillars: Pillar[];
    isLoading: boolean;
    onReload: () => void;
    onAddPillar: () => void;
    error?: string | null;
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
    active: 'success',
    inactive: 'secondary',
    maintenance: 'warning',
    error: 'destructive',
};

export const StationPillarsModal: React.FC<StationPillarsModalProps> = ({
    isOpen,
    onClose,
    station,
    pillars,
    isLoading,
    onReload,
    onAddPillar,
    error = null,
}) => {
    const getStatusVariant = (status: string) => {
        const normalised = status?.toLowerCase() || 'default';
        return statusVariantMap[normalised] ?? 'default';
    };

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-600" />
                        Pillars at {station?.name ?? 'Station'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        View current pillars, slot statistics, and manage infrastructure for this station.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between gap-2 py-2">
                    <div className="text-sm text-slate-500">
                        {station ? (
                            <span>
                                {station.address} • {station.city}, {station.district}
                            </span>
                        ) : (
                            <span>Select a station to view pillars.</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReload}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            {isLoading ? (
                                <ButtonLoadingSpinner size="sm" variant="default" text="Refreshing..." />
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            onClick={onAddPillar}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow hover:shadow-md transition-all duration-200"
                            disabled={!station}
                        >
                            Add Pillar
                        </Button>
                    </div>
                </div>

                <Separator />

                {error && (
                    <div className="mt-4 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mt-4 h-[55vh] overflow-y-auto pr-2 space-y-4">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <PageLoadingSpinner text="Loading pillars..." />
                        </div>
                    ) : pillars.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
                            <CardHeader className="text-center text-slate-600">
                                No pillars found for this station.
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-3 pb-6">
                                <p className="text-sm text-slate-500 text-center max-w-md">
                                    Pillars house the battery slots at each station. Create a pillar to begin tracking slot status and availability.
                                </p>
                                <Button onClick={onAddPillar}>
                                    <Battery className="h-4 w-4 mr-2" />
                                    Create first pillar
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        pillars.map((pillar) => (
                            <Card key={pillar.id} className="shadow-sm border border-slate-200">
                                <CardHeader className="flex flex-row items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-slate-800">
                                                {pillar.pillarName}
                                            </h3>
                                            <Badge variant={getStatusVariant(pillar.status)}>
                                                {pillar.status ?? 'unknown'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Code: {pillar.pillarCode} • Pillar #{pillar.pillarNumber}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm text-slate-500">
                                        <p>Slots: {pillar.totalSlots}</p>
                                        {pillar.slotStats && (
                                            <p>
                                                Empty: {pillar.slotStats.empty} • Occupied:{' '}
                                                {pillar.slotStats.occupied} • Reserved:{' '}
                                                {pillar.slotStats.reserved}
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pillar.slotStats ? (
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                                Total: {pillar.slotStats.total}
                                            </Badge>
                                            <Badge variant="success">Empty: {pillar.slotStats.empty}</Badge>
                                            <Badge variant="default">Occupied: {pillar.slotStats.occupied}</Badge>
                                            <Badge variant="warning">Reserved: {pillar.slotStats.reserved}</Badge>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            Slot statistics will appear once slots are initialised.
                                        </p>
                                    )}

                                    {pillar.slots && pillar.slots.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-2">
                                                Slot overview
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {pillar.slots.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                                                    >
                                                        <div className="font-medium text-slate-700">
                                                            Slot #{slot.slotNumber}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {slot.slotCode}
                                                        </div>
                                                        <div className="mt-1 text-xs capitalize">
                                                            Status: {slot.status}
                                                        </div>
                                                        {slot.battery && (
                                                            <div className="mt-1 text-xs text-slate-500">
                                                                Battery: {slot.battery.serial}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StationPillarsModal;


