export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  stationId: string;
  stationName: string;
  status: StaffStatus;
  avatar?: string;
  permissions: StaffPermission[];
  shiftStart?: Date;
  shiftEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type StaffRole = 'STAFF' | 'SUPERVISOR' | 'MANAGER';

export type StaffStatus = 'ONLINE' | 'OFFLINE' | 'SHIFT_ACTIVE' | 'SUSPENDED' | 'active' | 'locked';

export interface StaffPermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalSlots: number;
  availableSlots: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

export interface StaffActivity {
  id: string;
  staffId: string;
  type: 'BATTERY_SWAP' | 'PAYMENT' | 'MAINTENANCE' | 'LOGIN' | 'LOGOUT';
  description: string;
  timestamp: Date;
  stationId: string;
  customerId?: string;
  batteryId?: string;
}

export interface StaffFilters {
  search: string;
  stationId: string;
  role: StaffRole | 'ALL';
  status: StaffStatus | 'ALL' | 'active' | 'locked';
  limit: string;
}

export interface StaffStats {
  totalStaff: number;
  onlineStaff: number;
  shiftActiveStaff: number;
  suspendedStaff: number;
  staffByStation: {
    stationId: string;
    stationName: string;
    count: number;
  }[];
  recentActivities: StaffActivity[];
}

export interface AddStaffRequest {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  stationId: string;
}

export interface UpdateStaffRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: StaffRole;
  stationId?: string;
  status?: StaffStatus;
}
