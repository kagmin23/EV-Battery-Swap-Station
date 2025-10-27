import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Users,
  Settings,
  UserPlus,
  Home,
  ChevronLeft,
  ChevronRight,
  Car,
  CreditCard,
  FileText,
  UserCheck,
  Battery,
  MapPin,
  AlertTriangle,
  MessageSquareText,
  BarChart3,
  Brain
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
    id: 'driver-list',
    label: 'Danh sách tài xế',
    icon: UserCheck,
    description: 'Quản lý tài xế'
  },
  {
    id: 'station-list',
    label: 'Danh sách trạm',
    icon: MapPin,
    description: 'Quản lý trạm đổi pin'
  },
  {
    id: 'battery-inventory',
    label: 'Kho pin',
    icon: Battery,
    description: 'Quản lý kho pin'
  },
  {
    id: 'faulty-batteries',
    label: 'Pin lỗi',
    icon: AlertTriangle,
    description: 'Quản lý pin lỗi'
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
    id: 'complaints',
    label: 'Khiếu nại',
    icon: MessageSquareText,
    description: 'Quản lý khiếu nại'
  },
  {
    id: 'usage-report',
    label: 'Báo cáo sử dụng',
    icon: BarChart3,
    description: 'Phân tích sử dụng'
  },
  {
    id: 'ai-predictions',
    label: 'Dự đoán AI',
    icon: Brain,
    description: 'Dự đoán AI'
  },
];

export const ManagementSidebar: React.FC<ManagementSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div className={cn(
      "bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col",
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

    </div>
  );
};
