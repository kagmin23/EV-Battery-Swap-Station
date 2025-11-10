import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import type { Station } from '../types/station';
import type { CreatePillarFormData } from '../types/pillar.ts';

interface CreatePillarModalProps {
    isOpen: boolean;
    onClose: () => void;
    station: Station | null;
    onCreate: (data: CreatePillarFormData) => Promise<void>;
    isSubmitting?: boolean;
    errorMessage?: string | null;
}

const DEFAULT_TOTAL_SLOTS = 10;

export const CreatePillarModal: React.FC<CreatePillarModalProps> = ({
    isOpen,
    onClose,
    station,
    onCreate,
    isSubmitting = false,
    errorMessage = null,
}) => {
    const [formData, setFormData] = useState<CreatePillarFormData>({
        pillarName: '',
        pillarNumber: 1,
        totalSlots: DEFAULT_TOTAL_SLOTS,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                pillarName: '',
                pillarNumber: 1,
                totalSlots: DEFAULT_TOTAL_SLOTS,
            });
            setErrors({});
            setSubmitError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        setSubmitError(errorMessage ?? null);
    }, [errorMessage]);

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!formData.pillarName.trim()) {
            nextErrors.pillarName = 'Pillar name is required';
        }

        if (Number.isNaN(formData.pillarNumber) || formData.pillarNumber <= 0) {
            nextErrors.pillarNumber = 'Pillar number must be greater than 0';
        }

        if (
            formData.totalSlots !== undefined &&
            (Number.isNaN(formData.totalSlots) || formData.totalSlots <= 0)
        ) {
            nextErrors.totalSlots = 'Total slots must be greater than 0';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;
        try {
            await onCreate(formData);
            setSubmitError(null);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unable to create pillar. Please try again.';
            setSubmitError(message);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md border border-slate-200 shadow-2xl drop-shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-slate-800">
                        Add New Pillar
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        {station
                            ? `Assign a new pillar to ${station.name}`
                            : 'Select a station to create a pillar.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pillarName">Pillar Name</Label>
                            <Input
                                id="pillarName"
                                value={formData.pillarName}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        pillarName: event.target.value,
                                    }))
                                }
                                placeholder="e.g., Pillar A"
                                className={errors.pillarName ? 'border-red-500' : ''}
                                required
                            />
                            {errors.pillarName && (
                                <p className="text-sm text-red-500">{errors.pillarName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pillarNumber">Pillar Number</Label>
                            <Input
                                id="pillarNumber"
                                type="number"
                                min={1}
                                value={formData.pillarNumber}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        pillarNumber:
                                            event.target.value === ''
                                                ? (NaN as unknown as number)
                                                : Number.parseInt(event.target.value, 10),
                                    }))
                                }
                                className={`${errors.pillarNumber ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                required
                            />
                            {errors.pillarNumber && (
                                <p className="text-sm text-red-500">{errors.pillarNumber}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalSlots">Total Slots</Label>
                            <Input
                                id="totalSlots"
                                type="number"
                                min={1}
                                value={formData.totalSlots ?? ''}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        totalSlots:
                                            event.target.value === ''
                                                ? undefined
                                                : Number.parseInt(event.target.value, 10),
                                    }))
                                }
                                className={`${errors.totalSlots ? 'border-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                placeholder={`${DEFAULT_TOTAL_SLOTS}`}
                            />
                            {errors.totalSlots && (
                                <p className="text-sm text-red-500">{errors.totalSlots}</p>
                            )}
                        </div>
                    </div>

                    {submitError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {submitError}
                        </div>
                    )}

                    <DialogFooter className="justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !station}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-600 hover:border-blue-700 disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <ButtonLoadingSpinner size="sm" variant="white" text="Saving..." />
                            ) : (
                                'Create Pillar'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePillarModal;


