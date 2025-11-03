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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
            newErrors.name = 'Station name is required';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.district.trim()) {
            newErrors.district = 'District is required';
        }

        if (formData.capacity <= 0 || Number.isNaN(formData.capacity)) {
            newErrors.capacity = 'Capacity must be greater than 0';
        }

        // Latitude required and valid range
        if (formData.coordinates.lat === null || formData.coordinates.lat === undefined || formData.coordinates.lat === 0 && String(formData.coordinates.lat) === '0') {
            // allow 0 only if user truly intends; but still require an explicit value
        }
        if (formData.coordinates.lat === undefined || formData.coordinates.lat === null || Number.isNaN(formData.coordinates.lat)) {
            newErrors.lat = 'Latitude is required';
        } else if (formData.coordinates.lat < -90 || formData.coordinates.lat > 90) {
            newErrors.lat = 'Latitude must be between -90 and 90';
        }

        // Longitude required and valid range
        if (formData.coordinates.lng === undefined || formData.coordinates.lng === null || Number.isNaN(formData.coordinates.lng)) {
            newErrors.lng = 'Longitude is required';
        } else if (formData.coordinates.lng < -180 || formData.coordinates.lng > 180) {
            newErrors.lng = 'Longitude must be between -180 and 180';
        }

        if (formData.sohAvg === undefined || formData.sohAvg === null || Number.isNaN(formData.sohAvg)) {
            newErrors.sohAvg = 'Average SOH is required';
        } else if (formData.sohAvg < 0 || formData.sohAvg > 100) {
            newErrors.sohAvg = 'SOH must be between 0 and 100';
        }

        if (formData.availableBatteries === undefined || formData.availableBatteries === null || Number.isNaN(formData.availableBatteries)) {
            newErrors.availableBatteries = 'Available batteries is required';
        } else if (formData.availableBatteries < 0) {
            newErrors.availableBatteries = 'Available batteries cannot be negative';
        } else if (formData.availableBatteries > formData.capacity) {
            newErrors.availableBatteries = 'Available batteries cannot exceed capacity';
        }

        if (!formData.mapUrl.trim()) {
            newErrors.mapUrl = 'Google Maps link is required';
        } else {
            try {
                const u = new URL(formData.mapUrl);
                if (!u.protocol.startsWith('http')) {
                    newErrors.mapUrl = 'Invalid URL';
                }
            } catch {
                newErrors.mapUrl = 'Invalid URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validateForm()) return;
        try {
            setIsSaving(true);
            if (station) {
                await onSave({ id: station.id, ...formData } as UpdateStationRequest);
            } else {
                await onSave(formData as AddStationRequest);
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unable to save station information';
            setSubmitError(msg);
            return;
        } finally {
            setIsSaving(false);
        }
        handleClose();
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
        setSubmitError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {station ? 'Edit Station' : 'Add New Station'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="after:ml-1 after:text-red-500 after:content-['*']">Station Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="Enter station name"
                                        aria-required="true"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity" className="after:ml-1 after:text-red-500 after:content-['*']">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, capacity: value === '' ? 0 : parseInt(value) || 0 }));
                                        }}
                                        className={`${errors.capacity ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        placeholder="Enter capacity"
                                        aria-required="true"
                                    />
                                    {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address" className="after:ml-1 after:text-red-500 after:content-['*']">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        className={errors.address ? 'border-red-500' : ''}
                                        placeholder="Enter full address"
                                        aria-required="true"
                                    />
                                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city" className="after:ml-1 after:text-red-500 after:content-['*']">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className={errors.city ? 'border-red-500' : ''}
                                        placeholder="Enter city"
                                        aria-required="true"
                                    />
                                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district" className="after:ml-1 after:text-red-500 after:content-['*']">District</Label>
                                    <Input
                                        id="district"
                                        value={formData.district}
                                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                        className={errors.district ? 'border-red-500' : ''}
                                        placeholder="Enter district"
                                        aria-required="true"
                                    />
                                    {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lat" className="after:ml-1 after:text-red-500 after:content-['*']">Latitude</Label>
                                    <Input
                                        id="lat"
                                        type="number"
                                        step="any"
                                        value={formData.coordinates.lat || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                coordinates: { ...prev.coordinates, lat: value === '' ? (NaN as any) : parseFloat(value) }
                                            }));
                                        }}
                                        placeholder="10.8231"
                                        className={`${errors.lat ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        aria-required="true"
                                    />
                                    {errors.lat && <p className="text-sm text-red-500">{errors.lat}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lng" className="after:ml-1 after:text-red-500 after:content-['*']">Longitude</Label>
                                    <Input
                                        id="lng"
                                        type="number"
                                        step="any"
                                        value={formData.coordinates.lng || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                coordinates: { ...prev.coordinates, lng: value === '' ? (NaN as any) : parseFloat(value) }
                                            }));
                                        }}
                                        placeholder="106.6297"
                                        className={`${errors.lng ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        aria-required="true"
                                    />
                                    {errors.lng && <p className="text-sm text-red-500">{errors.lng}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sohAvg" className="after:ml-1 after:text-red-500 after:content-['*']">Average SOH (%)</Label>
                                    <Input
                                        id="sohAvg"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.sohAvg || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, sohAvg: value === '' ? (NaN as any) : parseInt(value) }));
                                        }}
                                        className={`${errors.sohAvg ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        placeholder="100"
                                        aria-required="true"
                                    />
                                    {errors.sohAvg && <p className="text-sm text-red-500">{errors.sohAvg}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="availableBatteries" className="after:ml-1 after:text-red-500 after:content-['*']">Available Batteries</Label>
                                    <Input
                                        id="availableBatteries"
                                        type="number"
                                        min="0"
                                        value={formData.availableBatteries || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, availableBatteries: value === '' ? (NaN as any) : parseInt(value) }));
                                        }}
                                        className={`${errors.availableBatteries ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        placeholder="0"
                                        aria-required="true"
                                    />
                                    {errors.availableBatteries && <p className="text-sm text-red-500">{errors.availableBatteries}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="mapUrl" className="after:ml-1 after:text-red-500 after:content-['*']">Link Google Maps</Label>
                                    <Input
                                        id="mapUrl"
                                        value={formData.mapUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mapUrl: e.target.value }))}
                                        placeholder="https://www.google.com/maps?q=..."
                                        className={errors.mapUrl ? 'border-red-500' : ''}
                                        aria-required="true"
                                    />
                                    {errors.mapUrl && <p className="text-sm text-red-500">{errors.mapUrl}</p>}
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
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-600 hover:border-blue-700"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : (station ? 'Update' : 'Add Station')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
