import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Battery,
  MapPin,
  AlertTriangle,
  LayoutDashboard,
  RefreshCw,
  Brain,
  FolderOpen,
  DollarSign
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
    label: 'Overview',
    icon: Home,
    description: 'Overall statistics',
    route: '/staff/overview'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Admin dashboard',
    route: '/admin/dashboard'
  },
  {
    id: 'battery-changes',
    label: 'Battery Changes',
    icon: RefreshCw,
    description: 'Manage battery changes',
    route: '/admin/battery-changes'
  },
  {
    id: 'ai-forecast',
    label: 'AI Forecast',
    icon: Brain,
    description: 'AI Forecast & Predictions',
    route: '/admin/ai-forecast'
  },
  {
    id: 'report-management',
    label: 'Report Management',
    icon: FolderOpen,
    description: 'System report management',
    route: '/admin/report-management'
  },
  {
    id: 'revenue-report',
    label: 'Revenue Report',
    icon: DollarSign,
    description: 'Revenue report',
    route: '/admin/revenue-report'
  },
  {
    id: 'staff-list',
    label: 'Staff List',
    icon: Users,
    description: 'Manage staff',
    route: '/staff/list'
  },
  {
    id: 'staff-distribution',
    label: 'Staff Distribution',
    icon: BarChart3,
    description: 'Distribution analysis',
    route: '/staff/distribution'
  },
  {
    id: 'staff-activities',
    label: 'Staff Activities',
    icon: Activity,
    description: 'Track activities',
    route: '/staff/activities'
  },
  {
    id: 'driver-list',
    label: 'Driver List',
    icon: UserCheck,
    description: 'Manage drivers',
    route: '/driver/list'
  },
  {
    id: 'station-list',
    label: 'Station List',
    icon: MapPin,
    description: 'Manage battery swap stations',
    route: '/staff/station-list'
  },
  {
    id: 'battery-inventory',
    label: 'Battery Inventory',
    icon: Battery,
    description: 'Manage battery inventory',
    route: '/battery-inventory'
  },
  {
    id: 'faulty-batteries',
    label: 'Faulty Batteries',
    icon: AlertTriangle,
    description: 'Manage faulty batteries',
    route: '/faulty-batteries'
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: Car,
    description: 'Manage electric vehicles',
    route: '/vehicles'
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: CreditCard,
    description: 'Manage battery rental packages',
    route: '/subscriptions'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: FileText,
    description: 'Transaction history',
    route: '/transactions'
  },

  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'System settings',
    route: '/settings'
  }
];

export const ManagementSidebar: React.FC<ManagementSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: typeof menuItems[0]) => {
    onTabChange(item.id);
    navigate(item.route);
  };

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
                Management
              </h2>
              <p className="text-sm text-gray-500 font-medium">Management system</p>
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
              onClick={() => handleItemClick(item)}
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
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-base py-6 px-6"
            >
              <UserPlus
                className="h-6 w-6 mr-2 flex-shrink-0"
                style={{ width: '24px', height: '24px' }}
              />
              Add User
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
