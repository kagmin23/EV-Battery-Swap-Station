export interface BatterySwapTransaction {
  transaction_id: string;
  timestamp: string;
  driver: {
    id: string;
    name: string;
    vehicle: string;
    phone: string;
  };
  station: {
    id: string;
    name: string;
    location: string;
  };
  batteryReturned: {
    id: string;
    model: string;
    sohBefore: number;
    chargeLevel: number;
    cycleCount: number;
  };
  batteryGiven: {
    id: string;
    model: string;
    sohAfter: number;
    chargeLevel: number;
    cycleCount: number;
  };
  processedBy: string;
  duration: number; // in seconds
  cost: number;
  status: 'completed' | 'cancelled' | 'disputed' | 'pending';
}

export interface BatterySwapFilters {
  dateFrom: string;
  dateTo: string;
  stationId: string;
  batteryModel: string;
  status: string;
  minSOH: number;
  maxSOH: number;
  searchQuery: string;
}

export interface BatterySwapStats {
  totalSwapsToday: number;
  totalSwapsWeek: number;
  totalSwapsMonth: number;
  averageSwapTime: number;
  totalRevenue: number;
  mostActiveStation: {
    name: string;
    count: number;
  };
}

export interface BatteryHistory {
  battery_id: string;
  battery_model: string;
  totalSwaps: number;
  currentSOH: number;
  initialSOH: number;
  degradationRate: number;
  averageCycleTime: number;
  lastSwapDate: string;
  swapHistory: Array<{
    date: string;
    station: string;
    sohBefore: number;
    sohAfter: number;
    driver: string;
  }>;
}

