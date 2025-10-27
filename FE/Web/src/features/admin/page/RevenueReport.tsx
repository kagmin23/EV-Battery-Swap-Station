import { useState, useMemo, useEffect } from 'react';
import { DollarSign, ShoppingCart, MapPin, Clock } from 'lucide-react';
import { RevenueFilters } from '../components/RevenueFilters';
import { RevenueStatsCard } from '../components/RevenueStatsCard';
import { RevenueChart } from '../components/RevenueChart';
import { StationRevenueChart } from '../components/StationRevenueChart';
import { PaymentMethodChart } from '../components/PaymentMethodChart';
import { RevenueSourceChart } from '../components/RevenueSourceChart';
import {
  mockDailyRevenue,
  mockWeeklyRevenue,
  mockMonthlyRevenue,
  mockRevenueByStation,
  mockRevenueByPaymentMethod,
  mockRevenueBySource,
  calculateRevenueMetrics,
} from '@/mock/RevenueData';
import { Spinner } from '@/components/ui/spinner';
import ReportsApi, { type RevenueData } from '../apis/reportsApi';
import { toast } from 'sonner';

export default function RevenueReport() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [apiRevenueData, setApiRevenueData] = useState<RevenueData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch revenue data on component mount and when period changes
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch overview report for Revenue Report page
        const overviewResponse = await ReportsApi.getOverviewReport();
        // Convert overview data to revenue format
        const revenueData: RevenueData[] = [{
          date: new Date().toISOString().split('T')[0],
          revenue: overviewResponse.data.revenue,
          transactions: overviewResponse.data.swaps,
          avgTransactionValue: overviewResponse.data.swaps > 0 ? overviewResponse.data.revenue / overviewResponse.data.swaps : 0
        }];
        setApiRevenueData(revenueData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch revenue data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching revenue data:', err);
        // Fallback to mock data
        setApiRevenueData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedPeriod, selectedStation]);

  // Get data based on selected period
  const currentData = useMemo(() => {
    // Use API data if available, otherwise fallback to mock data
    if (apiRevenueData.length > 0) {
      return apiRevenueData;
    }
    
    switch (selectedPeriod) {
      case 'weekly':
        return mockWeeklyRevenue;
      case 'monthly':
        return mockMonthlyRevenue;
      default:
        return mockDailyRevenue;
    }
  }, [selectedPeriod, apiRevenueData]);

  // Filter data by station if needed
  const filteredData = useMemo(() => {
    if (selectedStation === 'ALL') {
      return currentData;
    }
    // In a real app, you'd filter by station here
    return currentData;
  }, [currentData, selectedStation]);

  // Calculate metrics
  const metrics = useMemo(() => calculateRevenueMetrics(filteredData), [filteredData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Revenue (VND)', 'Transactions', 'Avg Transaction Value (VND)'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        [row.date, row.revenue, row.transactions, row.avgTransactionValue].join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading revenue report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold mb-2">Error Loading Revenue Report</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Revenue Report
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Comprehensive revenue analysis and insights for EV Battery Swap Station
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <RevenueFilters
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedStation={selectedStation}
          onStationChange={setSelectedStation}
          onExport={handleExport}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RevenueStatsCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          trend={metrics.growthRate}
          gradientFrom="from-blue-50"
          gradientTo="to-blue-100/50"
          iconBg="bg-blue-500"
        />
        <RevenueStatsCard
          title="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          subtitle={`Average: ${formatCurrency(metrics.avgTransactionValue)}`}
          icon={ShoppingCart}
          gradientFrom="from-green-50"
          gradientTo="to-green-100/50"
          iconBg="bg-green-500"
        />
        <RevenueStatsCard
          title="Best Performing Station"
          value={metrics.topStation}
          subtitle="Highest revenue"
          icon={MapPin}
          gradientFrom="from-purple-50"
          gradientTo="to-purple-100/50"
          iconBg="bg-purple-500"
        />
        <RevenueStatsCard
          title="Peak Hours"
          value={metrics.peakHour}
          subtitle="Highest activity"
          icon={Clock}
          gradientFrom="from-orange-50"
          gradientTo="to-orange-100/50"
          iconBg="bg-orange-500"
        />
      </div>

      {/* Main Revenue Chart */}
      <div className="mb-8">
        <RevenueChart
          data={filteredData}
          title={`Revenue Trend (${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})`}
        />
      </div>

      {/* Additional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StationRevenueChart data={mockRevenueByStation} />
        <PaymentMethodChart data={mockRevenueByPaymentMethod} />
      </div>

      {/* Revenue Sources */}
      <div className="mb-8">
        <RevenueSourceChart data={mockRevenueBySource} />
      </div>

      {/* Summary Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed Revenue Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Transactions</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(-10).reverse().map((row, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-900">{row.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(row.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700 text-right">{row.transactions}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 text-right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(row.avgTransactionValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}