import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, MapPin } from 'lucide-react';
import type { Staff, StaffRole, StaffStatus } from '../types/staff';

interface StaffCardProps {
  staff: Staff;
  onSelect: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onSuspend: (staff: Staff) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onSelect,
  onEdit,
  onSuspend
}) => {
  const getStatusBadge = (status: StaffStatus) => {
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

  const getRoleBadge = (role: StaffRole) => {
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

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
      onClick={() => onSelect(staff)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg">
                <AvatarImage src={staff.avatar} alt={staff.name} />
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {getInitials(staff.name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${staff.status === 'ONLINE' ? 'bg-green-500' :
                staff.status === 'SHIFT_ACTIVE' ? 'bg-blue-500' :
                  staff.status === 'OFFLINE' ? 'bg-gray-400' : 'bg-red-500'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 truncate text-lg">{staff.name}</h3>
              <p className="text-sm text-slate-500 truncate">{staff.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getRoleBadge(staff.role)}
                {getStatusBadge(staff.status)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu actions
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span className="truncate font-medium">{staff.stationName}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
            <Phone className="h-4 w-4 mr-2 text-green-500" />
            <span>{staff.phone}</span>
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
            <span className="font-medium">Hoạt động cuối:</span> {formatLastActive(staff.lastActive)}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(staff);
            }}
            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            Chỉnh sửa
          </Button>
          {staff.status !== 'SUSPENDED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSuspend(staff);
              }}
              className="hover:bg-red-600 transition-colors"
            >
              Tạm khóa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
