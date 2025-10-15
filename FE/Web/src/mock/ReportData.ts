export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'operational' | 'financial' | 'user-staff' | 'battery-health' | 'customer-service';
  lastGenerated?: string;
  isFavorite: boolean;
  iconType: string;
}

export interface RecentReport {
  id: string;
  reportTitle: string;
  generatedDate: string;
  format: string;
  size: string;
  status: 'completed' | 'generating' | 'failed';
}

export const reportTemplates: ReportTemplate[] = [
  // Operational Reports
  {
    id: 'battery-swap-activity',
    title: 'Battery Swap Activity Report',
    description: 'Detailed analysis of battery swap transactions, frequency, and patterns across all stations',
    category: 'operational',
    lastGenerated: '2 hours ago',
    isFavorite: true,
    iconType: 'battery-charging',
  },
  {
    id: 'station-performance',
    title: 'Station Performance Report',
    description: 'Comprehensive performance metrics including uptime, throughput, and efficiency per station',
    category: 'operational',
    lastGenerated: 'Yesterday',
    isFavorite: false,
    iconType: 'map-pin',
  },
  {
    id: 'battery-utilization',
    title: 'Battery Inventory & Utilization Report',
    description: 'Battery stock levels, utilization rates, and distribution across the network',
    category: 'operational',
    lastGenerated: '3 days ago',
    isFavorite: true,
    iconType: 'package',
  },
  {
    id: 'peak-hours-analysis',
    title: 'Peak Hours & Traffic Analysis',
    description: 'Traffic patterns, peak usage times, and demand forecasting by time of day and location',
    category: 'operational',
    lastGenerated: '1 week ago',
    isFavorite: false,
    iconType: 'clock',
  },

  // Financial Reports
  {
    id: 'revenue-report',
    title: 'Revenue Report',
    description: 'Comprehensive revenue analysis with trends, breakdowns, and growth metrics',
    category: 'financial',
    lastGenerated: '1 hour ago',
    isFavorite: true,
    iconType: 'dollar-sign',
  },
  {
    id: 'transaction-summary',
    title: 'Transaction Summary Report',
    description: 'Detailed transaction logs, payment statuses, and financial reconciliation',
    category: 'financial',
    lastGenerated: 'Today',
    isFavorite: false,
    iconType: 'receipt',
  },
  {
    id: 'payment-method-analysis',
    title: 'Payment Method Analysis',
    description: 'Analysis of payment methods used, success rates, and customer preferences',
    category: 'financial',
    lastGenerated: '2 days ago',
    isFavorite: false,
    iconType: 'credit-card',
  },
  {
    id: 'subscription-revenue',
    title: 'Subscription Revenue Report',
    description: 'Subscription plan performance, renewal rates, and recurring revenue analysis',
    category: 'financial',
    lastGenerated: '5 days ago',
    isFavorite: true,
    iconType: 'trending-up',
  },

  // User & Staff Reports
  {
    id: 'driver-activity',
    title: 'Driver Activity Report',
    description: 'Driver engagement metrics, swap frequency, and behavior patterns',
    category: 'user-staff',
    lastGenerated: '6 hours ago',
    isFavorite: false,
    iconType: 'users',
  },
  {
    id: 'staff-performance',
    title: 'Staff Performance Report',
    description: 'Staff productivity, shift coverage, and performance KPIs',
    category: 'user-staff',
    lastGenerated: 'Yesterday',
    isFavorite: true,
    iconType: 'user-check',
  },
  {
    id: 'user-registration-trends',
    title: 'User Registration Trends',
    description: 'New user acquisition, registration sources, and growth trends',
    category: 'user-staff',
    lastGenerated: '1 week ago',
    isFavorite: false,
    iconType: 'user-plus',
  },
  {
    id: 'subscription-plan-analysis',
    title: 'Subscription Plan Analysis',
    description: 'Plan popularity, upgrade/downgrade patterns, and customer lifetime value',
    category: 'user-staff',
    lastGenerated: '4 days ago',
    isFavorite: false,
    iconType: 'layers',
  },

  // Battery Health Reports
  {
    id: 'battery-soh-report',
    title: 'Battery SOH (State of Health) Report',
    description: 'Detailed health status of all batteries with degradation tracking',
    category: 'battery-health',
    lastGenerated: '3 hours ago',
    isFavorite: true,
    iconType: 'activity',
  },
  {
    id: 'battery-lifecycle',
    title: 'Battery Lifecycle Report',
    description: 'Battery age, cycle count, and lifecycle stage analysis',
    category: 'battery-health',
    lastGenerated: 'Yesterday',
    isFavorite: false,
    iconType: 'rotate-cw',
  },
  {
    id: 'maintenance-schedule',
    title: 'Maintenance Schedule Report',
    description: 'Upcoming maintenance needs, service history, and compliance tracking',
    category: 'battery-health',
    lastGenerated: '2 days ago',
    isFavorite: true,
    iconType: 'wrench',
  },
  {
    id: 'battery-degradation-analysis',
    title: 'Battery Degradation Analysis',
    description: 'Degradation patterns, factors analysis, and replacement forecasting',
    category: 'battery-health',
    lastGenerated: '1 week ago',
    isFavorite: false,
    iconType: 'alert-triangle',
  },

  // Customer Service Reports
  {
    id: 'support-request-summary',
    title: 'Support Request Summary',
    description: 'Support ticket volume, types, and resolution status',
    category: 'customer-service',
    lastGenerated: '4 hours ago',
    isFavorite: false,
    iconType: 'headphones',
  },
  {
    id: 'feedback-analysis',
    title: 'Feedback Analysis',
    description: 'Customer feedback sentiment, ratings, and satisfaction trends',
    category: 'customer-service',
    lastGenerated: 'Today',
    isFavorite: true,
    iconType: 'message-square',
  },
  {
    id: 'response-time-report',
    title: 'Response Time Report',
    description: 'Average response and resolution times for customer inquiries',
    category: 'customer-service',
    lastGenerated: '3 days ago',
    isFavorite: false,
    iconType: 'timer',
  },
  {
    id: 'issue-resolution-rate',
    title: 'Issue Resolution Rate',
    description: 'Success rates in resolving customer issues and complaint patterns',
    category: 'customer-service',
    lastGenerated: '5 days ago',
    isFavorite: false,
    iconType: 'check-circle',
  },
];

export const recentReports: RecentReport[] = [
  {
    id: 'rr-1',
    reportTitle: 'Revenue Report - Last 30 Days',
    generatedDate: '2024-10-14 09:30',
    format: 'PDF',
    size: '2.4 MB',
    status: 'completed',
  },
  {
    id: 'rr-2',
    reportTitle: 'Battery SOH Report - All Stations',
    generatedDate: '2024-10-14 08:15',
    format: 'Excel',
    size: '1.8 MB',
    status: 'completed',
  },
  {
    id: 'rr-3',
    reportTitle: 'Staff Performance Report - October',
    generatedDate: '2024-10-13 16:45',
    format: 'PDF',
    size: '3.1 MB',
    status: 'completed',
  },
  {
    id: 'rr-4',
    reportTitle: 'Battery Swap Activity - This Week',
    generatedDate: '2024-10-13 14:20',
    format: 'CSV',
    size: '892 KB',
    status: 'completed',
  },
  {
    id: 'rr-5',
    reportTitle: 'Customer Feedback Analysis - Q3',
    generatedDate: '2024-10-12 11:00',
    format: 'PDF',
    size: '1.5 MB',
    status: 'completed',
  },
];

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'operational': 'Operational',
    'financial': 'Financial',
    'user-staff': 'User & Staff',
    'battery-health': 'Battery Health',
    'customer-service': 'Customer Service',
  };
  return labels[category] || category;
};

export const getCategoryColor = (category: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'operational': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'financial': { bg: 'bg-green-100', text: 'text-green-700' },
    'user-staff': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'battery-health': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'customer-service': { bg: 'bg-pink-100', text: 'text-pink-700' },
  };
  return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
};

