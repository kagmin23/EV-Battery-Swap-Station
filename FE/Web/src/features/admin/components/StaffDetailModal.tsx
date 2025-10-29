import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Shield,
    X
} from 'lucide-react';
import type { Staff, StaffRole, StaffStatus } from '../types/staff';

interface StaffDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff | null;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
    isOpen,
    onClose,
    staff
}) => {
    if (!staff) return null;

    const getStatusBadge = (status: StaffStatus) => {
        switch (status) {
            case 'ONLINE':
                return <Badge variant="success">Online</Badge>;
            case 'OFFLINE':
                return <Badge variant="secondary">Offline</Badge>;
            case 'SHIFT_ACTIVE':
                return <Badge variant="default">On Shift</Badge>;
            case 'SUSPENDED':
                return <Badge variant="destructive">Suspended</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const getRoleBadge = (role: StaffRole) => {
        switch (role) {
            case 'MANAGER':
                return <Badge variant="outline">Manager</Badge>;
            case 'SUPERVISOR':
                return <Badge variant="outline">Supervisor</Badge>;
            case 'STAFF':
                return <Badge variant="outline">Staff</Badge>;
            default:
                return <Badge variant="outline">Staff</Badge>;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            Staff Details
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
                    {/* Header Info */}
                    <Card className="shadow-sm border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                                        <AvatarImage src={staff.avatar} alt={staff.name} />
                                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                            {getInitials(staff.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${staff.status === 'ONLINE' ? 'bg-green-500' :
                                        staff.status === 'SHIFT_ACTIVE' ? 'bg-blue-500' :
                                            staff.status === 'OFFLINE' ? 'bg-gray-400' : 'bg-red-500'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{staff.name}</h2>
                                            <p className="text-lg text-slate-600 mb-3">{staff.email}</p>
                                            <div className="flex items-center space-x-3">
                                                {getRoleBadge(staff.role)}
                                                {getStatusBadge(staff.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Email</p>
                                        <p className="font-medium text-slate-800">{staff.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Phone className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Phone Number</p>
                                        <p className="font-medium text-slate-800">{staff.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Work Station</p>
                                        <p className="font-medium text-slate-800">{staff.stationName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Role</p>
                                        <p className="font-medium text-slate-800">
                                            {staff.role === 'MANAGER' ? 'Manager' :
                                                staff.role === 'SUPERVISOR' ? 'Supervisor' : 'Staff'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-green-600" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Account Created</p>
                                        <p className="font-medium text-slate-800">{formatDate(staff.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Last Updated</p>
                                        <p className="font-medium text-slate-800">{formatDate(staff.updatedAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-slate-600">Status</p>
                                        <p className="font-medium text-slate-800">
                                            {staff.status === 'ONLINE' ? 'Online' :
                                                staff.status === 'OFFLINE' ? 'Offline' :
                                                    staff.status === 'SHIFT_ACTIVE' ? 'On Shift' : 'Suspended'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    {staff.permissions && staff.permissions.length > 0 && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                                    Permissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {staff.permissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                            <div className={`w-2 h-2 rounded-full ${permission.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{permission.name}</p>
                                                <p className="text-sm text-slate-600">{permission.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Shift Information */}
                    {staff.shiftStart && staff.shiftEnd && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                                    Shift Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                        <Clock className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-slate-600">Shift Start</p>
                                            <p className="font-medium text-slate-800">{formatDate(staff.shiftStart)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                        <Clock className="h-5 w-5 text-red-500" />
                                        <div>
                                            <p className="text-sm text-slate-600">Shift End</p>
                                            <p className="font-medium text-slate-800">{formatDate(staff.shiftEnd)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};




