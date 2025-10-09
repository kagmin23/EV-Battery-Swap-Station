import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Users,
    Settings,
    UserPlus,
    Activity,
    Home,
    ChevronLeft,
    ChevronRight,
    Car,
    CreditCard,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const menuItems = [
    {
        id: 'overview',
        label: 'Tổng quan',
        icon: Home,
        description: 'Thống kê tổng quan'
    },
    {
        id: 'driver-list',
        label: 'Danh sách tài xế',
        icon: Users,
        description: 'Quản lý tài xế'
    },
    {
        id: 'vehicles',
        label: 'Phương tiện',
        icon: Car,
        description: 'Quản lý xe điện'
    },
    {
        id: 'subscriptions',
        label: 'Gói thuê',
        icon: CreditCard,
        description: 'Quản lý gói thuê pin'
    },
    {
        id: 'transactions',
        label: 'Giao dịch',
        icon: FileText,
        description: 'Lịch sử giao dịch'
    },
    {
        id: 'support',
        label: 'Hỗ trợ',
        icon: Activity,
        description: 'Hỗ trợ khách hàng'
    },
    {
        id: 'settings',
        label: 'Cài đặt',
        icon: Settings,
        description: 'Cài đặt hệ thống'
    }
];

export const DriverSidebar: React.FC<DriverSidebarProps> = ({
    activeTab,
    onTabChange,
    isCollapsed,
    onToggleCollapse
}) => {
    return (
        <div className={cn(
            "bg-white/90 backdrop-blur-xl border-r border-slate-200/60 shadow-xl transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                Quản lý tài xế
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">Hệ thống quản lý</p>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleCollapse}
                        className="p-3 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <Button
                            key={item.id}
                            variant={isActive ? "default" : "ghost"}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full justify-start transition-all duration-200 py-8",
                                isCollapsed ? "px-5" : "px-8",
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                                    : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                            )}
                        >
                            <Icon
                                className={cn("h-6 w-6 flex-shrink-0", isCollapsed ? "" : "mr-3")}
                                style={{ width: '24px', height: '24px' }}
                            />
                            {!isCollapsed && (
                                <div className="flex-1 text-left">
                                    <div className="text-lg font-medium">{item.label}</div>
                                </div>
                            )}
                        </Button>
                    );
                })}
            </nav>

            {/* Quick Actions */}
            {!isCollapsed && (
                <div className="p-4 border-t border-slate-200/60">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Thao tác nhanh</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-base py-5 px-6"
                        >
                            <UserPlus
                                className="h-6 w-6 mr-2 flex-shrink-0"
                                style={{ width: '24px', height: '24px' }}
                            />
                            Thêm tài xế
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
