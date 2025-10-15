import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  Settings,
  UserPlus,
  Activity,
  Home,
  ChevronLeft,
  ChevronRight,
  Car,
  CreditCard,
  FileText,
  UserCheck,
  Battery
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManagementSidebarProps {
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
    id: 'staff-list',
    label: 'Danh sách nhân viên',
    icon: Users,
    description: 'Quản lý nhân viên'
  },
  {
    id: 'staff-distribution',
    label: 'Phân bố nhân viên',
    icon: BarChart3,
    description: 'Phân tích phân bố'
  },
  {
    id: 'staff-activities',
    label: 'Hoạt động nhân viên',
    icon: Activity,
    description: 'Theo dõi hoạt động'
  },
  {
    id: 'driver-list',
    label: 'Danh sách tài xế',
    icon: UserCheck,
    description: 'Quản lý tài xế'
  },
  {
    id: 'battery-inventory',
    label: 'Kho pin',
    icon: Battery,
    description: 'Quản lý kho pin'
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
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    description: 'Cài đặt hệ thống'
  }
];

export const ManagementSidebar: React.FC<ManagementSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div className={cn(
      "h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col",
      isCollapsed ? "w-20" : "w-72"
    )} style={{ height: '100%' }}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Quản lý
              </h2>
              <p className="text-sm text-gray-500 font-medium">Hệ thống quản lý</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
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
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar min-h-0">
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
                isCollapsed ? "px-5" : "px-6",
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
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
        <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Thao tác nhanh</h3>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-base py-6 px-6"
            >
              <UserPlus
                className="h-6 w-6 mr-2 flex-shrink-0"
                style={{ width: '24px', height: '24px' }}
              />
              Thêm người dùng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
