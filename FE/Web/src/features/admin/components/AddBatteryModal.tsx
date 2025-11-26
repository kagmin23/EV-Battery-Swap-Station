import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Battery as BatteryIcon, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService, type CreateBatteryRequest } from '@/services/api/batteryService';
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
    price?: number;
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
        voltage: 0,
        price: 0
    });
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sohTouched, setSohTouched] = useState(false);
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

        if (!formData.serial.trim()) {
            newErrors.serial = 'Battery serial number is required';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'Battery model is required';
        }

        if (!sohTouched || formData.soh === undefined || formData.soh === null || isNaN(formData.soh)) {
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

        if (formData.price === undefined || formData.price === null || formData.price < 1000) {
            newErrors.price = 'Price is required and must be at least 1,000 VND';
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

            const batteryData: CreateBatteryRequest = {
                serial: formData.serial.trim(),
                model: formData.model.trim(),
                soh: formData.soh,
                status: formData.status,
                stationId: formData.stationId,
                manufacturer: formData.manufacturer.trim(),
                capacity_kWh: formData.capacity_kWh,
                voltage: formData.voltage,
                price: formData.price
            };

            await BatteryService.createBattery(batteryData);

            toast.success('Battery added successfully');
            onSuccess();
            handleClose();
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to add battery. Please check your inputs and try again.');
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
            voltage: 0,
            price: 0
        });
        setErrors({});
        setSohTouched(false);
        setSubmitError(null);
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
                        Add New Battery
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-2 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                            <span className="font-medium">{submitError}</span>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Serial Number */}
                        <div className="space-y-2">
                            <Label htmlFor="serial" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Battery Serial Number
                            </Label>
                            <Input
                                id="serial"
                                type="text"
                                value={formData.serial}
                                onChange={(e) => handleInputChange('serial', e.target.value)}
                                placeholder="Enter battery serial number"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.serial ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.serial && (
                                <p className="text-sm text-red-500">{errors.serial}</p>
                            )}
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Battery Model
                            </Label>
                            <Input
                                id="model"
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleInputChange('model', e.target.value)}
                                placeholder="Enter battery model"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.model ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
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
                                value={formData.soh === 100 && !sohTouched ? '' : formData.soh.toString()}
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
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.soh ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
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
                                <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.status ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-[9999]">
                                    <SelectItem value="idle" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Idle
                                    </SelectItem>
                                    <SelectItem value="charging" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Charging
                                    </SelectItem>
                                    <SelectItem value="full" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        Full
                                    </SelectItem>
                                    <SelectItem value="in-use" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
                                        In Use
                                    </SelectItem>
                                    <SelectItem value="faulty" className="rounded-lg hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 transition-colors duration-200 cursor-pointer">
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
                                Station
                            </Label>
                            <Select
                                value={formData.stationId}
                                onValueChange={(value) => handleInputChange('stationId', value)}
                            >
                                <SelectTrigger className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.stationId ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}>
                                    <SelectValue placeholder="Select station" />
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
                                <p className="text-sm text-red-500">{errors.stationId}</p>
                            )}
                        </div>

                        {/* Manufacturer */}
                        <div className="space-y-2">
                            <Label htmlFor="manufacturer" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Manufacturer
                            </Label>
                            <Input
                                id="manufacturer"
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                placeholder="Enter manufacturer"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.manufacturer ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.manufacturer && (
                                <p className="text-sm text-red-500">{errors.manufacturer}</p>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label htmlFor="capacity_kWh" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Capacity (kWh)
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
                                placeholder="Enter capacity (e.g., 50.5)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.capacity_kWh ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.capacity_kWh && (
                                <p className="text-sm text-red-500">{errors.capacity_kWh}</p>
                            )}
                        </div>

                        {/* Voltage */}
                        <div className="space-y-2">
                            <Label htmlFor="voltage" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Voltage (V)
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
                                placeholder="Enter voltage (e.g., 400.5)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.voltage ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.voltage && (
                                <p className="text-sm text-red-500">{errors.voltage}</p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium text-slate-700 after:ml-1 after:text-red-500 after:content-['*']">
                                Price (VND)
                            </Label>
                            <Input
                                id="price"
                                type="text"
                                value={formData.price === 0 ? '' : formData.price}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d+$/.test(value)) {
                                        handleInputChange('price', value === '' ? 0 : parseInt(value) || 0);
                                    }
                                }}
                                placeholder="Enter price (min 1,000 VND)"
                                className={`h-12 bg-white/90 border-slate-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 rounded-xl text-slate-700 ${errors.price ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.price && (
                                <p className="text-sm text-red-500">{errors.price}</p>
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-green-600 hover:border-green-700"
                        >
                            {isLoading ? (
                                <ButtonLoadingSpinner size="sm" variant="white" text="Adding..." />
                            ) : (
                                'Add Battery'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
