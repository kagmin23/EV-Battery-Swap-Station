import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import type { Staff, AddStaffRequest, UpdateStaffRequest, StaffRole, Station } from '../types/staff';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddStaffRequest | UpdateStaffRequest) => void;
  staff?: Staff | null;
  stations: Station[];
  isSaving?: boolean;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  stations,
  isSaving = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF' as StaffRole,
    stationId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        stationId: staff.stationId,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'STAFF',
        stationId: '',
      });
    }
    setErrors({});
  }, [staff, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.stationId) {
      newErrors.stationId = 'Please select a station';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (staff) {
      // Update existing staff
      const updateData: UpdateStaffRequest = {
        id: staff.id,
        ...formData,
      };
      onSave(updateData);
    } else {
      // Add new staff
      const addData: AddStaffRequest = {
        ...formData,
      };
      onSave(addData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STAFF',
      stationId: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? 'Edit Staff' : 'Add New Staff'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as StaffRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="station">Working Station *</Label>
                  <Select
                    value={formData.stationId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, stationId: value }))}
                  >
                    <SelectTrigger className={errors.stationId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name} - {station.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stationId && <p className="text-sm text-red-500">{errors.stationId}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <ButtonLoadingSpinner size="sm" variant="default" text="Saving..." />
              ) : (
                staff ? 'Update' : 'Add New'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
