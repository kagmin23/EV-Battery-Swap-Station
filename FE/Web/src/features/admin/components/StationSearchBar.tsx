import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StationFilters, StationStatus } from '../types/station';

interface StationSearchBarProps {
    filters: StationFilters;
    onFiltersChange: (filters: StationFilters) => void;
}

export const StationSearchBar: React.FC<StationSearchBarProps> = ({
    filters,
    onFiltersChange
}) => {
    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, search: value });
    };

    const handleCityChange = (value: string) => {
        onFiltersChange({ ...filters, city: value });
    };

    const handleDistrictChange = (value: string) => {
        onFiltersChange({ ...filters, district: value });
    };

    const handleStatusChange = (value: string) => {
        onFiltersChange({ ...filters, status: value as StationStatus | 'ALL' });
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
                        placeholder="Tìm kiếm trạm theo tên, địa chỉ, thành phố, quận..."
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* City Filter */}
                    <Select value={filters.city} onValueChange={handleCityChange}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl">
                            <SelectValue placeholder="Thành phố" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="ALL">Tất cả thành phố</SelectItem>
                            <SelectItem value="Ho Chi Minh City">TP.HCM</SelectItem>
                            <SelectItem value="Hanoi">Hà Nội</SelectItem>
                            <SelectItem value="Da Nang">Đà Nẵng</SelectItem>
                            <SelectItem value="Hai Phong">Hải Phòng</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* District Filter */}
                    <Select value={filters.district} onValueChange={handleDistrictChange}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl">
                            <SelectValue placeholder="Quận/Huyện" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="ALL">Tất cả quận</SelectItem>
                            <SelectItem value="District 1">Quận 1</SelectItem>
                            <SelectItem value="District 2">Quận 2</SelectItem>
                            <SelectItem value="District 3">Quận 3</SelectItem>
                            <SelectItem value="District 4">Quận 4</SelectItem>
                            <SelectItem value="District 5">Quận 5</SelectItem>
                            <SelectItem value="District 6">Quận 6</SelectItem>
                            <SelectItem value="District 7">Quận 7</SelectItem>
                            <SelectItem value="District 8">Quận 8</SelectItem>
                            <SelectItem value="District 9">Quận 9</SelectItem>
                            <SelectItem value="District 10">Quận 10</SelectItem>
                            <SelectItem value="District 11">Quận 11</SelectItem>
                            <SelectItem value="District 12">Quận 12</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                            <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
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
