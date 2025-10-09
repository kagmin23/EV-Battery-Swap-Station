export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "driver" | "staff" | "admin";
  status: "active" | "inactive" | "suspended";
}

export const mockUsers: User[] = [
  {
    user_id: "USR001",
    full_name: "Nguyen Van A",
    email: "nguyenvana@example.com",
    phone_number: "0901234567",
    role: "driver",
    status: "active",
  },
  {
    user_id: "USR002",
    full_name: "Tran Thi B",
    email: "tranthib@example.com",
    phone_number: "0902345678",
    role: "driver",
    status: "active",
  },
  {
    user_id: "USR003",
    full_name: "Le Van C",
    email: "levanc@example.com",
    phone_number: "0903456789",
    role: "driver",
    status: "active",
  },
  {
    user_id: "USR004",
    full_name: "Pham Thi D",
    email: "phamthid@example.com",
    phone_number: "0904567890",
    role: "staff",
    status: "active",
  },
  {
    user_id: "USR005",
    full_name: "Hoang Van E",
    email: "hoangvane@example.com",
    phone_number: "0905678901",
    role: "staff",
    status: "active",
  },
  {
    user_id: "USR006",
    full_name: "Vo Thi F",
    email: "vothif@example.com",
    phone_number: "0906789012",
    role: "admin",
    status: "active",
  },
];

export const getUsersByRole = (role: "driver" | "staff" | "admin"): User[] => {
  return mockUsers.filter((user) => user.role === role);
};

export const getActiveUsersCount = (): number => {
  return mockUsers.filter((user) => user.status === "active").length;
};

