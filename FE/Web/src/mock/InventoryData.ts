export interface Inventory {
  inventory_id: string;
  station_id: string;
  battery_id: string;
  status: "available" | "reserved" | "in_use" | "maintenance";
}

export const mockInventory: Inventory[] = [
  // ST001 - Downtown Swap Station
  { inventory_id: "INV001", station_id: "ST001", battery_id: "BAT001", status: "available" },
  { inventory_id: "INV002", station_id: "ST001", battery_id: "BAT004", status: "available" },
  { inventory_id: "INV003", station_id: "ST001", battery_id: "BAT009", status: "available" },
  { inventory_id: "INV004", station_id: "ST001", battery_id: "BAT013", status: "in_use" },
  { inventory_id: "INV005", station_id: "ST001", battery_id: "BAT017", status: "available" },
  
  // ST002 - Airport Battery Hub
  { inventory_id: "INV006", station_id: "ST002", battery_id: "BAT002", status: "in_use" },
  { inventory_id: "INV007", station_id: "ST002", battery_id: "BAT005", status: "available" },
  { inventory_id: "INV008", station_id: "ST002", battery_id: "BAT010", status: "in_use" },
  { inventory_id: "INV009", station_id: "ST002", battery_id: "BAT015", status: "available" },
  { inventory_id: "INV010", station_id: "ST002", battery_id: "BAT019", status: "available" },
  { inventory_id: "INV011", station_id: "ST002", battery_id: "BAT021", status: "available" },
  
  // ST003 - Tech Park Station
  { inventory_id: "INV012", station_id: "ST003", battery_id: "BAT003", status: "available" },
  { inventory_id: "INV013", station_id: "ST003", battery_id: "BAT006", status: "in_use" },
  { inventory_id: "INV014", station_id: "ST003", battery_id: "BAT012", status: "available" },
  { inventory_id: "INV015", station_id: "ST003", battery_id: "BAT018", status: "available" },
  
  // ST004 - University Swap Point
  { inventory_id: "INV016", station_id: "ST004", battery_id: "BAT007", status: "available" },
  { inventory_id: "INV017", station_id: "ST004", battery_id: "BAT011", status: "available" },
  { inventory_id: "INV018", station_id: "ST004", battery_id: "BAT014", status: "in_use" },
  { inventory_id: "INV019", station_id: "ST004", battery_id: "BAT020", status: "in_use" },
  { inventory_id: "INV020", station_id: "ST004", battery_id: "BAT022", status: "available" },
  
  // ST005 - Industrial Zone Battery Center
  { inventory_id: "INV021", station_id: "ST005", battery_id: "BAT008", status: "available" },
  { inventory_id: "INV022", station_id: "ST005", battery_id: "BAT016", status: "maintenance" },
  { inventory_id: "INV023", station_id: "ST005", battery_id: "BAT023", status: "available" },
  { inventory_id: "INV024", station_id: "ST005", battery_id: "BAT024", status: "maintenance" },
  
  // ST006 - Coastal Swap Station
  { inventory_id: "INV025", station_id: "ST006", battery_id: "BAT025", status: "maintenance" },
  
  // ST007 - Shopping Mall Hub (no batteries currently)
  
  // ST008 - Residential District Station (no batteries currently)
];

// Helper function to get batteries by station
export const getBatteriesByStation = (stationId: string): Inventory[] => {
  return mockInventory.filter(inv => inv.station_id === stationId);
};

// Helper function to get available batteries count
export const getAvailableBatteriesCount = (stationId: string): number => {
  return mockInventory.filter(
    inv => inv.station_id === stationId && inv.status === "available"
  ).length;
};

// Helper function to get station by battery
export const getStationByBattery = (batteryId: string): Inventory | undefined => {
  return mockInventory.find(inv => inv.battery_id === batteryId);
};

