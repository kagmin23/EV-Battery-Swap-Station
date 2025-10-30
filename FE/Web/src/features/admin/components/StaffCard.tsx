import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { MoreVertical, Phone, MapPin } from 'lucide-react';
import type { Staff, StaffRole, StaffStatus } from '../types/staff';

interface StaffCardProps {
  staff: Staff;
  onSelect: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onSuspend: (staff: Staff) => void;
  onViewDetails?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
  isSuspending?: boolean;
  isSaving?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onSelect,
  onEdit,
  onSuspend,
  onViewDetails,
  onDelete,
  isSuspending = false,
  isSaving = false
}) => {
  const getStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case 'ONLINE':
      case 'SHIFT_ACTIVE':
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'OFFLINE':
        return <Badge variant="secondary">Offline</Badge>;
      case 'SUSPENDED':
      case 'locked':
        return <Badge variant="destructive">Locked</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'MANAGER':
        return <Badge variant="outline">Manager</Badge>;
      case 'SUPERVISOR':
        return <Badge variant="outline">Supervisor</Badge>;
      case 'STAFF':
        return <Badge variant="outline">Staff</Badge>;
      default:
        return <Badge variant="outline">Staff</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
      onClick={() => onSelect(staff)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg">
                <AvatarImage src={staff.avatar} alt={staff.name} />
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {getInitials(staff.name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${staff.status === 'ONLINE' || staff.status === 'SHIFT_ACTIVE' || staff.status === 'active' ? 'bg-green-500' :
                staff.status === 'OFFLINE' ? 'bg-gray-400' :
                  (staff.status === 'SUSPENDED' || staff.status === 'locked') ? 'bg-red-500' : 'bg-gray-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 truncate text-lg">{staff.name}</h3>
              <p className="text-sm text-slate-500 truncate">{staff.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getRoleBadge(staff.role)}
                {getStatusBadge(staff.status)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu actions
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span className="truncate font-medium">{staff.stationName}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
            <Phone className="h-4 w-4 mr-2 text-green-500" />
            <span>{staff.phone}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(staff);
              }}
              disabled={isSaving || isSuspending}
              className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
            >
              View Details
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(staff);
            }}
            disabled={isSaving || isSuspending}
            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
          >
            {isSaving ? (
              <ButtonLoadingSpinner size="sm" variant="default" text="Saving..." />
            ) : (
              'Edit'
            )}
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(staff);
              }}
              disabled={isSaving || isSuspending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
            >
              Delete
            </Button>
          )}
          {staff.status === 'SUSPENDED' || staff.status === 'locked' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSuspend(staff);
              }}
              disabled={isSuspending || isSaving}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
            >
              {isSuspending ? (
                <ButtonLoadingSpinner size="sm" variant="default" text="Processing..." />
              ) : (
                'Unlock'
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSuspend(staff);
              }}
              disabled={isSuspending || isSaving}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
            >
              {isSuspending ? (
                <ButtonLoadingSpinner size="sm" variant="default" text="Processing..." />
              ) : (
                'Lock'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
