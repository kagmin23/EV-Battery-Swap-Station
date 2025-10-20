import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Battery as BatteryIcon, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';

interface AddBatteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface BatteryFormData {
    serial: string;
    model: string;
    soh: number;
    status: 'charging' | 'full' | 'faulty' | 'in-use' | 'idle';
    stationId: string;
    manufacturer: string;
    capacity_kWh: number;
    voltage: number;
}

export const AddBatteryModal: React.FC<AddBatteryModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState<BatteryFormData>({
        serial: '',
        model: '',
        soh: 100,
        status: 'idle',
        stationId: '',
        manufacturer: '',
        capacity_kWh: 0,
        voltage: 0
    });
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
            toast.error('Không thể tải danh sách trạm');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.serial.trim()) {
            newErrors.serial = 'Số serial pin là bắt buộc';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'Model pin là bắt buộc';
        }

        if (formData.soh < 0 || formData.soh > 100) {
            newErrors.soh = 'SOH phải từ 0 đến 100';
        }

        if (!formData.stationId) {
            newErrors.stationId = 'Vui lòng chọn trạm';
        }

        if (!formData.manufacturer.trim()) {
            newErrors.manufacturer = 'Nhà sản xuất là bắt buộc';
        }

        if (formData.capacity_kWh <= 0) {
            newErrors.capacity_kWh = 'Dung lượng phải lớn hơn 0';
        }

        if (formData.voltage <= 0) {
            newErrors.voltage = 'Điện áp phải lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const batteryData = {
                serial: formData.serial.trim(),
                model: formData.model.trim(),
                soh: formData.soh,
                status: formData.status,
                stationId: formData.stationId,
                manufacturer: formData.manufacturer.trim(),
                capacity_kWh: formData.capacity_kWh,
                voltage: formData.voltage
            };

            await BatteryService.createBattery(batteryData);

            toast.success('Thêm pin mới thành công');
            onSuccess();
            handleClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm pin';
            toast.error(errorMessage);
            console.error('Error creating battery:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            serial: '',
            model: '',
            soh: 100,
            status: 'idle',
            stationId: '',
            manufacturer: '',
            capacity_kWh: 0,
            voltage: 0
        });
        setErrors({});
        onClose();
    };

    const handleInputChange = (field: keyof BatteryFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-green-100 rounded-xl mr-3">
                            <BatteryIcon className="h-6 w-6 text-green-600" />
                        </div>
                        Thêm pin mới
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Serial Number */}
                        <div className="space-y-2">
                            <Label htmlFor="serial" className="text-sm font-medium text-slate-700">
                                Số serial pin <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="serial"
                                type="text"
                                value={formData.serial}
                                onChange={(e) => handleInputChange('serial', e.target.value)}
                                placeholder="Nhập số serial pin"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.serial ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.serial && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.serial}</span>
                                </div>
                            )}
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-medium text-slate-700">
                                Model pin <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="model"
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleInputChange('model', e.target.value)}
                                placeholder="Nhập model pin"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.model ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.model && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.model}</span>
                                </div>
                            )}
                        </div>

                        {/* SOH */}
                        <div className="space-y-2">
                            <Label htmlFor="soh" className="text-sm font-medium text-slate-700">
                                SOH (%) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="soh"
                                type="text"
                                value={formData.soh === 100 ? '' : formData.soh}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        const numValue = value === '' ? 100 : parseFloat(value) || 0;
                                        if (numValue >= 0 && numValue <= 100) {
                                            handleInputChange('soh', numValue);
                                        }
                                    }
                                }}
                                placeholder="Nhập SOH (0-100)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.soh ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.soh && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.soh}</span>
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                                Trạng thái <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange('status', value as BatteryFormData['status'])}
                            >
                                <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.status ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-[9999]">
                                    <SelectItem value="idle" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Nhàn rỗi
                                    </SelectItem>
                                    <SelectItem value="charging" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Đang sạc
                                    </SelectItem>
                                    <SelectItem value="full" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Đầy
                                    </SelectItem>
                                    <SelectItem value="in-use" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Đang sử dụng
                                    </SelectItem>
                                    <SelectItem value="faulty" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Lỗi
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.status}</span>
                                </div>
                            )}
                        </div>

                        {/* Station */}
                        <div className="space-y-2">
                            <Label htmlFor="stationId" className="text-sm font-medium text-slate-700">
                                Trạm <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.stationId}
                                onValueChange={(value) => handleInputChange('stationId', value)}
                            >
                                <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.stationId ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}>
                                    <SelectValue placeholder="Chọn trạm" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-[9999] max-h-[300px] overflow-y-auto">
                                    {stations.map(station => (
                                        <SelectItem
                                            key={station.id}
                                            value={station.id}
                                            className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer"
                                        >
                                            {station.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.stationId && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.stationId}</span>
                                </div>
                            )}
                        </div>

                        {/* Manufacturer */}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer" className="text-sm font-medium text-slate-700">
                                Nhà sản xuất <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="manufacturer"
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                placeholder="Nhập nhà sản xuất"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.manufacturer ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.manufacturer && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.manufacturer}</span>
                                </div>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label htmlFor="capacity_kWh" className="text-sm font-medium text-slate-700">
                                Dung lượng (kWh) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="capacity_kWh"
                                type="text"
                                value={formData.capacity_kWh === 0 ? '' : formData.capacity_kWh}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        handleInputChange('capacity_kWh', value === '' ? 0 : parseFloat(value) || 0);
                                    }
                                }}
                                placeholder="Nhập dung lượng (VD: 50.5)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.capacity_kWh ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.capacity_kWh && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.capacity_kWh}</span>
                                </div>
                            )}
                        </div>

                        {/* Voltage */}
                        <div className="space-y-2">
                            <Label htmlFor="voltage" className="text-sm font-medium text-slate-700">
                                Điện áp (V) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="voltage"
                                type="text"
                                value={formData.voltage === 0 ? '' : formData.voltage}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        handleInputChange('voltage', value === '' ? 0 : parseFloat(value) || 0);
                                    }
                                }}
                                placeholder="Nhập điện áp (VD: 400.5)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.voltage ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.voltage && (
                                <div className="flex items-center space-x-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.voltage}</span>
                                </div>
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
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-green-600 hover:border-green-700"
                        >
                            {isLoading ? (
                                <ButtonLoadingSpinner size="sm" variant="white" text="Đang thêm..." />
                            ) : (
                                'Thêm pin'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
