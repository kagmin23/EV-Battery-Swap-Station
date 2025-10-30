export interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseType: DriverLicenseType;
    status: DriverStatus;
    subscriptionPlan: SubscriptionPlan;
    vehicleId?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    totalSwaps: number;
    totalDistance: number;
    rating: number;
    joinDate: Date;
    lastActive: Date;
    avatar?: string;
    address: string;
    city: string;
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    preferences: DriverPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export type DriverLicenseType = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C' | 'D' | 'E' | 'F';

export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface SubscriptionPlan {
    id: string;
    name: string;
    type: 'BASIC' | 'PREMIUM' | 'UNLIMITED';
    price: number;
    currency: string;
    duration: number; // in days
    maxSwapsPerMonth: number;
    features: string[];
    isActive: boolean;
    startDate: Date;
    endDate: Date;
}

export interface DriverPreferences {
    preferredStations: string[];
    notificationSettings: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    language: string;
    timezone: string;
}

export interface Vehicle {
    id: string;
    driverId: string;
    model: string;
    brand: string;
    year: number;
    plateNumber: string;
    batteryCapacity: number;
    currentBatteryLevel: number;
    batteryHealth: number;
    lastServiceDate: Date;
    nextServiceDate: Date;
    totalMileage: number;
    status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

export interface DriverActivity {
    id: string;
    driverId: string;
    type: 'BATTERY_SWAP' | 'SUBSCRIPTION_CHANGE' | 'PAYMENT' | 'LOGIN' | 'LOGOUT' | 'VEHICLE_REGISTER';
    description: string;
    timestamp: Date;
    stationId?: string;
    batteryId?: string;
    amount?: number;
    currency?: string;
}

export interface DriverFilters {
    search: string;
    status: DriverStatus | 'ALL';
    subscriptionPlan: string | 'ALL';
    licenseType: DriverLicenseType | 'ALL';
    city: string | 'ALL';
    limit: string;
}

export interface DriverStats {
    totalDrivers: number;
    activeDrivers: number;
    inactiveDrivers: number;
    suspendedDrivers: number;
    pendingVerification: number;
    driversByPlan: {
        planId: string;
        planName: string;
        count: number;
    }[];
    driversByCity: {
        city: string;
        count: number;
    }[];
    totalSwaps: number;
    averageRating: number;
    recentActivities: DriverActivity[];
}

export interface AddDriverRequest {
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseType: DriverLicenseType;
    address: string;
    city: string;
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    subscriptionPlanId: string;
}

export interface UpdateDriverRequest {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    licenseNumber?: string;
    licenseType?: DriverLicenseType;
    status?: DriverStatus;
    subscriptionPlanId?: string;
    address?: string;
    city?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
}

export interface SwapTransaction {
    id: string;
    driverId: string;
    stationId: string;
    stationName: string;
    oldBatteryId: string;
    newBatteryId: string;
    batteryLevel: number;
    batteryHealth: number;
    cost: number;
    currency: string;
    timestamp: Date;
    duration: number; // in minutes
}
