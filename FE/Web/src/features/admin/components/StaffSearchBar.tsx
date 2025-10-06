import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StaffFilters, StaffRole, StaffStatus } from '../types/staff';

interface StaffSearchBarProps {
  filters: StaffFilters;
  onFiltersChange: (filters: StaffFilters) => void;
  stations: { id: string; name: string }[];
}

export const StaffSearchBar: React.FC<StaffSearchBarProps> = ({
  filters,
  onFiltersChange,
  stations
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStationChange = (value: string) => {
    onFiltersChange({ ...filters, stationId: value });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({ ...filters, role: value as StaffRole | 'ALL' });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as StaffStatus | 'ALL' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-xl">
          <Search className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Tìm kiếm & Lọc</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Tìm kiếm nhân viên theo tên, email..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Station Filter */}
          <Select value={filters.stationId} onValueChange={handleStationChange}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl">
              <SelectValue placeholder="Chọn trạm" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="ALL">Tất cả trạm</SelectItem>
              {stations.map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select value={filters.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              <SelectItem value="STAFF">Nhân viên</SelectItem>
              <SelectItem value="SUPERVISOR">Giám sát</SelectItem>
              <SelectItem value="MANAGER">Quản lý</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ONLINE">Trực tuyến</SelectItem>
              <SelectItem value="OFFLINE">Ngoại tuyến</SelectItem>
              <SelectItem value="SHIFT_ACTIVE">Đang ca</SelectItem>
              <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
