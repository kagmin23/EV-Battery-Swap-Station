export interface SupportRequest {
  request_id: string;
  user_id: string;
  user_name: string;
  station_id: string;
  station_name: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  created_at: string;
}

export const mockSupportRequests: SupportRequest[] = [
  {
    request_id: "REQ001",
    user_id: "USR001",
    user_name: "Nguyen Van A",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    description: "Battery swap took longer than expected",
    status: "pending",
    created_at: "2025-10-06T08:00:00",
  },
  {
    request_id: "REQ002",
    user_id: "USR002",
    user_name: "Tran Thi B",
    station_id: "ST002",
    station_name: "Airport Battery Hub",
    description: "Received battery with lower SOH than expected",
    status: "in_progress",
    created_at: "2025-10-05T14:30:00",
  },
  {
    request_id: "REQ003",
    user_id: "USR003",
    user_name: "Le Van C",
    station_id: "ST003",
    station_name: "Tech Park Station",
    description: "Station equipment malfunction",
    status: "resolved",
    created_at: "2025-10-04T10:15:00",
  },
];

export const getPendingSupportRequestsCount = (): number => {
  return mockSupportRequests.filter((req) => req.status === "pending").length;
};

