import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import type { StaffStats } from '../types/staff';

interface StaffStatsWidgetProps {
  stats: StaffStats;
}

export const StaffStatsWidget: React.FC<StaffStatsWidgetProps> = ({ stats }) => {
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Staff */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Tổng nhân viên</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">{stats.totalStaff}</div>
          <p className="text-xs text-slate-500 mt-1">
            Tất cả nhân viên trong hệ thống
          </p>
        </CardContent>
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
      </Card>

      {/* Online Staff */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Đang trực tuyến</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg">
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.onlineStaff}</div>
          <p className="text-xs text-slate-500 mt-1">
            {getPercentage(stats.onlineStaff, stats.totalStaff)}% tổng nhân viên
          </p>
        </CardContent>
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
      </Card>

      {/* Shift Active Staff */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Đang ca</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{stats.shiftActiveStaff}</div>
          <p className="text-xs text-slate-500 mt-1">
            {getPercentage(stats.shiftActiveStaff, stats.totalStaff)}% tổng nhân viên
          </p>
        </CardContent>
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
      </Card>

      {/* Suspended Staff */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Tạm khóa</CardTitle>
          <div className="p-2 bg-red-100 rounded-lg">
            <UserX className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{stats.suspendedStaff}</div>
          <p className="text-xs text-slate-500 mt-1">
            {getPercentage(stats.suspendedStaff, stats.totalStaff)}% tổng nhân viên
          </p>
        </CardContent>
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10" />
      </Card>
    </div>
  );
};
