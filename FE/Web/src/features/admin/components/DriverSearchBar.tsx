import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DriverFilters, DriverLicenseType } from '../types/driver';

interface DriverSearchBarProps {
    filters: DriverFilters;
    onFiltersChange: (filters: DriverFilters) => void;
    subscriptionPlans: { id: string; name: string }[];
    onResetFilters?: () => void;
}

export const DriverSearchBar: React.FC<DriverSearchBarProps> = ({
    filters,
    onFiltersChange,
    subscriptionPlans,
    onResetFilters
}) => {
    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, search: value });
    };

    const handleStatusChange = (value: string) => {
        onFiltersChange({ ...filters, status: value as any });
    };

    const handleSubscriptionPlanChange = (value: string) => {
        onFiltersChange({ ...filters, subscriptionPlan: value });
    };

    const handleLicenseTypeChange = (value: string) => {
        onFiltersChange({ ...filters, licenseType: value as DriverLicenseType | 'ALL' });
    };

    const handleCityChange = (value: string) => {
        onFiltersChange({ ...filters, city: value });
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
                        placeholder="Tìm kiếm tài xế theo tên, email, SĐT, bằng lái..."
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                            <SelectItem
                                value="ALL"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem
                                value="ACTIVE"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Hoạt động
                            </SelectItem>
                            <SelectItem
                                value="INACTIVE"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Không hoạt động
                            </SelectItem>
                            <SelectItem
                                value="SUSPENDED"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Tạm khóa
                            </SelectItem>
                            <SelectItem
                                value="PENDING_VERIFICATION"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Chờ xác thực
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Subscription Plan Filter */}
                    <Select value={filters.subscriptionPlan} onValueChange={handleSubscriptionPlanChange}>
                        <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                            <SelectValue placeholder="Gói thuê" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                            <SelectItem
                                value="ALL"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Tất cả gói thuê
                            </SelectItem>
                            {subscriptionPlans.map((plan) => (
                                <SelectItem
                                    key={plan.id}
                                    value={plan.id}
                                    className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                >
                                    {plan.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* License Type Filter */}
                    <Select value={filters.licenseType} onValueChange={handleLicenseTypeChange}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                            <SelectValue placeholder="Loại bằng" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                            <SelectItem
                                value="ALL"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Tất cả loại bằng
                            </SelectItem>
                            <SelectItem
                                value="A1"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                A1
                            </SelectItem>
                            <SelectItem
                                value="A2"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                A2
                            </SelectItem>
                            <SelectItem
                                value="A3"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                A3
                            </SelectItem>
                            <SelectItem
                                value="B1"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                B1
                            </SelectItem>
                            <SelectItem
                                value="B2"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                B2
                            </SelectItem>
                            <SelectItem
                                value="C"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                C
                            </SelectItem>
                            <SelectItem
                                value="D"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                D
                            </SelectItem>
                            <SelectItem
                                value="E"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                E
                            </SelectItem>
                            <SelectItem
                                value="F"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                F
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* City Filter */}
                    <Select value={filters.city} onValueChange={handleCityChange}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                            <SelectValue placeholder="Thành phố" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                            <SelectItem
                                value="ALL"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Tất cả thành phố
                            </SelectItem>
                            <SelectItem
                                value="TP.HCM"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                TP.HCM
                            </SelectItem>
                            <SelectItem
                                value="Hà Nội"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Hà Nội
                            </SelectItem>
                            <SelectItem
                                value="Đà Nẵng"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Đà Nẵng
                            </SelectItem>
                            <SelectItem
                                value="Hải Phòng"
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                            >
                                Hải Phòng
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
