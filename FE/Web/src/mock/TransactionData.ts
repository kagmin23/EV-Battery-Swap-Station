export interface Transaction {
  transaction_id: string;
  user_id: string;
  user_name: string;
  station_id: string;
  station_name: string;
  battery_given: string;
  battery_returned: string;
  transaction_time: string;
  cost: number;
}

export const mockTransactions: Transaction[] = [
  {
    transaction_id: "TXN001",
    user_id: "USR001",
    user_name: "Nguyen Van A",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT015",
    battery_returned: "BAT008",
    transaction_time: "2025-10-06T08:30:00",
    cost: 150000,
  },
  {
    transaction_id: "TXN002",
    user_id: "USR002",
    user_name: "Tran Thi B",
    station_id: "ST002",
    station_name: "Airport Battery Hub",
    battery_given: "BAT021",
    battery_returned: "BAT002",
    transaction_time: "2025-10-06T09:15:00",
    cost: 180000,
  },
  {
    transaction_id: "TXN003",
    user_id: "USR003",
    user_name: "Le Van C",
    station_id: "ST003",
    station_name: "Tech Park Station",
    battery_given: "BAT012",
    battery_returned: "BAT018",
    transaction_time: "2025-10-06T10:00:00",
    cost: 160000,
  },
  {
    transaction_id: "TXN004",
    user_id: "USR004",
    user_name: "Pham Thi D",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT017",
    battery_returned: "BAT001",
    transaction_time: "2025-10-06T11:20:00",
    cost: 170000,
  },
  {
    transaction_id: "TXN005",
    user_id: "USR005",
    user_name: "Hoang Van E",
    station_id: "ST004",
    station_name: "University Swap Point",
    battery_given: "BAT022",
    battery_returned: "BAT014",
    transaction_time: "2025-10-06T12:45:00",
    cost: 165000,
  },
];

export const mockRevenueData = [
  { date: "2025-10-01", revenue: 4500000 },
  { date: "2025-10-02", revenue: 5200000 },
  { date: "2025-10-03", revenue: 4800000 },
  { date: "2025-10-04", revenue: 6100000 },
  { date: "2025-10-05", revenue: 5500000 },
  { date: "2025-10-06", revenue: 3200000 }, // partial day
];

