export interface RevenueByDate {
  date: string;
  revenue: number;
  transactions: number;
  avgTransactionValue: number;
}

export interface RevenueByStation {
  stationId: string;
  stationName: string;
  revenue: number;
  transactions: number;
  growthRate: number;
}

export interface RevenueByPaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface RevenueBySource {
  source: string;
  amount: number;
  percentage: number;
  color: string;
  trend: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
  growthRate: number;
  topStation: string;
  peakHour: string;
}

// Daily revenue data for the last 30 days
export const mockDailyRevenue: RevenueByDate[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseRevenue = 4000000;
  const variation = Math.random() * 2000000;
  const weekendBonus = [0, 6].includes(date.getDay()) ? 1000000 : 0;
  const revenue = baseRevenue + variation + weekendBonus;
  const transactions = Math.floor(revenue / 165000);
  
  return {
    date: date.toISOString().split('T')[0],
    revenue: Math.round(revenue),
    transactions,
    avgTransactionValue: Math.round(revenue / transactions),
  };
});

// Weekly revenue data for the last 12 weeks
export const mockWeeklyRevenue: RevenueByDate[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (11 - i) * 7);
  const baseRevenue = 28000000;
  const variation = Math.random() * 8000000;
  const revenue = baseRevenue + variation;
  const transactions = Math.floor(revenue / 165000);
  
  return {
    date: `Week ${12 - i}`,
    revenue: Math.round(revenue),
    transactions,
    avgTransactionValue: Math.round(revenue / transactions),
  };
});

// Monthly revenue data for the last 12 months
export const mockMonthlyRevenue: RevenueByDate[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (11 - i));
  const baseRevenue = 120000000;
  const variation = Math.random() * 30000000;
  const revenue = baseRevenue + variation;
  const transactions = Math.floor(revenue / 165000);
  
  return {
    date: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
    revenue: Math.round(revenue),
    transactions,
    avgTransactionValue: Math.round(revenue / transactions),
  };
});

// Revenue by station
export const mockRevenueByStation: RevenueByStation[] = [
  {
    stationId: 'ST001',
    stationName: 'Downtown Swap Station',
    revenue: 45000000,
    transactions: 273,
    growthRate: 12.5,
  },
  {
    stationId: 'ST002',
    stationName: 'Airport Battery Hub',
    revenue: 38500000,
    transactions: 233,
    growthRate: 8.3,
  },
  {
    stationId: 'ST003',
    stationName: 'Tech Park Station',
    revenue: 32000000,
    transactions: 194,
    growthRate: -2.1,
  },
  {
    stationId: 'ST004',
    stationName: 'University Swap Point',
    revenue: 28000000,
    transactions: 170,
    growthRate: 15.7,
  },
  {
    stationId: 'ST005',
    stationName: 'Shopping Mall Hub',
    revenue: 26500000,
    transactions: 160,
    growthRate: 5.2,
  },
];

// Revenue by payment method
export const mockRevenueByPaymentMethod: RevenueByPaymentMethod[] = [
  {
    method: 'E-Wallet',
    amount: 85000000,
    percentage: 50,
    color: '#3B82F6',
  },
  {
    method: 'Credit Card',
    amount: 51000000,
    percentage: 30,
    color: '#10B981',
  },
  {
    method: 'Cash',
    amount: 25500000,
    percentage: 15,
    color: '#F59E0B',
  },
  {
    method: 'Bank Transfer',
    amount: 8500000,
    percentage: 5,
    color: '#8B5CF6',
  },
];

// Revenue by source
export const mockRevenueBySource: RevenueBySource[] = [
  {
    source: 'Battery Swap',
    amount: 102000000,
    percentage: 60,
    color: '#3B82F6',
    trend: 8.5,
  },
  {
    source: 'Subscription',
    amount: 51000000,
    percentage: 30,
    color: '#10B981',
    trend: 12.3,
  },
  {
    source: 'Deposit',
    amount: 13600000,
    percentage: 8,
    color: '#F59E0B',
    trend: -3.2,
  },
  {
    source: 'Penalties',
    amount: 3400000,
    percentage: 2,
    color: '#EF4444',
    trend: -15.5,
  },
];

// Peak hours data (24 hours)
export const mockRevenueByHour = Array.from({ length: 24 }, (_, hour) => {
  let baseRevenue = 200000;
  
  // Peak hours: 7-9 AM and 5-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    baseRevenue = 800000;
  } else if (hour >= 10 && hour <= 16) {
    baseRevenue = 400000;
  } else if (hour >= 20 && hour <= 22) {
    baseRevenue = 350000;
  } else {
    baseRevenue = 100000;
  }
  
  const variation = Math.random() * 100000;
  return {
    hour: `${hour.toString().padStart(2, '0')}:00`,
    revenue: Math.round(baseRevenue + variation),
  };
});

// Calculate current period metrics
export const calculateRevenueMetrics = (data: RevenueByDate[]): RevenueMetrics => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
  const avgTransactionValue = totalRevenue / totalTransactions;
  
  // Calculate growth rate (comparing last half vs first half)
  const midPoint = Math.floor(data.length / 2);
  const firstHalfRevenue = data.slice(0, midPoint).reduce((sum, item) => sum + item.revenue, 0);
  const secondHalfRevenue = data.slice(midPoint).reduce((sum, item) => sum + item.revenue, 0);
  const growthRate = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;
  
  // Find top station
  const topStation = mockRevenueByStation.sort((a, b) => b.revenue - a.revenue)[0];
  
  // Find peak hour
  const peakHourData = mockRevenueByHour.sort((a, b) => b.revenue - a.revenue)[0];
  
  return {
    totalRevenue: Math.round(totalRevenue),
    totalTransactions,
    avgTransactionValue: Math.round(avgTransactionValue),
    growthRate: Math.round(growthRate * 10) / 10,
    topStation: topStation.stationName,
    peakHour: peakHourData.hour,
  };
};

