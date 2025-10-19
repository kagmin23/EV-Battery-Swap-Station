import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    Plus,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Trash2,
    Search,
    UserPlus,
    AlertCircle
} from 'lucide-react';
import { StationService } from '@/services/api/stationService';
import { toast } from 'sonner';
import type { Station } from '../types/station';
import type { Staff } from '../types/staff';

interface StationStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    station: Station | null;
    staff: Staff[];
    allStaff: Staff[];
    onAddStaff?: (stationId: string, staffId: string) => void;
    onRemoveStaff?: (stationId: string, staffId: string) => void;
    onReloadStaff?: () => void;
    savingStaffId?: string | null;
}

export const StationStaffModal: React.FC<StationStaffModalProps> = ({
    isOpen,
    onClose,
    station,
    staff = [],
    allStaff = [],
    onAddStaff,
    onRemoveStaff,
    onReloadStaff,
    savingStaffId
}) => {
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState<boolean>(false);
    const [showAssignConfirm, setShowAssignConfirm] = useState<boolean>(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
    const [staffToAssign, setStaffToAssign] = useState<string>('');
    const [staffToRemove, setStaffToRemove] = useState<Staff | null>(null);

    if (!station) return null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ONLINE':
                return <Badge variant="success">Online</Badge>;
            case 'OFFLINE':
                return <Badge variant="secondary">Offline</Badge>;
            default:
                return <Badge variant="secondary">Không xác định</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE':
                return 'bg-green-500';
            case 'OFFLINE':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    // Filter available staff (not assigned to any station)
    const availableStaff = allStaff.filter(s =>
        s.stationId === 'default' && // Only staff not assigned to any station
        (searchTerm === '' ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter assigned staff (assigned to other stations)
    const assignedStaff = allStaff.filter(s =>
        s.stationId !== 'default' && s.stationId !== station.id &&
        (searchTerm === '' ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handle adding staff - show confirmation
    const handleAddStaff = () => {
        if (!selectedStaffId || !station) return;
        setStaffToAssign(selectedStaffId);
        setShowAssignConfirm(true);
    };

    // Handle quick add staff - show confirmation
    const handleQuickAddStaff = (staffId: string) => {
        if (!station) return;
        setStaffToAssign(staffId);
        setShowAssignConfirm(true);
    };

    // Confirm assign staff
    const confirmAssignStaff = async () => {
        if (!staffToAssign || !station) return;

        setIsAssigning(true);
        try {
            await StationService.assignStaffToStation(station.id, [staffToAssign]);
            toast.success('Đã phân công nhân viên thành công!');
            setSelectedStaffId('');
            setStaffToAssign('');
            setShowAssignConfirm(false);
            if (onReloadStaff) {
                await onReloadStaff();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân công nhân viên');
        } finally {
            setIsAssigning(false);
        }
    };

    // Handle remove staff - show confirmation
    const handleRemoveStaff = (staff: Staff) => {
        setStaffToRemove(staff);
        setShowRemoveConfirm(true);
    };

    // Confirm remove staff
    const confirmRemoveStaff = async () => {
        if (!staffToRemove || !station || !onRemoveStaff) return;

        try {
            await onRemoveStaff(station.id, staffToRemove.id);
            setStaffToRemove(null);
            setShowRemoveConfirm(false);
            if (onReloadStaff) {
                await onReloadStaff();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa nhân viên');
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
                                Nhân viên trạm {station.name}
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
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{station.name}</h3>
                                        <p className="text-sm text-slate-600">{station.address}</p>
                                        <p className="text-xs text-slate-500">{station.city}, {station.district}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Staff */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                                    Nhân viên hiện tại ({staff.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {staff.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-lg font-medium">Chưa có nhân viên nào</p>
                                        <p className="text-slate-400 text-sm">Chưa có nhân viên nào được phân công cho trạm này</p>
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
                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(staffMember.status)}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-semibold text-slate-800 truncate">{staffMember.name}</h4>
                                                            {getStatusBadge(staffMember.status)}
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
                                                                <span>Tham gia: {formatDate(staffMember.createdAt)}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Clock className="h-3 w-3" />
                                                                <span>Hoạt động: {formatDate(staffMember.lastActive)}</span>
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
                                                                'Đang xử lý...'
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

                        {/* Add Staff */}
                        {onAddStaff && allStaff.length > 0 && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                                        <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                                        Thêm nhân viên vào trạm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Quick Add Section */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                                            <Search className="h-4 w-4 mr-2 text-blue-600" />
                                            Tìm kiếm và thêm nhanh
                                        </h4>
                                        <div className="flex space-x-2 mb-3">
                                            <Input
                                                placeholder="Tìm kiếm nhân viên..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                                                <SelectTrigger className="w-64">
                                                    <SelectValue placeholder="Chọn nhân viên..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStaff.map((staffMember) => (
                                                        <SelectItem key={staffMember.id} value={staffMember.id}>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                    {staffMember.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span>{staffMember.name}</span>
                                                                <span className="text-slate-500 text-sm">({staffMember.email})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                onClick={handleAddStaff}
                                                disabled={!selectedStaffId || isAssigning}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {isAssigning ? (
                                                    'Đang phân công...'
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Phân công
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Available Staff List */}
                                    {availableStaff.length === 0 && assignedStaff.length === 0 ? (
                                        <div className="text-center py-8">
                                            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 text-lg font-medium">
                                                {searchTerm ? 'Không tìm thấy nhân viên phù hợp' : 'Tất cả nhân viên đã được phân công'}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Tất cả nhân viên đã được gán cho các trạm khác'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="font-medium text-slate-700 mb-3">
                                                Nhân viên có sẵn ({availableStaff.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {availableStaff.map((staffMember) => (
                                                    <div key={staffMember.id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                                {staffMember.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-semibold text-slate-800 truncate">{staffMember.name}</h4>
                                                                    {getStatusBadge(staffMember.status)}
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
                                                                        <MapPin className="h-3 w-3" />
                                                                        <span className="text-green-600 font-medium">{staffMember.stationName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleQuickAddStaff(staffMember.id)}
                                                                disabled={isAssigning}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-sm"
                                                            >
                                                                {isAssigning ? (
                                                                    'Đang phân công...'
                                                                ) : (
                                                                    <Plus className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assigned Staff List */}
                                    {assignedStaff.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-medium text-slate-700 mb-3 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                                Nhân viên đã được phân công ({assignedStaff.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {assignedStaff.map((staffMember) => (
                                                    <div key={staffMember.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-md transition-all duration-200">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                                {staffMember.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-semibold text-slate-800 truncate">{staffMember.name}</h4>
                                                                    {getStatusBadge(staffMember.status)}
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
                                                                        <MapPin className="h-3 w-3" />
                                                                        <span className="text-amber-600 font-medium">{staffMember.stationName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-amber-600 text-xs font-medium bg-amber-100 px-2 py-1 rounded">
                                                                Đã phân công
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Assign Confirmation Dialog - Outside of Dialog */}
            <AlertDialog open={showAssignConfirm} onOpenChange={setShowAssignConfirm}>
                <AlertDialogContent className="bg-white border-2 border-slate-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900">Xác nhận phân công nhân viên</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-700">
                            Bạn có chắc chắn muốn phân công nhân viên này vào trạm <strong>{station?.name}</strong> không?
                            <br />
                            <br />
                            Nhân viên sẽ không thể được phân công vào trạm khác cho đến khi được gỡ bỏ khỏi trạm hiện tại.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAssigning} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAssignStaff}
                            disabled={isAssigning}
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAssigning ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang phân công...
                                </div>
                            ) : (
                                'Xác nhận phân công'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Remove Confirmation Dialog - Outside of Dialog */}
            <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
                <AlertDialogContent className="bg-white border-2 border-slate-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900">Xác nhận gỡ bỏ nhân viên</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-700">
                            Bạn có chắc chắn muốn gỡ bỏ nhân viên <strong>{staffToRemove?.name}</strong> khỏi trạm <strong>{station?.name}</strong> không?
                            <br />
                            <br />
                            Nhân viên sẽ có thể được phân công vào trạm khác sau khi được gỡ bỏ.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={savingStaffId === staffToRemove?.id} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveStaff}
                            disabled={savingStaffId === staffToRemove?.id}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingStaffId === staffToRemove?.id ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang gỡ bỏ...
                                </div>
                            ) : (
                                'Xác nhận gỡ bỏ'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
