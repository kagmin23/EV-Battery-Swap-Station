import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { Phone, MapPin } from 'lucide-react';
import type { Staff, StaffRole, StaffStatus } from '../types/staff';

interface StaffTableProps {
  staff: Staff[];
  onSelect: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onSuspend: (staff: Staff) => void;
  suspendingStaffId?: string | null;
  savingStaffId?: string | null;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onSelect,
  onEdit,
  onSuspend,
  suspendingStaffId = null,
  savingStaffId = null
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Nhân viên</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Vai trò</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Trạm</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Hoạt động cuối</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((staffMember) => (
            <tr
              key={staffMember.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(staffMember)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={staffMember.avatar} alt={staffMember.name} />
                    <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{staffMember.name}</div>
                    <div className="text-sm text-gray-500">{staffMember.email}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {staffMember.phone}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                {getRoleBadge(staffMember.role)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {staffMember.stationName}
                </div>
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(staffMember.status)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {formatLastActive(staffMember.lastActive)}
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(staffMember);
                    }}
                    disabled={savingStaffId === staffMember.id || suspendingStaffId === staffMember.id}
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingStaffId === staffMember.id ? (
                      <ButtonLoadingSpinner size="sm" variant="default" text="Đang lưu..." />
                    ) : (
                      'Sửa'
                    )}
                  </Button>
                  {staffMember.status !== 'SUSPENDED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSuspend(staffMember);
                      }}
                      disabled={suspendingStaffId === staffMember.id || savingStaffId === staffMember.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                    >
                      {suspendingStaffId === staffMember.id ? (
                        <ButtonLoadingSpinner size="sm" variant="white" text="Đang xử lý..." />
                      ) : (
                        'Khóa'
                      )}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
