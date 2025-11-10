import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Battery,
  Headphones,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface StaffSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  {
    id: 'station',
    label: 'Station',
    icon: Home,
    description: 'Overview',
    path: '/staff/dashboard'
  },
  {
    id: 'battery-swap',
    label: 'Battery Swap',
    icon: Zap,
    description: 'Manage battery slots',
    path: '/staff/battery-swap'
  },
  {
    id: 'payment-history',
    label: 'Payment History',
    icon: ClipboardCheck,
    description: 'Transaction history',
    path: '/staff/payment-history'
  },
  {
    id: 'idle-batteries',
    label: 'Idle Batteries',
    icon: Battery,
    description: 'Only idle batteries',
    path: '/staff/idle-batteries'
  },
  {
    id: 'support-requests',
    label: 'Support Requests',
    icon: Headphones,
    description: 'Station support requests',
    path: '/staff/support-requests'
  }
];

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  isCollapsed,
  onToggleCollapse
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

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
                Staff
              </h2>
              <p className="text-sm text-slate-500 font-medium">EV Battery Swap Station</p>
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
          const active = isActive(item.path);

          return (
            <Button
              key={item.id}
              variant={active ? "default" : "ghost"}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full justify-start transition-all duration-200 py-8",
                isCollapsed ? "px-5" : "px-8",
                active
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

    </div>
  );
};

