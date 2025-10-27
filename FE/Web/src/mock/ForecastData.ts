export interface ForecastDataPoint {
  date: string;
  predicted: number;
  actual?: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface StationDemandForecast {
  stationId: string;
  stationName: string;
  currentUtilization: number;
  predictedUtilization30Days: number;
  predictedUtilization90Days: number;
  recommendedAction: string;
  status: 'critical' | 'warning' | 'optimal' | 'underutilized';
  confidence: number;
}

export interface StationInfrastructureInsight {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  stationId?: string;
  estimatedCost?: number;
  estimatedBenefit?: string;
}

// Station Demand Forecast Data (Next 30 days)
export const stationDemandForecastData: ForecastDataPoint[] = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  // Simulate demand growth with weekly patterns
  const weeklyPattern = i % 7 === 0 || i % 7 === 6 ? -20 : 15; // Lower on weekends
  const baseValue = 150 + Math.sin(i / 7) * 25 + weeklyPattern + (i / 90) * 15;
  const variance = 20;
  
  return {
    date: date.toISOString().split('T')[0],
    predicted: Math.round(baseValue),
    actual: i < 14 ? Math.round(baseValue + (Math.random() - 0.5) * 15) : undefined,
    confidenceLow: Math.round(baseValue - variance),
    confidenceHigh: Math.round(baseValue + variance),
  };
});

// Station Capacity Utilization Forecast Data (Utilization percentage)
export const stationCapacityUtilizationData: ForecastDataPoint[] = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  const baseValue = 75 + Math.sin(i / 7) * 10 + (i / 90) * 8;
  const variance = 5;
  
  return {
    date: date.toISOString().split('T')[0],
    predicted: Math.round(baseValue),
    actual: i < 14 ? Math.round(baseValue + (Math.random() - 0.5) * 5) : undefined,
    confidenceLow: Math.round(baseValue - variance),
    confidenceHigh: Math.round(baseValue + variance),
  };
});

// Station Capacity Forecast (Per station data)
export const stationCapacityData: StationDemandForecast[] = [
  {
    stationId: 'ST001',
    stationName: 'Downtown Swap Station',
    currentUtilization: 78,
    predictedUtilization30Days: 82,
    predictedUtilization90Days: 87,
    recommendedAction: 'Monitor closely - expansion recommended',
    status: 'warning',
    confidence: 92,
  },
  {
    stationId: 'ST002',
    stationName: 'Airport Battery Hub',
    currentUtilization: 65,
    predictedUtilization30Days: 68,
    predictedUtilization90Days: 72,
    recommendedAction: 'Optimize flow management',
    status: 'optimal',
    confidence: 88,
  },
  {
    stationId: 'ST003',
    stationName: 'Tech Park Station',
    currentUtilization: 94,
    predictedUtilization30Days: 97,
    predictedUtilization90Days: 99,
    recommendedAction: 'Urgent capacity expansion needed',
    status: 'critical',
    confidence: 95,
  },
  {
    stationId: 'ST004',
    stationName: 'University Swap Point',
    currentUtilization: 88,
    predictedUtilization30Days: 91,
    predictedUtilization90Days: 94,
    recommendedAction: 'Upgrade recommended',
    status: 'warning',
    confidence: 90,
  },
  {
    stationId: 'ST005',
    stationName: 'Industrial Zone Battery Center',
    currentUtilization: 52,
    predictedUtilization30Days: 55,
    predictedUtilization90Days: 60,
    recommendedAction: 'Relocate excess batteries',
    status: 'optimal',
    confidence: 85,
  },
];

// AI Infrastructure Insights
export const aiInfrastructureInsights: StationInfrastructureInsight[] = [
  {
    id: 'ins-1',
    title: 'Tech Park Station - Urgent Expansion',
    description: 'Tech Park Station is at 94% capacity, forecasted to reach 99% within 90 days. Need to expand by 30-50 battery slots to meet demand.',
    priority: 'critical',
    confidence: 95,
    stationId: 'ST003',
    estimatedCost: 120000000,
    estimatedBenefit: 'Reduce 75% wait times and increase revenue by 28%',
  },
  {
    id: 'ins-2',
    title: 'University Swap Point - Needed Upgrade',
    description: 'University Station is increasing from 88% to 94% in 90 days. Recommend adding 20 battery slots and optimizing layout.',
    priority: 'high',
    confidence: 90,
    stationId: 'ST004',
    estimatedCost: 65000000,
    estimatedBenefit: 'Increase 35% capacity and improve user experience',
  },
  {
    id: 'ins-3',
    title: 'Downtown Station - Flow Optimization',
    description: 'Downtown Station is at 78% and growing rapidly. Should adjust maintenance schedule and increase backup battery inventory.',
    priority: 'high',
    confidence: 87,
    stationId: 'ST001',
    estimatedCost: 30000000,
    estimatedBenefit: 'Reduce 40% wait times',
  },
  {
    id: 'ins-4',
    title: 'Industrial Zone - Resource Redistribution',
    description: 'Industrial Zone is only using 52% capacity. Recommend transferring 20-30 batteries to stations with capacity constraints.',
    priority: 'medium',
    confidence: 82,
    stationId: 'ST005',
    estimatedCost: 5000000,
    estimatedBenefit: 'Optimize resource utilization efficiency',
  },
  {
    id: 'ins-5',
    title: 'Airport Hub - Peak Hours Improvement',
    description: 'Airport Station has peak hours concentrated in 6-9 AM and 5-8 PM. Recommend adding waiting areas and more service channels.',
    priority: 'medium',
    confidence: 80,
    stationId: 'ST002',
    estimatedCost: 40000000,
    estimatedBenefit: 'Improve 25% service time during peak hours',
  },
  {
    id: 'ins-6',
    title: 'Automated Alert System',
    description: 'Deploy AI early warning system when stations approach 80% capacity to prepare for response.',
    priority: 'low',
    confidence: 85,
    estimatedCost: 15000000,
    estimatedBenefit: 'Timely preparation and reduce 60% of overload incidents',
  },
];

// Export station capacity data
export const stationCapacityForecastData: StationDemandForecast[] = stationCapacityData;

// Forecast Metrics
export const forecastMetrics = {
  demandGrowth: 15.2, // percentage
  avgAccuracy: 89.5,
  criticalAlerts: 1, // Only Tech Park at critical
};

