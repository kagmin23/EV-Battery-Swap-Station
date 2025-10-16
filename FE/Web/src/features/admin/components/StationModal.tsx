import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { Station, AddStationRequest, UpdateStationRequest } from '../types/station';

interface StationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AddStationRequest | UpdateStationRequest) => void;
    station?: Station | null;
}

export const StationModal: React.FC<StationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    station
}) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        district: '',
        coordinates: {
            lat: 0,
            lng: 0
        },
        mapUrl: '',
        capacity: 0,
        sohAvg: 100,
        availableBatteries: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (station) {
            setFormData({
                name: station.name,
                address: station.address,
                city: station.city,
                district: station.district,
                coordinates: station.coordinates,
                mapUrl: station.mapUrl,
                capacity: station.capacity,
                sohAvg: station.sohAvg,
                availableBatteries: station.availableBatteries,
            });
        } else {
            setFormData({
                name: '',
                address: '',
                city: '',
                district: '',
                coordinates: { lat: 0, lng: 0 },
                mapUrl: '',
                capacity: 0,
                sohAvg: 100,
                availableBatteries: 0,
            });
        }
        setErrors({});
    }, [station, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên trạm là bắt buộc';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'Thành phố là bắt buộc';
        }

        if (!formData.district.trim()) {
            newErrors.district = 'Quận/Huyện là bắt buộc';
        }

        if (formData.capacity <= 0) {
            newErrors.capacity = 'Sức chứa phải lớn hơn 0';
        }

        if (formData.sohAvg < 0 || formData.sohAvg > 100) {
            newErrors.sohAvg = 'SOH phải từ 0 đến 100';
        }

        if (formData.availableBatteries < 0) {
            newErrors.availableBatteries = 'Số pin có sẵn không được âm';
        }

        if (formData.availableBatteries > formData.capacity) {
            newErrors.availableBatteries = 'Số pin có sẵn không được vượt quá sức chứa';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (station) {
            onSave({
                id: station.id,
                ...formData
            } as UpdateStationRequest);
        } else {
            onSave(formData as AddStationRequest);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            address: '',
            city: '',
            district: '',
            coordinates: { lat: 0, lng: 0 },
            mapUrl: '',
            capacity: 0,
            sohAvg: 100,
            availableBatteries: 0,
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {station ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên trạm *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="Nhập tên trạm"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Sức chứa *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                                        className={errors.capacity ? 'border-red-500' : ''}
                                        placeholder="Nhập sức chứa"
                                    />
                                    {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Địa chỉ *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        className={errors.address ? 'border-red-500' : ''}
                                        placeholder="Nhập địa chỉ đầy đủ"
                                    />
                                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Thành phố *</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className={errors.city ? 'border-red-500' : ''}
                                        placeholder="Nhập thành phố"
                                    />
                                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district">Quận/Huyện *</Label>
                                    <Input
                                        id="district"
                                        value={formData.district}
                                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                        className={errors.district ? 'border-red-500' : ''}
                                        placeholder="Nhập quận/huyện"
                                    />
                                    {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lat">Vĩ độ</Label>
                                    <Input
                                        id="lat"
                                        type="number"
                                        step="any"
                                        value={formData.coordinates.lat}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                                        }))}
                                        placeholder="10.8231"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lng">Kinh độ</Label>
                                    <Input
                                        id="lng"
                                        type="number"
                                        step="any"
                                        value={formData.coordinates.lng}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                                        }))}
                                        placeholder="106.6297"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sohAvg">SOH trung bình (%)</Label>
                                    <Input
                                        id="sohAvg"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.sohAvg}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sohAvg: parseInt(e.target.value) || 0 }))}
                                        className={errors.sohAvg ? 'border-red-500' : ''}
                                        placeholder="100"
                                    />
                                    {errors.sohAvg && <p className="text-sm text-red-500">{errors.sohAvg}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="availableBatteries">Pin có sẵn</Label>
                                    <Input
                                        id="availableBatteries"
                                        type="number"
                                        min="0"
                                        value={formData.availableBatteries}
                                        onChange={(e) => setFormData(prev => ({ ...prev, availableBatteries: parseInt(e.target.value) || 0 }))}
                                        className={errors.availableBatteries ? 'border-red-500' : ''}
                                        placeholder="0"
                                    />
                                    {errors.availableBatteries && <p className="text-sm text-red-500">{errors.availableBatteries}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="mapUrl">Link Google Maps</Label>
                                    <Input
                                        id="mapUrl"
                                        value={formData.mapUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mapUrl: e.target.value }))}
                                        placeholder="https://www.google.com/maps?q=..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-600 hover:border-blue-700"
                        >
                            {station ? 'Cập nhật' : 'Thêm trạm'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
