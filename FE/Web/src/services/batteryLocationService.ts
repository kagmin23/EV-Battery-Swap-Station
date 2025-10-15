// Service to manage battery location transfers
interface BatteryLocation {
  batteryId: string;
  stationId: string;
  stationName: string;
  timestamp: Date;
}

const STORAGE_KEY = 'battery_locations';

export class BatteryLocationService {
  // Get all battery locations from localStorage
  static getAllLocations(): Record<string, BatteryLocation> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    try {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      Object.keys(parsed).forEach(key => {
        parsed[key].timestamp = new Date(parsed[key].timestamp);
      });
      return parsed;
    } catch {
      return {};
    }
  }

  // Get location for a specific battery
  static getBatteryLocation(batteryId: string): BatteryLocation | null {
    const locations = this.getAllLocations();
    return locations[batteryId] || null;
  }

  // Update battery location (transfer to station)
  static updateBatteryLocation(batteryId: string, stationId: string, stationName: string): void {
    const locations = this.getAllLocations();
    locations[batteryId] = {
      batteryId,
      stationId,
      stationName,
      timestamp: new Date()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }

  // Transfer multiple batteries to a station
  static transferBatteries(batteryIds: string[], stationId: string, stationName: string): void {
    const locations = this.getAllLocations();
    const timestamp = new Date();
    
    batteryIds.forEach(batteryId => {
      locations[batteryId] = {
        batteryId,
        stationId,
        stationName,
        timestamp
      };
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }

  // Clear all location data (for testing)
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

