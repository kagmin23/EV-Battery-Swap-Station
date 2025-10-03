export interface Station {
  station_id: string;
  station_name: string;
  location: string;
  capacity: number;
}

export const mockStations: Station[] = [
  {
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    location: "123 Main Street, District 1, Ho Chi Minh City",
    capacity: 50,
  },
  {
    station_id: "ST002",
    station_name: "Airport Battery Hub",
    location: "Terminal 2, Tan Son Nhat Airport, Ho Chi Minh City",
    capacity: 80,
  },
  {
    station_id: "ST003",
    station_name: "Tech Park Station",
    location: "456 Innovation Blvd, District 2, Ho Chi Minh City",
    capacity: 40,
  },
  {
    station_id: "ST004",
    station_name: "University Swap Point",
    location: "789 Education Road, District 3, Ho Chi Minh City",
    capacity: 60,
  },
  {
    station_id: "ST005",
    station_name: "Industrial Zone Battery Center",
    location: "321 Factory Avenue, District 9, Ho Chi Minh City",
    capacity: 100,
  },
  {
    station_id: "ST006",
    station_name: "Coastal Swap Station",
    location: "654 Beach Road, District 7, Ho Chi Minh City",
    capacity: 45,
  },
  {
    station_id: "ST007",
    station_name: "Shopping Mall Hub",
    location: "987 Commerce Street, District 5, Ho Chi Minh City",
    capacity: 55,
  },
  {
    station_id: "ST008",
    station_name: "Residential District Station",
    location: "147 Community Lane, District 4, Ho Chi Minh City",
    capacity: 35,
  },
];

