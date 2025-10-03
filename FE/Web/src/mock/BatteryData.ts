export interface Battery {
  battery_id: string;
  battery_model: string;
  capacity_kWh: number;
  soh_percent: number;
  status: "available" | "in_use" | "charging" | "maintenance" | "retired";
}

export const mockBatteries: Battery[] = [
  // High capacity batteries
  {
    battery_id: "BAT001",
    battery_model: "Tesla Model S 100kWh",
    capacity_kWh: 100,
    soh_percent: 98,
    status: "available",
  },
  {
    battery_id: "BAT002",
    battery_model: "Tesla Model S 100kWh",
    capacity_kWh: 100,
    soh_percent: 95,
    status: "in_use",
  },
  {
    battery_id: "BAT003",
    battery_model: "BYD Blade 100kWh",
    capacity_kWh: 100,
    soh_percent: 92,
    status: "charging",
  },
  
  // Medium capacity batteries
  {
    battery_id: "BAT004",
    battery_model: "LG Chem 75kWh",
    capacity_kWh: 75,
    soh_percent: 97,
    status: "available",
  },
  {
    battery_id: "BAT005",
    battery_model: "LG Chem 75kWh",
    capacity_kWh: 75,
    soh_percent: 94,
    status: "available",
  },
  {
    battery_id: "BAT006",
    battery_model: "CATL 80kWh",
    capacity_kWh: 80,
    soh_percent: 96,
    status: "in_use",
  },
  {
    battery_id: "BAT007",
    battery_model: "CATL 80kWh",
    capacity_kWh: 80,
    soh_percent: 89,
    status: "charging",
  },
  {
    battery_id: "BAT008",
    battery_model: "Samsung SDI 70kWh",
    capacity_kWh: 70,
    soh_percent: 91,
    status: "available",
  },
  
  // Standard capacity batteries
  {
    battery_id: "BAT009",
    battery_model: "Panasonic 60kWh",
    capacity_kWh: 60,
    soh_percent: 99,
    status: "available",
  },
  {
    battery_id: "BAT010",
    battery_model: "Panasonic 60kWh",
    capacity_kWh: 60,
    soh_percent: 93,
    status: "in_use",
  },
  {
    battery_id: "BAT011",
    battery_model: "SK Innovation 65kWh",
    capacity_kWh: 65,
    soh_percent: 88,
    status: "charging",
  },
  {
    battery_id: "BAT012",
    battery_model: "SK Innovation 65kWh",
    capacity_kWh: 65,
    soh_percent: 95,
    status: "available",
  },
  
  // Compact batteries
  {
    battery_id: "BAT013",
    battery_model: "NIO 50kWh",
    capacity_kWh: 50,
    soh_percent: 97,
    status: "available",
  },
  {
    battery_id: "BAT014",
    battery_model: "NIO 50kWh",
    capacity_kWh: 50,
    soh_percent: 90,
    status: "in_use",
  },
  {
    battery_id: "BAT015",
    battery_model: "VinFast 55kWh",
    capacity_kWh: 55,
    soh_percent: 96,
    status: "available",
  },
  {
    battery_id: "BAT016",
    battery_model: "VinFast 55kWh",
    capacity_kWh: 55,
    soh_percent: 85,
    status: "maintenance",
  },
  
  // Additional batteries for inventory
  {
    battery_id: "BAT017",
    battery_model: "Tesla Model 3 75kWh",
    capacity_kWh: 75,
    soh_percent: 98,
    status: "available",
  },
  {
    battery_id: "BAT018",
    battery_model: "Tesla Model 3 75kWh",
    capacity_kWh: 75,
    soh_percent: 92,
    status: "charging",
  },
  {
    battery_id: "BAT019",
    battery_model: "BYD Blade 80kWh",
    capacity_kWh: 80,
    soh_percent: 94,
    status: "available",
  },
  {
    battery_id: "BAT020",
    battery_model: "BYD Blade 80kWh",
    capacity_kWh: 80,
    soh_percent: 87,
    status: "in_use",
  },
  {
    battery_id: "BAT021",
    battery_model: "CATL 90kWh",
    capacity_kWh: 90,
    soh_percent: 99,
    status: "available",
  },
  {
    battery_id: "BAT022",
    battery_model: "CATL 90kWh",
    capacity_kWh: 90,
    soh_percent: 91,
    status: "available",
  },
  {
    battery_id: "BAT023",
    battery_model: "LG Chem 85kWh",
    capacity_kWh: 85,
    soh_percent: 96,
    status: "charging",
  },
  {
    battery_id: "BAT024",
    battery_model: "Samsung SDI 70kWh",
    capacity_kWh: 70,
    soh_percent: 78,
    status: "maintenance",
  },
  {
    battery_id: "BAT025",
    battery_model: "Panasonic 60kWh",
    capacity_kWh: 60,
    soh_percent: 65,
    status: "retired",
  },
];

