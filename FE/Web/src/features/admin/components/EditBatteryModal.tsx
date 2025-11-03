import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Battery as BatteryIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService, type UpdateBatteryRequest } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import { ConfirmationModal } from './ConfirmationModal';
import type { Battery } from '../types/battery';

interface EditBatteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    battery: Battery | null;
}

interface BatteryFormData {
    model: string;
    soh: number;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    stationId: string;
    manufacturer: string;
    capacity_kWh: number;
    voltage: number;
    price?: number;
}

export const EditBatteryModal: React.FC<EditBatteryModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    battery
}) => {
    const [formData, setFormData] = useState<BatteryFormData>({
        model: '',
        soh: 100,
        status: 'idle',
        stationId: '',
        manufacturer: '',
        capacity_kWh: 0,
        voltage: 0,
        price: 0
    });
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sohTouched, setSohTouched] = useState(false);

    // Confirmation modal state
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Load stations when modal opens
    useEffect(() => {
        if (isOpen) {
            loadStations();
        }
    }, [isOpen]);

    // Load battery data when battery changes
    useEffect(() => {
        if (battery && isOpen) {
            const newFormData = {
                model: battery.model || '',
                soh: battery.soh || 100,
                status: battery.status || 'idle',
                stationId: battery.stationId || '',
                manufacturer: battery.manufacturer || '',
                capacity_kWh: battery.capacity_kWh || 0,
                voltage: battery.voltage || 0,
                price: (battery as any).price || 0
            };
            setFormData(newFormData);
            setSohTouched(true); // Battery data is loaded, so SOH is considered touched
        }
    }, [battery, isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                model: '',
                soh: 100,
                status: 'idle',
                stationId: '',
                manufacturer: '',
                capacity_kWh: 0,
                voltage: 0,
                price: 0
            });
            setErrors({});
            setSohTouched(false);
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

        if (!formData.model.trim()) {
            newErrors.model = 'Model is required';
        }

        if (formData.soh === undefined || formData.soh === null || isNaN(formData.soh)) {
            newErrors.soh = 'SOH is required';
        } else if (formData.soh < 0 || formData.soh > 100) {
            newErrors.soh = 'SOH must be between 0 and 100';
        }

        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        if (!formData.stationId) {
            newErrors.stationId = 'Please select a station';
        }

        if (!formData.manufacturer.trim()) {
            newErrors.manufacturer = 'Manufacturer is required';
        }

        if (formData.capacity_kWh <= 0) {
            newErrors.capacity_kWh = 'Capacity must be greater than 0';
        }

        if (formData.voltage <= 0) {
            newErrors.voltage = 'Voltage must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!battery) return;

        if (!validateForm()) {
            return;
        }

        // Show confirmation modal instead of submitting directly
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        if (!battery) return;
        setSubmitError(null);
        try {
            setIsLoading(true);

            const updateData: UpdateBatteryRequest = {
                model: formData.model.trim(),
                soh: formData.soh,
                status: formData.status,
                stationId: formData.stationId,
                manufacturer: formData.manufacturer.trim(),
                capacity_kWh: formData.capacity_kWh,
                voltage: formData.voltage,
                price: formData.price
            };

            await BatteryService.updateBattery(battery.id, updateData);

            toast.success('Battery updated successfully');
            onSuccess();
            handleClose();
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to update battery. Please check your inputs and try again.');
            // Không được toast.error
        } finally {
            setIsLoading(false);
            setIsConfirmationModalOpen(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    const handleInputChange = (field: keyof BatteryFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (!battery) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-blue-100 rounded-xl mr-3">
                            <BatteryIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        Edit Battery {battery.batteryId}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Model */}
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Model pin
                            </Label>
                            <Input
                                id="model"
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleInputChange('model', e.target.value)}
                                placeholder="Nhập model pin"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.model ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.model && (
                                <p className="text-sm text-red-500">{errors.model}</p>
                            )}
                        </div>

                        {/* SOH */}
                        <div className="space-y-2">
                            <Label htmlFor="soh" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                SOH (%)
                            </Label>
                            <Input
                                id="soh"
                                type="text"
                                value={formData.soh.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSohTouched(true);
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        const numValue = value === '' ? 0 : parseFloat(value) || 0;
                                        if (numValue >= 0 && numValue <= 100) {
                                            handleInputChange('soh', numValue);
                                        }
                                    }
                                }}
                                onBlur={() => setSohTouched(true)}
                                placeholder="Enter SOH (0-100)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.soh ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.soh && (
                                <p className="text-sm text-red-500">{errors.soh}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Status
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange('status', value as BatteryFormData['status'])}
                            >
                                <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.status ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-[9999]">
                                    <SelectItem value="idle" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer">
                                        Idle
                                    </SelectItem>
                                    <SelectItem value="charging" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer">
                                        Charging
                                    </SelectItem>
                                    <SelectItem value="full" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer">
                                        Full
                                    </SelectItem>
                                    <SelectItem value="in-use" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer">
                                        In Use
                                    </SelectItem>
                                    <SelectItem value="faulty" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer">
                                        Faulty
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-red-500">{errors.status}</p>
                            )}
                        </div>

                        {/* Station */}
                        <div className="space-y-2">
                            <Label htmlFor="stationId" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Trạm
                            </Label>
                            <Select
                                value={formData.stationId}
                                onValueChange={(value) => handleInputChange('stationId', value)}
                            >
                                <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.stationId ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}>
                                    <SelectValue placeholder="Chọn trạm" />
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

                        {/* Manufacturer */}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Nhà sản xuất
                            </Label>
                            <Input
                                id="manufacturer"
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                placeholder="Nhập nhà sản xuất"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.manufacturer ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.manufacturer && (
                                <p className="text-sm text-red-500">{errors.manufacturer}</p>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label htmlFor="capacity_kWh" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Dung lượng (kWh)
                            </Label>
                            <Input
                                id="capacity_kWh"
                                type="text"
                                value={formData.capacity_kWh === 0 ? '' : formData.capacity_kWh.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        handleInputChange('capacity_kWh', value === '' ? 0 : parseFloat(value) || 0);
                                    }
                                }}
                                placeholder="Nhập dung lượng (VD: 50.5)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.capacity_kWh ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.capacity_kWh && (
                                <p className="text-sm text-red-500">{errors.capacity_kWh}</p>
                            )}
                        </div>

                        {/* Voltage */}
                        <div className="space-y-2">
                            <Label htmlFor="voltage" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Điện áp (V)
                            </Label>
                            <Input
                                id="voltage"
                                type="text"
                                value={formData.voltage === 0 ? '' : formData.voltage.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        handleInputChange('voltage', value === '' ? 0 : parseFloat(value) || 0);
                                    }
                                }}
                                placeholder="Nhập điện áp (VD: 400.5)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 ${errors.voltage ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.voltage && (
                                <p className="text-sm text-red-500">{errors.voltage}</p>
                            )}
                        </div>
                    </div>

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
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700"
                        >
                            {isLoading ? (
                                <ButtonLoadingSpinner size="sm" variant="white" text="Đang cập nhật..." />
                            ) : (
                                'Cập nhật pin'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => { setIsConfirmationModalOpen(false); setSubmitError(null); }}
                onConfirm={handleConfirmUpdate}
                title={`Xác nhận cập nhật pin ${battery?.batteryId}`}
                message={<div>Bạn có chắc chắn muốn cập nhật thông tin pin <span className="font-bold text-slate-800">{battery?.batteryId}</span>?</div>}
                confirmText="Cập nhật"
                type="edit"
                isLoading={isLoading}
                submitError={submitError} // <-- truyền error xuống để show ngay trong modal
            />
        </Dialog>
    );
};
