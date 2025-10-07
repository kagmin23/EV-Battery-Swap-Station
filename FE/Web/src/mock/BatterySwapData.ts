import type { BatterySwapTransaction, BatteryHistory } from '../features/admin/types/batteryChanges.types';

export const mockBatterySwaps: BatterySwapTransaction[] = [
  {
    transaction_id: "SWAP001",
    timestamp: "2025-10-07T08:15:23",
    driver: {
      id: "DRV001",
      name: "Nguyen Van A",
      vehicle: "VinFast VF8 - 29A-12345",
      phone: "0901234567"
    },
    station: {
      id: "ST001",
      name: "Downtown Swap Station",
      location: "123 Le Loi, District 1, HCMC"
    },
    batteryReturned: {
      id: "BAT002",
      model: "Tesla Model S 100kWh",
      sohBefore: 95,
      chargeLevel: 15,
      cycleCount: 234
    },
    batteryGiven: {
      id: "BAT001",
      model: "Tesla Model S 100kWh",
      sohAfter: 98,
      chargeLevel: 100,
      cycleCount: 145
    },
    processedBy: "Staff Tran Van B",
    duration: 180, // 3 minutes
    cost: 150000,
    status: "completed"
  },
  {
    transaction_id: "SWAP002",
    timestamp: "2025-10-07T09:42:15",
    driver: {
      id: "DRV002",
      name: "Tran Thi C",
      vehicle: "Tesla Model 3 - 30B-67890",
      phone: "0912345678"
    },
    station: {
      id: "ST002",
      name: "Airport Battery Hub",
      location: "Tan Son Nhat Airport, HCMC"
    },
    batteryReturned: {
      id: "BAT010",
      model: "Panasonic 60kWh",
      sohBefore: 93,
      chargeLevel: 8,
      cycleCount: 312
    },
    batteryGiven: {
      id: "BAT009",
      model: "Panasonic 60kWh",
      sohAfter: 99,
      chargeLevel: 100,
      cycleCount: 89
    },
    processedBy: "Staff Le Thi D",
    duration: 165,
    cost: 120000,
    status: "completed"
  },
  {
    transaction_id: "SWAP003",
    timestamp: "2025-10-07T10:28:47",
    driver: {
      id: "DRV003",
      name: "Le Van E",
      vehicle: "BYD Atto 3 - 51C-11111",
      phone: "0923456789"
    },
    station: {
      id: "ST003",
      name: "Tech Park Station",
      location: "Quang Trung Software Park, District 12"
    },
    batteryReturned: {
      id: "BAT006",
      model: "CATL 80kWh",
      sohBefore: 96,
      chargeLevel: 12,
      cycleCount: 187
    },
    batteryGiven: {
      id: "BAT019",
      model: "BYD Blade 80kWh",
      sohAfter: 94,
      chargeLevel: 98,
      cycleCount: 203
    },
    processedBy: "Staff Pham Van F",
    duration: 195,
    cost: 145000,
    status: "completed"
  },
  {
    transaction_id: "SWAP004",
    timestamp: "2025-10-07T11:05:12",
    driver: {
      id: "DRV004",
      name: "Pham Thi G",
      vehicle: "NIO ES6 - 29D-22222",
      phone: "0934567890"
    },
    station: {
      id: "ST001",
      name: "Downtown Swap Station",
      location: "123 Le Loi, District 1, HCMC"
    },
    batteryReturned: {
      id: "BAT014",
      model: "NIO 50kWh",
      sohBefore: 90,
      chargeLevel: 5,
      cycleCount: 445
    },
    batteryGiven: {
      id: "BAT013",
      model: "NIO 50kWh",
      sohAfter: 97,
      chargeLevel: 100,
      cycleCount: 156
    },
    processedBy: "Staff Tran Van B",
    duration: 172,
    cost: 110000,
    status: "completed"
  },
  {
    transaction_id: "SWAP005",
    timestamp: "2025-10-07T12:33:58",
    driver: {
      id: "DRV005",
      name: "Hoang Van H",
      vehicle: "VinFast VF9 - 30E-33333",
      phone: "0945678901"
    },
    station: {
      id: "ST004",
      name: "University Swap Point",
      location: "HCMC University of Technology"
    },
    batteryReturned: {
      id: "BAT003",
      model: "BYD Blade 100kWh",
      sohBefore: 92,
      chargeLevel: 18,
      cycleCount: 278
    },
    batteryGiven: {
      id: "BAT021",
      model: "CATL 90kWh",
      sohAfter: 99,
      chargeLevel: 100,
      cycleCount: 67
    },
    processedBy: "Staff Nguyen Thi I",
    duration: 188,
    cost: 165000,
    status: "completed"
  },
  {
    transaction_id: "SWAP006",
    timestamp: "2025-10-06T14:20:35",
    driver: {
      id: "DRV006",
      name: "Vo Van K",
      vehicle: "Tesla Model Y - 51F-44444",
      phone: "0956789012"
    },
    station: {
      id: "ST002",
      name: "Airport Battery Hub",
      location: "Tan Son Nhat Airport, HCMC"
    },
    batteryReturned: {
      id: "BAT005",
      model: "LG Chem 75kWh",
      sohBefore: 94,
      chargeLevel: 10,
      cycleCount: 298
    },
    batteryGiven: {
      id: "BAT004",
      model: "LG Chem 75kWh",
      sohAfter: 97,
      chargeLevel: 100,
      cycleCount: 201
    },
    processedBy: "Staff Le Thi D",
    duration: 176,
    cost: 140000,
    status: "completed"
  },
  {
    transaction_id: "SWAP007",
    timestamp: "2025-10-06T15:47:22",
    driver: {
      id: "DRV007",
      name: "Dang Thi L",
      vehicle: "Hyundai Ioniq 5 - 29G-55555",
      phone: "0967890123"
    },
    station: {
      id: "ST003",
      name: "Tech Park Station",
      location: "Quang Trung Software Park, District 12"
    },
    batteryReturned: {
      id: "BAT018",
      model: "Tesla Model 3 75kWh",
      sohBefore: 92,
      chargeLevel: 7,
      cycleCount: 356
    },
    batteryGiven: {
      id: "BAT017",
      model: "Tesla Model 3 75kWh",
      sohAfter: 98,
      chargeLevel: 100,
      cycleCount: 123
    },
    processedBy: "Staff Pham Van F",
    duration: 183,
    cost: 142000,
    status: "completed"
  },
  {
    transaction_id: "SWAP008",
    timestamp: "2025-10-06T16:12:08",
    driver: {
      id: "DRV008",
      name: "Bui Van M",
      vehicle: "Kia EV6 - 30H-66666",
      phone: "0978901234"
    },
    station: {
      id: "ST001",
      name: "Downtown Swap Station",
      location: "123 Le Loi, District 1, HCMC"
    },
    batteryReturned: {
      id: "BAT008",
      model: "Samsung SDI 70kWh",
      sohBefore: 91,
      chargeLevel: 11,
      cycleCount: 389
    },
    batteryGiven: {
      id: "BAT023",
      model: "LG Chem 85kWh",
      sohAfter: 96,
      chargeLevel: 100,
      cycleCount: 178
    },
    processedBy: "Staff Tran Van B",
    duration: 192,
    cost: 138000,
    status: "completed"
  },
  {
    transaction_id: "SWAP009",
    timestamp: "2025-10-06T09:25:44",
    driver: {
      id: "DRV009",
      name: "Ngo Thi N",
      vehicle: "Polestar 2 - 51I-77777",
      phone: "0989012345"
    },
    station: {
      id: "ST004",
      name: "University Swap Point",
      location: "HCMC University of Technology"
    },
    batteryReturned: {
      id: "BAT011",
      model: "SK Innovation 65kWh",
      sohBefore: 88,
      chargeLevel: 6,
      cycleCount: 478
    },
    batteryGiven: {
      id: "BAT012",
      model: "SK Innovation 65kWh",
      sohAfter: 95,
      chargeLevel: 100,
      cycleCount: 167
    },
    processedBy: "Staff Nguyen Thi I",
    duration: 169,
    cost: 135000,
    status: "completed"
  },
  {
    transaction_id: "SWAP010",
    timestamp: "2025-10-06T10:58:31",
    driver: {
      id: "DRV010",
      name: "Truong Van O",
      vehicle: "Mercedes EQC - 29K-88888",
      phone: "0990123456"
    },
    station: {
      id: "ST002",
      name: "Airport Battery Hub",
      location: "Tan Son Nhat Airport, HCMC"
    },
    batteryReturned: {
      id: "BAT020",
      model: "BYD Blade 80kWh",
      sohBefore: 87,
      chargeLevel: 9,
      cycleCount: 512
    },
    batteryGiven: {
      id: "BAT022",
      model: "CATL 90kWh",
      sohAfter: 91,
      chargeLevel: 98,
      cycleCount: 289
    },
    processedBy: "Staff Le Thi D",
    duration: 201,
    cost: 148000,
    status: "completed"
  },
  {
    transaction_id: "SWAP011",
    timestamp: "2025-10-05T08:30:15",
    driver: {
      id: "DRV011",
      name: "Cao Van P",
      vehicle: "Audi e-tron - 30L-99999",
      phone: "0901112233"
    },
    station: {
      id: "ST001",
      name: "Downtown Swap Station",
      location: "123 Le Loi, District 1, HCMC"
    },
    batteryReturned: {
      id: "BAT015",
      model: "VinFast 55kWh",
      sohBefore: 96,
      chargeLevel: 14,
      cycleCount: 198
    },
    batteryGiven: {
      id: "BAT016",
      model: "VinFast 55kWh",
      sohAfter: 85,
      chargeLevel: 95,
      cycleCount: 534
    },
    processedBy: "Staff Tran Van B",
    duration: 210,
    cost: 125000,
    status: "completed"
  },
  {
    transaction_id: "SWAP012",
    timestamp: "2025-10-05T13:45:50",
    driver: {
      id: "DRV012",
      name: "Ha Thi Q",
      vehicle: "Nissan Leaf - 51M-10101",
      phone: "0912223344"
    },
    station: {
      id: "ST003",
      name: "Tech Park Station",
      location: "Quang Trung Software Park, District 12"
    },
    batteryReturned: {
      id: "BAT007",
      model: "CATL 80kWh",
      sohBefore: 89,
      chargeLevel: 4,
      cycleCount: 423
    },
    batteryGiven: {
      id: "BAT003",
      model: "BYD Blade 100kWh",
      sohAfter: 92,
      chargeLevel: 100,
      cycleCount: 279
    },
    processedBy: "Staff Pham Van F",
    duration: 245,
    cost: 152000,
    status: "disputed"
  },
  {
    transaction_id: "SWAP013",
    timestamp: "2025-10-04T11:22:37",
    driver: {
      id: "DRV013",
      name: "Ly Van R",
      vehicle: "Chevrolet Bolt - 29N-20202",
      phone: "0923334455"
    },
    station: {
      id: "ST004",
      name: "University Swap Point",
      location: "HCMC University of Technology"
    },
    batteryReturned: {
      id: "BAT024",
      model: "Samsung SDI 70kWh",
      sohBefore: 78,
      chargeLevel: 3,
      cycleCount: 678
    },
    batteryGiven: {
      id: "BAT008",
      model: "Samsung SDI 70kWh",
      sohAfter: 91,
      chargeLevel: 100,
      cycleCount: 390
    },
    processedBy: "Staff Nguyen Thi I",
    duration: 158,
    cost: 133000,
    status: "completed"
  },
  {
    transaction_id: "SWAP014",
    timestamp: "2025-10-04T14:55:19",
    driver: {
      id: "DRV014",
      name: "Mai Thi S",
      vehicle: "BMW iX - 30O-30303",
      phone: "0934445566"
    },
    station: {
      id: "ST002",
      name: "Airport Battery Hub",
      location: "Tan Son Nhat Airport, HCMC"
    },
    batteryReturned: {
      id: "BAT001",
      model: "Tesla Model S 100kWh",
      sohBefore: 98,
      chargeLevel: 16,
      cycleCount: 146
    },
    batteryGiven: {
      id: "BAT002",
      model: "Tesla Model S 100kWh",
      sohAfter: 95,
      chargeLevel: 100,
      cycleCount: 235
    },
    processedBy: "Staff Le Thi D",
    duration: 174,
    cost: 155000,
    status: "completed"
  },
  {
    transaction_id: "SWAP015",
    timestamp: "2025-10-03T09:10:42",
    driver: {
      id: "DRV015",
      name: "Dinh Van T",
      vehicle: "Porsche Taycan - 51P-40404",
      phone: "0945556677"
    },
    station: {
      id: "ST001",
      name: "Downtown Swap Station",
      location: "123 Le Loi, District 1, HCMC"
    },
    batteryReturned: {
      id: "BAT009",
      model: "Panasonic 60kWh",
      sohBefore: 99,
      chargeLevel: 20,
      cycleCount: 90
    },
    batteryGiven: {
      id: "BAT010",
      model: "Panasonic 60kWh",
      sohAfter: 93,
      chargeLevel: 100,
      cycleCount: 313
    },
    processedBy: "Staff Tran Van B",
    duration: 167,
    cost: 128000,
    status: "completed"
  }
];

export const mockBatteryHistory: BatteryHistory[] = [
  {
    battery_id: "BAT001",
    battery_model: "Tesla Model S 100kWh",
    totalSwaps: 146,
    currentSOH: 98,
    initialSOH: 100,
    degradationRate: 0.014,
    averageCycleTime: 4.2,
    lastSwapDate: "2025-10-07T08:15:23",
    swapHistory: [
      {
        date: "2025-10-07T08:15:23",
        station: "Downtown Swap Station",
        sohBefore: 98,
        sohAfter: 98,
        driver: "Nguyen Van A"
      },
      {
        date: "2025-10-04T14:55:19",
        station: "Airport Battery Hub",
        sohBefore: 98,
        sohAfter: 98,
        driver: "Mai Thi S"
      }
    ]
  },
  {
    battery_id: "BAT024",
    battery_model: "Samsung SDI 70kWh",
    totalSwaps: 678,
    currentSOH: 78,
    initialSOH: 100,
    degradationRate: 0.032,
    averageCycleTime: 3.8,
    lastSwapDate: "2025-10-04T11:22:37",
    swapHistory: [
      {
        date: "2025-10-04T11:22:37",
        station: "University Swap Point",
        sohBefore: 78,
        sohAfter: 78,
        driver: "Ly Van R"
      }
    ]
  }
];

// Statistics for dashboard
export const getBatterySwapStats = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const swapsToday = mockBatterySwaps.filter(swap => 
    new Date(swap.timestamp) >= today
  );
  
  const swapsWeek = mockBatterySwaps.filter(swap => 
    new Date(swap.timestamp) >= weekAgo
  );
  
  const swapsMonth = mockBatterySwaps.filter(swap => 
    new Date(swap.timestamp) >= monthAgo
  );

  const avgSwapTime = mockBatterySwaps.reduce((sum, swap) => sum + swap.duration, 0) / mockBatterySwaps.length;

  const stationCounts = mockBatterySwaps.reduce((acc, swap) => {
    acc[swap.station.name] = (acc[swap.station.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActive = Object.entries(stationCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalSwapsToday: swapsToday.length,
    totalSwapsWeek: swapsWeek.length,
    totalSwapsMonth: swapsMonth.length,
    averageSwapTime: Math.round(avgSwapTime),
    totalRevenue: mockBatterySwaps.reduce((sum, swap) => sum + swap.cost, 0),
    mostActiveStation: {
      name: mostActive?.[0] || 'N/A',
      count: mostActive?.[1] || 0
    }
  };
};

