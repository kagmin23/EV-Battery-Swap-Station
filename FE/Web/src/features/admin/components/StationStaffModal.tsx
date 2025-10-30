import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Users,
    X,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Trash2,
    AlertCircle
} from 'lucide-react';
import type { Station } from '../types/station';
import type { Staff } from '../types/staff';

interface StationStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    station: Station | null;
    staff: Staff[];
    onRemoveStaff?: (stationId: string, staffId: string) => void;
    onReloadStaff?: () => void;
    savingStaffId?: string | null;
}

export const StationStaffModal: React.FC<StationStaffModalProps> = ({
    isOpen,
    onClose,
    station,
    staff = [],
    onRemoveStaff,
    onReloadStaff,
    savingStaffId
}) => {
    const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
    const [staffToRemove, setStaffToRemove] = useState<Staff | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    if (!station) return null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle remove staff - show confirmation
    const handleRemoveStaff = (staff: Staff) => {
        setStaffToRemove(staff);
        setShowRemoveConfirm(true);
    };

    // Confirm remove staff
    const confirmRemoveStaff = async () => {
        if (!staffToRemove || !station || !onRemoveStaff) return;
        setSubmitError(null);
        try {
            await onRemoveStaff(station.id, staffToRemove.id);
            setStaffToRemove(null);
            setShowRemoveConfirm(false);
            setSubmitError(null);
            if (onReloadStaff) await onReloadStaff();
        } catch (error: any) {
            setSubmitError(error?.message || 'Unable to remove staff member. Please try again.');
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                    <DialogHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
                                <div className="p-2 bg-purple-100 rounded-xl mr-3">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                Station Staff
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Station Info */}
                        <Card className="shadow-sm border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                            <MapPin className="h-10 w-10" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{station.name}</h2>
                                                <p className="text-lg text-slate-600 mb-3">{station.address}</p>
                                                <p className="text-sm text-slate-500 mb-3">{station.city}, {station.district}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Staff */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                                    Current Staff ({staff.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {staff.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-lg font-medium">No staff assigned</p>
                                        <p className="text-slate-400 text-sm">No staff members have been assigned to this station</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {staff.map((staffMember) => (
                                            <div key={staffMember.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-start space-x-3">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {staffMember.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-semibold text-slate-800 truncate">{staffMember.name}</h4>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-slate-600">
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate">{staffMember.email}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{staffMember.phone}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Joined: {formatDate(staffMember.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {onRemoveStaff && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveStaff(staffMember)}
                                                            disabled={savingStaffId === staffMember.id}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-sm"
                                                        >
                                                            {savingStaffId === staffMember.id ? (
                                                                'Processing...'
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove Confirmation Dialog */}
            <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
                <AlertDialogContent className="bg-white border-2 border-slate-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900">Confirm Remove Staff</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-700">
                            Are you sure you want to remove <strong>{staffToRemove?.name}</strong> from station <strong>{station?.name}</strong>?
                            <br />
                            <br />
                            Staff member can be assigned to other stations after removal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={savingStaffId === staffToRemove?.id} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveStaff}
                            disabled={savingStaffId === staffToRemove?.id}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingStaffId === staffToRemove?.id ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Removing...
                                </div>
                            ) : (
                                'Confirm Remove'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    {submitError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-2 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                            <span className="font-medium">{submitError}</span>
                        </div>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
