import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StaffFilters, StaffRole, StaffStatus } from '../types/staff';

interface StaffSearchBarProps {
  filters: StaffFilters;
  onFiltersChange: (filters: StaffFilters) => void;
  stations: { id: string; name: string }[];
  onResetFilters?: () => void;
}

export const StaffSearchBar: React.FC<StaffSearchBarProps> = ({
  filters,
  onFiltersChange,
  stations,
  onResetFilters
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
        <h3 className="text-lg font-semibold text-slate-800">Search & Filter</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Search staff by name, email..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Station Filter */}
          <Select value={filters.stationId} onValueChange={handleStationChange}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
              <SelectItem
                value="ALL"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                All stations
              </SelectItem>
              {stations.map((station) => (
                <SelectItem
                  key={station.id}
                  value={station.id}
                  className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                >
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select value={filters.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
              <SelectItem
                value="ALL"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                All roles
              </SelectItem>
              <SelectItem
                value="STAFF"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                Staff
              </SelectItem>
              <SelectItem
                value="SUPERVISOR"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                Supervisor
              </SelectItem>
              <SelectItem
                value="MANAGER"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                Manager
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
              <SelectItem
                value="ALL"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                All status
              </SelectItem>
              <SelectItem
                value="active"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                Active
              </SelectItem>
              <SelectItem
                value="locked"
                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
              >
                Locked
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filter Button */}
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="h-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-slate-700 px-4 whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
