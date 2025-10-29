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

        if (formData.capacity <= 0) {
            newErrors.capacity = 'Capacity must be greater than 0';
        }

        if (formData.sohAvg < 0 || formData.sohAvg > 100) {
            newErrors.sohAvg = 'SOH must be between 0 and 100';
        }

        if (formData.availableBatteries < 0) {
            newErrors.availableBatteries = 'Available batteries cannot be negative';
        }

        if (formData.availableBatteries > formData.capacity) {
            newErrors.availableBatteries = 'Available batteries cannot exceed capacity';
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
                        {station ? 'Edit Station' : 'Add New Station'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Station Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="Enter station name"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity *</Label>
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
                                    />
                                    {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        className={errors.address ? 'border-red-500' : ''}
                                        placeholder="Enter full address"
                                    />
                                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className={errors.city ? 'border-red-500' : ''}
                                        placeholder="Enter city"
                                    />
                                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district">District *</Label>
                                    <Input
                                        id="district"
                                        value={formData.district}
                                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                        className={errors.district ? 'border-red-500' : ''}
                                        placeholder="Enter district"
                                    />
                                    {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lat">Latitude</Label>
                                    <Input
                                        id="lat"
                                        type="number"
                                        step="any"
                                        value={formData.coordinates.lat || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                coordinates: { ...prev.coordinates, lat: value === '' ? 0 : parseFloat(value) || 0 }
                                            }));
                                        }}
                                        placeholder="10.8231"
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lng">Longitude</Label>
                                    <Input
                                        id="lng"
                                        type="number"
                                        step="any"
                                        value={formData.coordinates.lng || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                coordinates: { ...prev.coordinates, lng: value === '' ? 0 : parseFloat(value) || 0 }
                                            }));
                                        }}
                                        placeholder="106.6297"
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sohAvg">Average SOH (%)</Label>
                                    <Input
                                        id="sohAvg"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.sohAvg || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, sohAvg: value === '' ? 100 : parseInt(value) || 100 }));
                                        }}
                                        className={`${errors.sohAvg ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        placeholder="100"
                                    />
                                    {errors.sohAvg && <p className="text-sm text-red-500">{errors.sohAvg}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="availableBatteries">Available Batteries</Label>
                                    <Input
                                        id="availableBatteries"
                                        type="number"
                                        min="0"
                                        value={formData.availableBatteries || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, availableBatteries: value === '' ? 0 : parseInt(value) || 0 }));
                                        }}
                                        className={`${errors.availableBatteries ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-600 hover:border-blue-700"
                        >
                            {station ? 'Update' : 'Add Station'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
