import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Clock,
    Activity,
    Edit,
    Key,
    Ban,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import type { Staff, StaffActivity } from '../types/staff';

interface StaffDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff | null;
    activities: StaffActivity[];
    onEdit: (staff: Staff) => void;
    onResetPassword: (staff: Staff) => void;
    onSuspend: (staff: Staff) => void;
    onPermissionChange: (staffId: string, permissionId: string, enabled: boolean) => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
    isOpen,
    onClose,
    staff,
    activities,
    onEdit,
    onResetPassword,
    onSuspend,
    onPermissionChange
}) => {
    if (!staff) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE':
                return 'text-green-600 bg-green-100';
            case 'SHIFT_ACTIVE':
                return 'text-orange-600 bg-orange-100';
            case 'OFFLINE':
                return 'text-gray-600 bg-gray-100';
            case 'SUSPENDED':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ONLINE':
                return <CheckCircle className="h-4 w-4" />;
            case 'SHIFT_ACTIVE':
                return <Clock className="h-4 w-4" />;
            case 'OFFLINE':
                return <XCircle className="h-4 w-4" />;
            case 'SUSPENDED':
                return <Ban className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'MANAGER':
                return 'Quản lý';
            case 'SUPERVISOR':
                return 'Giám sát';
            case 'STAFF':
                return 'Nhân viên';
            default:
                return role;
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes} phút trước`;
        } else if (hours < 24) {
            return `${hours} giờ trước`;
        } else {
            return `${days} ngày trước`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                        Thông tin chi tiết nhân viên
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-blue-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                                <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Họ tên</div>
                                            <div className="text-lg font-semibold text-slate-800">{staff.name}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Email</div>
                                            <div className="text-slate-800">{staff.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Số điện thoại</div>
                                            <div className="text-slate-800">{staff.phone}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Vai trò</div>
                                            <div className="text-slate-800">{getRoleText(staff.role)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Trạm làm việc</div>
                                            <div className="text-slate-800">{staff.stationName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="h-5 w-5 flex items-center justify-center">
                                            {getStatusIcon(staff.status)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Trạng thái</div>
                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                                                {staff.status === 'ONLINE' ? 'Đang online' :
                                                    staff.status === 'SHIFT_ACTIVE' ? 'Đang ca làm' :
                                                        staff.status === 'OFFLINE' ? 'Offline' :
                                                            staff.status === 'SUSPENDED' ? 'Tạm khóa' : staff.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-center space-x-3">
                                    <Clock className="h-5 w-5 text-slate-500" />
                                    <div>
                                        <div className="text-sm font-medium text-slate-500">Hoạt động cuối</div>
                                        <div className="text-slate-800">
                                            {formatDate(staff.lastActive)} ({formatRelativeTime(staff.lastActive)})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                                <div className="p-2 bg-green-100 rounded-xl mr-3">
                                    <Shield className="h-5 w-5 text-green-600" />
                                </div>
                                Quyền hạn
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {staff.permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800">{permission.name}</div>
                                            <div className="text-sm text-slate-500">{permission.description}</div>
                                        </div>
                                        <Button
                                            variant={permission.enabled ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onPermissionChange(staff.id, permission.id, !permission.enabled)}
                                            className={permission.enabled
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : "hover:bg-slate-100"
                                            }
                                        >
                                            {permission.enabled ? 'Bật' : 'Tắt'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-amber-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                                <div className="p-2 bg-orange-100 rounded-xl mr-3">
                                    <Activity className="h-5 w-5 text-orange-600" />
                                </div>
                                Hoạt động gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activities.length > 0 ? (
                                    activities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-slate-800">{activity.description}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {formatDate(activity.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Chưa có hoạt động nào</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <Button
                            variant="outline"
                            onClick={() => onResetPassword(staff)}
                            className="flex items-center space-x-2"
                        >
                            <Key className="h-4 w-4" />
                            <span>Đặt lại mật khẩu</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => onSuspend(staff)}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Ban className="h-4 w-4" />
                            <span>Tạm khóa</span>
                        </Button>

                        <Button
                            onClick={() => onEdit(staff)}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Chỉnh sửa</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
