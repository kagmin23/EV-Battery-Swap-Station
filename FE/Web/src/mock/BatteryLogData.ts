export interface BatteryLogActivity {
  id: string;
  timestamp: Date;
  type: 'swap' | 'charge' | 'maintenance' | 'transfer' | 'alert' | 'system';
  level: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  metadata?: Record<string, string | number>;
}

export interface BatteryLocationHistory {
  id: string;
  location_type: 'station' | 'vehicle' | 'warehouse' | 'maintenance';
  location_name: string;
  location_id: string;
  from_date: Date;
  to_date: Date | null;
  duration_hours?: number;
}

export interface BatteryPerformanceMetric {
  timestamp: Date;
  soh_percent: number;
  charge_percent: number;
  temperature_celsius: number;
  voltage: number;
  charge_cycles: number;
}

export interface BatteryDetailInfo {
  battery_id: string;
  battery_model: string;
  manufacturer: string;
  serial_number: string;
  capacity_kWh: number;
  soh_percent: number;
  current_charge_percent: number;
  status: "available" | "in_use" | "charging" | "maintenance" | "retired";
  current_location: {
    type: 'station' | 'vehicle' | 'warehouse' | 'maintenance';
    location_id: string;
    location_name: string;
    slot_number?: string;
  };
  manufactured_date: Date;
  first_use_date: Date;
  last_maintenance_date: Date;
  next_maintenance_date: Date;
  total_charge_cycles: number;
  max_charge_cycles: number;
  current_temperature: number;
  current_voltage: number;
  current_amperage: number;
  warranty_expiry: Date;
  activities: BatteryLogActivity[];
  location_history: BatteryLocationHistory[];
  performance_history: BatteryPerformanceMetric[];
}

// Generate mock data for a battery
export const generateBatteryLogData = (batteryId: string): BatteryDetailInfo => {
  const now = new Date();
  
  // Generate activities
  const activities: BatteryLogActivity[] = [
    {
      id: 'act-1',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      type: 'swap',
      level: 'success',
      title: 'Battery Swapped',
      description: 'Battery swapped by driver Nguyen Van A at Downtown Station',
      metadata: {
        driver_id: 'DRV-001',
        driver_name: 'Nguyen Van A',
        station_id: 'ST001',
        station_name: 'Downtown Swap Station',
        previous_soh: 95,
        current_soh: 94
      }
    },
    {
      id: 'act-2',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      type: 'charge',
      level: 'success',
      title: 'Charging Completed',
      description: 'Battery fully charged to 100% in 1.5 hours',
      metadata: {
        charge_from: 15,
        charge_to: 100,
        duration_minutes: 90,
        station_id: 'ST001'
      }
    },
    {
      id: 'act-3',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      type: 'swap',
      level: 'success',
      title: 'Battery Returned',
      description: 'Battery returned by driver Tran Thi B',
      metadata: {
        driver_id: 'DRV-002',
        driver_name: 'Tran Thi B',
        usage_hours: 4.5,
        distance_km: 180
      }
    },
    {
      id: 'act-4',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      type: 'alert',
      level: 'warning',
      title: 'High Temperature Detected',
      description: 'Battery temperature exceeded threshold at 42°C',
      metadata: {
        temperature: 42,
        threshold: 40,
        action_taken: 'Auto cooling activated'
      }
    },
    {
      id: 'act-5',
      timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      type: 'maintenance',
      level: 'info',
      title: 'Scheduled Maintenance Completed',
      description: 'Routine maintenance check passed successfully',
      metadata: {
        technician: 'Le Van C',
        duration_minutes: 45,
        issues_found: 0
      }
    },
    {
      id: 'act-6',
      timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000),
      type: 'transfer',
      level: 'info',
      title: 'Battery Transferred',
      description: 'Transferred from Airport Hub to Downtown Station',
      metadata: {
        from_station: 'ST002',
        to_station: 'ST001',
        reason: 'Inventory balancing'
      }
    }
  ];

  // Generate location history
  const location_history: BatteryLocationHistory[] = [
    {
      id: 'loc-1',
      location_type: 'station',
      location_name: 'Downtown Swap Station',
      location_id: 'ST001',
      from_date: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      to_date: null,
      duration_hours: 2
    },
    {
      id: 'loc-2',
      location_type: 'vehicle',
      location_name: 'Vehicle VF8 - DRV-001',
      location_id: 'VEH-001',
      from_date: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      to_date: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      duration_hours: 6
    },
    {
      id: 'loc-3',
      location_type: 'station',
      location_name: 'Downtown Swap Station',
      location_id: 'ST001',
      from_date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      to_date: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      duration_hours: 16
    },
    {
      id: 'loc-4',
      location_type: 'maintenance',
      location_name: 'Maintenance Center District 1',
      location_id: 'MC-001',
      from_date: new Date(now.getTime() - 96 * 60 * 60 * 1000),
      to_date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      duration_hours: 72
    },
    {
      id: 'loc-5',
      location_type: 'station',
      location_name: 'Airport Battery Hub',
      location_id: 'ST002',
      from_date: new Date(now.getTime() - 240 * 60 * 60 * 1000),
      to_date: new Date(now.getTime() - 96 * 60 * 60 * 1000),
      duration_hours: 144
    }
  ];

  // Generate performance history (last 30 days)
  const performance_history: BatteryPerformanceMetric[] = [];
  for (let i = 30; i >= 0; i--) {
    performance_history.push({
      timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      soh_percent: 98 - Math.random() * 4 - (i * 0.05),
      charge_percent: 40 + Math.random() * 60,
      temperature_celsius: 20 + Math.random() * 15,
      voltage: 395 + Math.random() * 10,
      charge_cycles: 150 + (30 - i) * 2
    });
  }

  return {
    battery_id: batteryId,
    battery_model: 'Tesla Model S 100kWh',
    manufacturer: 'Tesla',
    serial_number: `SN-${batteryId}-2024`,
    capacity_kWh: 100,
    soh_percent: 95,
    current_charge_percent: 85,
    status: 'available',
    current_location: {
      type: 'station',
      location_id: 'ST001',
      location_name: 'Downtown Swap Station',
      slot_number: 'A-15'
    },
    manufactured_date: new Date('2024-01-15'),
    first_use_date: new Date('2024-02-01'),
    last_maintenance_date: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    next_maintenance_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    total_charge_cycles: 210,
    max_charge_cycles: 2000,
    current_temperature: 28,
    current_voltage: 402,
    current_amperage: 0,
    warranty_expiry: new Date('2027-01-15'),
    activities,
    location_history,
    performance_history
  };
};

// Mock battery details for different battery IDs
export const mockBatteryDetails: Record<string, BatteryDetailInfo> = {
  'BAT001': generateBatteryLogData('BAT001'),
  'BAT002': generateBatteryLogData('BAT002'),
  'BAT003': generateBatteryLogData('BAT003'),
};

