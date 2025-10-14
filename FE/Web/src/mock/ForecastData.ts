export interface ForecastDataPoint {
  date: string;
  predicted: number;
  actual?: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface BatteryHealthPrediction {
  batteryId: string;
  currentSOH: number;
  predictedSOH30Days: number;
  predictedSOH90Days: number;
  estimatedReplacementDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MaintenancePrediction {
  stationId: string;
  stationName: string;
  predictedMaintenanceDate: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDowntime: string;
  reason: string;
}

export interface AIInsight {
  id: string;
  category: 'demand' | 'revenue' | 'battery' | 'maintenance' | 'optimization';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  actionRequired: boolean;
}

// Demand Forecast Data (Next 30 days)
export const demandForecastData: ForecastDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  const baseValue = 120 + Math.sin(i / 7) * 20 + (i % 7 === 0 || i % 7 === 6 ? -15 : 10);
  const variance = 15;
  
  return {
    date: date.toISOString().split('T')[0],
    predicted: Math.round(baseValue),
    actual: i < 7 ? Math.round(baseValue + (Math.random() - 0.5) * 10) : undefined,
    confidenceLow: Math.round(baseValue - variance),
    confidenceHigh: Math.round(baseValue + variance),
  };
});

// Revenue Forecast Data (Next 90 days)
export const revenueForecastData: ForecastDataPoint[] = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  const baseValue = 15000000 + Math.sin(i / 30) * 3000000 + i * 50000;
  const variance = 2000000;
  
  return {
    date: date.toISOString().split('T')[0],
    predicted: Math.round(baseValue),
    actual: i < 14 ? Math.round(baseValue + (Math.random() - 0.5) * 1000000) : undefined,
    confidenceLow: Math.round(baseValue - variance),
    confidenceHigh: Math.round(baseValue + variance),
  };
});

// Battery Health Predictions
export const batteryHealthPredictions: BatteryHealthPrediction[] = [
  {
    batteryId: 'BAT-001',
    currentSOH: 92,
    predictedSOH30Days: 90,
    predictedSOH90Days: 86,
    estimatedReplacementDate: '2025-04-15',
    riskLevel: 'low',
  },
  {
    batteryId: 'BAT-045',
    currentSOH: 78,
    predictedSOH30Days: 75,
    predictedSOH90Days: 68,
    estimatedReplacementDate: '2025-01-20',
    riskLevel: 'high',
  },
  {
    batteryId: 'BAT-032',
    currentSOH: 84,
    predictedSOH30Days: 82,
    predictedSOH90Days: 78,
    estimatedReplacementDate: '2025-03-10',
    riskLevel: 'medium',
  },
  {
    batteryId: 'BAT-067',
    currentSOH: 71,
    predictedSOH30Days: 68,
    predictedSOH90Days: 62,
    estimatedReplacementDate: '2024-12-25',
    riskLevel: 'critical',
  },
  {
    batteryId: 'BAT-089',
    currentSOH: 95,
    predictedSOH30Days: 94,
    predictedSOH90Days: 92,
    estimatedReplacementDate: '2025-08-30',
    riskLevel: 'low',
  },
];

// Maintenance Predictions
export const maintenancePredictions: MaintenancePrediction[] = [
  {
    stationId: 'ST-001',
    stationName: 'District 1 Station',
    predictedMaintenanceDate: '2024-10-28',
    confidence: 87,
    priority: 'high',
    estimatedDowntime: '4-6 hours',
    reason: 'Charging system calibration needed',
  },
  {
    stationId: 'ST-003',
    stationName: 'District 7 Station',
    predictedMaintenanceDate: '2024-11-05',
    confidence: 92,
    priority: 'critical',
    estimatedDowntime: '8-10 hours',
    reason: 'Battery slot mechanism wear detected',
  },
  {
    stationId: 'ST-005',
    stationName: 'Thu Duc Station',
    predictedMaintenanceDate: '2024-11-15',
    confidence: 75,
    priority: 'medium',
    estimatedDowntime: '2-3 hours',
    reason: 'Software update and diagnostics',
  },
  {
    stationId: 'ST-002',
    stationName: 'District 3 Station',
    predictedMaintenanceDate: '2024-12-01',
    confidence: 68,
    priority: 'low',
    estimatedDowntime: '1-2 hours',
    reason: 'Routine inspection recommended',
  },
];

// AI Insights
export const aiInsights: AIInsight[] = [
  {
    id: 'ins-1',
    category: 'demand',
    title: 'Peak Demand Shift Detected',
    description: 'Analysis shows peak demand shifting from 8 AM to 7 AM on weekdays. Consider adjusting staff schedules and battery inventory.',
    impact: 'neutral',
    confidence: 89,
    actionRequired: true,
  },
  {
    id: 'ins-2',
    category: 'revenue',
    title: 'Revenue Growth Opportunity',
    description: 'District 7 Station shows 23% higher demand than capacity. Expansion could increase revenue by ₫4.2M/month.',
    impact: 'positive',
    confidence: 94,
    actionRequired: true,
  },
  {
    id: 'ins-3',
    category: 'battery',
    title: 'Battery Replacement Alert',
    description: '12 batteries predicted to fall below 70% SOH within 60 days. Schedule procurement to avoid service disruption.',
    impact: 'negative',
    confidence: 91,
    actionRequired: true,
  },
  {
    id: 'ins-4',
    category: 'maintenance',
    title: 'Preventive Maintenance Recommended',
    description: 'District 1 Station charging system showing early wear patterns. Maintenance within 2 weeks can prevent costly repairs.',
    impact: 'negative',
    confidence: 87,
    actionRequired: true,
  },
  {
    id: 'ins-5',
    category: 'optimization',
    title: 'Battery Redistribution Suggested',
    description: 'Thu Duc Station has 15% excess inventory while Binh Thanh is at 95% utilization. Redistribution recommended.',
    impact: 'positive',
    confidence: 82,
    actionRequired: true,
  },
  {
    id: 'ins-6',
    category: 'demand',
    title: 'Weekend Traffic Pattern Change',
    description: 'Weekend swap demand increased 18% over past month. Current staffing may be insufficient for upcoming weekends.',
    impact: 'neutral',
    confidence: 76,
    actionRequired: false,
  },
  {
    id: 'ins-7',
    category: 'revenue',
    title: 'Subscription Plan Performance',
    description: 'Premium subscription uptake is 34% higher than projected. Consider introducing additional tier options.',
    impact: 'positive',
    confidence: 88,
    actionRequired: false,
  },
  {
    id: 'ins-8',
    category: 'optimization',
    title: 'Energy Cost Optimization',
    description: 'Shifting 30% of charging to off-peak hours (11 PM - 5 AM) could reduce electricity costs by ₫2.8M/month.',
    impact: 'positive',
    confidence: 93,
    actionRequired: true,
  },
];

// Station Capacity Forecast
export const stationCapacityData = [
  {
    stationId: 'ST-001',
    stationName: 'District 1',
    currentUtilization: 78,
    predictedUtilization30Days: 82,
    predictedUtilization90Days: 87,
    recommendedAction: 'Monitor closely',
    status: 'optimal',
  },
  {
    stationId: 'ST-002',
    stationName: 'District 3',
    currentUtilization: 65,
    predictedUtilization30Days: 68,
    predictedUtilization90Days: 72,
    recommendedAction: 'No action needed',
    status: 'optimal',
  },
  {
    stationId: 'ST-003',
    stationName: 'District 7',
    currentUtilization: 94,
    predictedUtilization30Days: 97,
    predictedUtilization90Days: 99,
    recommendedAction: 'Expand capacity',
    status: 'critical',
  },
  {
    stationId: 'ST-004',
    stationName: 'Binh Thanh',
    currentUtilization: 88,
    predictedUtilization30Days: 91,
    predictedUtilization90Days: 94,
    recommendedAction: 'Consider expansion',
    status: 'warning',
  },
  {
    stationId: 'ST-005',
    stationName: 'Thu Duc',
    currentUtilization: 52,
    predictedUtilization30Days: 55,
    predictedUtilization90Days: 60,
    recommendedAction: 'Optimize inventory',
    status: 'underutilized',
  },
];

// Forecast Metrics
export const forecastMetrics = {
  demandGrowth: 12.5, // percentage
  revenueGrowth: 18.3,
  avgAccuracy: 94.2,
  totalPredictions: 1247,
  criticalAlerts: 3,
  actionableInsights: 5,
};

