import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Battery as BatteryIcon, ArrowRightLeft, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import type { Battery } from '../types/battery';

interface TransferBatteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    batteries: Battery[];
}

export const TransferBatteryModal: React.FC<TransferBatteryModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    batteries
}) => {
    const [selectedBatteryId, setSelectedBatteryId] = useState<string>('');
    const [selectedStationId, setSelectedStationId] = useState<string>('');
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Load stations when modal opens
    useEffect(() => {
        if (isOpen) {
            loadStations();
        }
    }, [isOpen]);

    const loadStations = async () => {
        try {
            const apiStations = await StationService.getAllStations();
            const stationList = apiStations.map((station: ApiStation) => ({
                id: station._id,
                name: station.stationName
            }));
            setStations(stationList);
        } catch (err) {
            console.error('Error loading stations:', err);
            toast.error('Unable to load stations. Please try again.');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!selectedBatteryId) {
            newErrors.batteryId = 'Vui lòng chọn pin cần chuyển';
        }

        if (!selectedStationId) {
            newErrors.stationId = 'Vui lòng chọn trạm đích';
        }

        if (selectedBatteryId && selectedStationId) {
            const selectedBattery = batteries.find(b => b.id === selectedBatteryId);
            if (selectedBattery && selectedBattery.stationId === selectedStationId) {
                newErrors.stationId = 'Pin đã ở trạm này rồi';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            await BatteryService.updateBattery(selectedBatteryId, {
                stationId: selectedStationId
            });

            const selectedBattery = batteries.find(b => b.id === selectedBatteryId);
            const targetStation = stations.find(s => s.id === selectedStationId);

            toast.success(`Battery ${selectedBattery?.batteryId} transferred to "${targetStation?.name}" successfully`);
            onSuccess();
            handleClose();
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to transfer battery. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedBatteryId('');
        setSelectedStationId('');
        setSearchTerm('');
        setErrors({});
        setSubmitError(null);
        onClose();
    };

    const filteredBatteries = batteries.filter(battery =>
        battery.batteryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.stationName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedBattery = batteries.find(b => b.id === selectedBatteryId);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-blue-100 rounded-xl mr-3">
                            <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                        </div>
                        Chuyển pin đến trạm khác
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Search Battery */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                            Tìm kiếm pin
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo ID pin hoặc tên trạm..."
                                className="w-full pl-10 h-12 bg-white/90 border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Select Battery */}
                    <div className="space-y-2">
                        <Label htmlFor="batteryId" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                            Chọn pin cần chuyển
                        </Label>
                        <Select
                            value={selectedBatteryId}
                            onValueChange={(value) => {
                                setSelectedBatteryId(value);
                                if (errors.batteryId) {
                                    setErrors(prev => ({ ...prev, batteryId: '' }));
                                }
                            }}
                        >
                            <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.batteryId ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                }`}>
                                <SelectValue placeholder="Chọn pin cần chuyển" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-[9999] max-h-[300px] overflow-y-auto">
                                {filteredBatteries.map(battery => (
                                    <SelectItem
                                        key={battery.id}
                                        value={battery.id}
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{battery.batteryId}</span>
                                            <span className="text-sm text-slate-500">Trạm: {battery.stationName}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.batteryId && (
                            <p className="text-sm text-red-500">{errors.batteryId}</p>
                        )}
                    </div>

                    {/* Selected Battery Info */}
                    {selectedBattery && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h4 className="font-medium text-slate-800 mb-2">Thông tin pin được chọn:</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-600">ID Pin:</span>
                                    <span className="ml-2 font-medium">{selectedBattery.batteryId}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Trạm hiện tại:</span>
                                    <span className="ml-2 font-medium">{selectedBattery.stationName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">SOH:</span>
                                    <span className="ml-2 font-medium">{selectedBattery.soh}%</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Trạng thái:</span>
                                    <span className="ml-2 font-medium">
                                        {selectedBattery.status === 'charging' ? 'Đang sạc' :
                                            selectedBattery.status === 'full' ? 'Đầy' :
                                                selectedBattery.status === 'faulty' ? 'Lỗi' :
                                                    selectedBattery.status === 'in-use' ? 'Đang sử dụng' :
                                                        selectedBattery.status === 'idle' ? 'Nhàn rỗi' : 'Không xác định'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Select Target Station */}
                    <div className="space-y-2">
                        <Label htmlFor="stationId" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                            Chọn trạm đích
                        </Label>
                        <Select
                            value={selectedStationId}
                            onValueChange={(value) => {
                                setSelectedStationId(value);
                                if (errors.stationId) {
                                    setErrors(prev => ({ ...prev, stationId: '' }));
                                }
                            }}
                        >
                            <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.stationId ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                }`}>
                                <SelectValue placeholder="Chọn trạm đích" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-[9999] max-h-[300px] overflow-y-auto">
                                {stations.map(station => (
                                    <SelectItem
                                        key={station.id}
                                        value={station.id}
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer"
                                    >
                                        {station.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.stationId && (
                            <p className="text-sm text-red-500">{errors.stationId}</p>
                        )}
                    </div>

                    {submitError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-2 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                            <span className="font-medium">{submitError}</span>
                        </div>
                    )}

                    <DialogFooter className="flex justify-end space-x-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="px-6 py-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all duration-200"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !selectedBatteryId || !selectedStationId}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700"
                        >
                            {isLoading ? (
                                <ButtonLoadingSpinner size="sm" variant="white" text="Đang chuyển..." />
                            ) : (
                                'Chuyển pin'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
