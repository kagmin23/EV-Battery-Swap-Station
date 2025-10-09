import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Activity,
  Edit,
  Key,
  UserX
} from 'lucide-react';
import type { Staff, StaffActivity } from '../types/staff';

interface StaffDetailPanelProps {
  staff: Staff | null;
  activities: StaffActivity[];
  onEdit: (staff: Staff) => void;
  onResetPassword: (staff: Staff) => void;
  onSuspend: (staff: Staff) => void;
  onPermissionChange: (staffId: string, permissionId: string, enabled: boolean) => void;
}

export const StaffDetailPanel: React.FC<StaffDetailPanelProps> = ({
  staff,
  activities,
  onEdit,
  onResetPassword,
  onSuspend,
  onPermissionChange
}) => {
  if (!staff) {
    return (
      <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <UserX className="h-10 w-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-600">Chưa chọn nhân viên</h3>
              <p className="text-sm text-slate-500">Chọn một nhân viên từ danh sách để xem chi tiết</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <Badge variant="success">Trực tuyến</Badge>;
      case 'OFFLINE':
        return <Badge variant="secondary">Ngoại tuyến</Badge>;
      case 'SHIFT_ACTIVE':
        return <Badge variant="default">Đang ca</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">Tạm khóa</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MANAGER':
        return <Badge variant="outline">Quản lý</Badge>;
      case 'SUPERVISOR':
        return <Badge variant="outline">Giám sát</Badge>;
      case 'STAFF':
        return <Badge variant="outline">Nhân viên</Badge>;
      default:
        return <Badge variant="outline">Nhân viên</Badge>;
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
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'BATTERY_SWAP':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'PAYMENT':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'MAINTENANCE':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'LOGIN':
        return <UserX className="h-4 w-4 text-green-500" />;
      case 'LOGOUT':
        return <UserX className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Info */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-xl">
                  <AvatarImage src={staff.avatar} alt={staff.name} />
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(staff.name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${staff.status === 'ONLINE' ? 'bg-green-500' :
                  staff.status === 'SHIFT_ACTIVE' ? 'bg-blue-500' :
                    staff.status === 'OFFLINE' ? 'bg-gray-400' : 'bg-red-500'
                  }`} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">{staff.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleBadge(staff.role)}
                  {getStatusBadge(staff.status)}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(staff)} className="hover:bg-blue-50 hover:border-blue-300">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" onClick={() => onResetPassword(staff)} className="hover:bg-green-50 hover:border-green-300">
                <Key className="h-4 w-4 mr-2" />
                Đặt lại mật khẩu
              </Button>
              {staff.status !== 'SUSPENDED' && (
                <Button variant="destructive" size="sm" onClick={() => onSuspend(staff)} className="hover:bg-red-600">
                  <UserX className="h-4 w-4 mr-2" />
                  Tạm khóa
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-lg">
                <Mail className="h-4 w-4 mr-3 text-blue-500" />
                <span className="font-medium">{staff.email}</span>
              </div>
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-lg">
                <Phone className="h-4 w-4 mr-3 text-green-500" />
                <span className="font-medium">{staff.phone}</span>
              </div>
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 mr-3 text-purple-500" />
                <span className="font-medium">{staff.stationName}</span>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="text-sm bg-slate-100 p-3 rounded-lg">
                <span className="text-slate-600 font-medium">ID nhân viên:</span>
                <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded">{staff.id}</span>
              </div>
              <div className="text-sm bg-slate-100 p-3 rounded-lg">
                <span className="text-slate-600 font-medium">Ngày tạo:</span>
                <span className="ml-2 font-medium">{formatDate(staff.createdAt)}</span>
              </div>
              <div className="text-sm bg-slate-100 p-3 rounded-lg">
                <span className="text-slate-600 font-medium">Cập nhật cuối:</span>
                <span className="ml-2 font-medium">{formatDate(staff.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold text-slate-800">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            Quyền hạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{permission.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{permission.description}</div>
                </div>
                <Switch
                  checked={permission.enabled}
                  onCheckedChange={(checked) =>
                    onPermissionChange(staff.id, permission.id, checked)
                  }
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold text-slate-800">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Không có hoạt động nào</p>
              </div>
            ) : (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{activity.description}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
