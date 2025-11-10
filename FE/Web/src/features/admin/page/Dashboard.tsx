import { useState, useEffect } from 'react';
import { mockBatteries } from '../../../mock/BatteryData';
import KPICard from '../components/KPICard';
import RecentTransactionsTable from '../components/RecentTransactionsTable';
import { BatteryApi, type Battery } from '../apis/batteryApi';
import { toast } from 'sonner';
import { StaffService, type Staff } from '../../../services/api/staffService';
import { DriverService, type Driver } from '../../../services/api/driverService';
import { TransactionService } from '@/services/api/transactionService';
import { UserService } from '@/services/api/userService';
import { StationService } from '@/services/api/stationService';
import { ReportsApi } from '../apis/reportsApi';
import { KPISkeletonGroup, CardSkeleton } from '@/components/ui/table-skeleton';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stations, setStations] = useState<Array<{ _id: string; stationName: string; capacity: number; availableBatteries: number }>>([]);
  const [allTransactions, setAllTransactions] = useState<Array<{ cost: number; transaction_time: string }>>([]);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    transaction_id: string;
    user_name: string;
    station_name: string;
    transaction_time: string;
    cost: number;
  }>>([]);
  const [overviewReport, setOverviewReport] = useState<{ revenue: number; swaps: number } | null>(null);
  const [usageReport, setUsageReport] = useState<{ frequency: number[]; peakHours: number[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch batteries from API
        try {
          const batteryResponse = await BatteryApi.getAllBatteries();
          setBatteries(batteryResponse.data);
        } catch (err) {
          console.error('Error fetching batteries data:', err);
          // Fallback to mock data
          const mockApiBatteries: Battery[] = mockBatteries.map(b => ({
            _id: b.battery_id || '',
            serial: b.battery_id || '',
            model: b.battery_model || '',
            soh: b.soh_percent || 0,
            status: (b.status === 'in_use' ? 'in-use' : b.status) as 'charging' | 'faulty' | 'idle' | 'full' | 'in-use',
            station: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setBatteries(mockApiBatteries);
        }
        
        // Fetch staff from API
        try {
          const staffData = await StaffService.getAllStaff();
          setStaff(staffData);
        } catch (err) {
          console.error('Error fetching staff data:', err);
          setStaff([]);
        }
        
        // Fetch drivers from API
        try {
          const driverData = await DriverService.getAllDrivers();
          setDrivers(driverData);
        } catch (err) {
          console.error('Error fetching drivers data:', err);
          setDrivers([]);
        }

        // Fetch stations from API
        try {
          const stationData = await StationService.getAllStations();
          setStations(stationData.map(s => ({ 
            _id: s._id, 
            stationName: s.stationName,
            capacity: s.capacity || 0,
            availableBatteries: s.availableBatteries || 0
          })));
        } catch (err) {
          console.error('Error fetching stations data:', err);
          setStations([]);
        }

        // Fetch all transactions for revenue calculation
        try {
          const allTransactionResponse = await TransactionService.getAllTransactions({});
          setAllTransactions(allTransactionResponse.data.map(t => ({
            cost: t.cost || 0,
            transaction_time: t.transaction_time || new Date().toISOString()
          })));
        } catch (err) {
          console.error('Error fetching all transactions:', err);
          setAllTransactions([]);
        }
        
        // Fetch recent transactions from API (limit to 5)
        try {
          const transactionResponse = await TransactionService.getAllTransactions({ limit: 5 });
          const transactionData = transactionResponse.data;
          
          // Get unique user IDs and station IDs
          const uniqueUserIds = Array.from(new Set(
            transactionData.map(t => t.user_id).filter(Boolean)
          ));
          const uniqueStationIds = Array.from(new Set(
            transactionData.map(t => t.station_id).filter(Boolean)
          ));

          // Fetch user and station details in parallel
          const userDetailsMap = new Map<string, string>();
          const stationDetailsMap = new Map<string, string>();

          await Promise.all([
            // Fetch all users
            ...uniqueUserIds.map(async (userId) => {
              try {
                const userResponse = await UserService.getUserById(userId);
                if (userResponse.success && userResponse.data) {
                  userDetailsMap.set(userId, userResponse.data.fullName || userResponse.data.email);
                }
              } catch (err) {
                console.error(`Failed to fetch user ${userId}:`, err);
                userDetailsMap.set(userId, 'Unknown User');
              }
            }),
            // Fetch all stations
            ...uniqueStationIds.map(async (stationId) => {
              try {
                const stationResponse = await StationService.getStationById(stationId);
                if (stationResponse) {
                  stationDetailsMap.set(stationId, stationResponse.stationName);
                }
              } catch (err) {
                console.error(`Failed to fetch station ${stationId}:`, err);
                stationDetailsMap.set(stationId, 'Unknown Station');
              }
            }),
          ]);

          // Map API response to table format with fetched names
          const formattedTransactions = transactionData.map(t => ({
            transaction_id: t.transaction_id,
            user_name: userDetailsMap.get(t.user_id) || 'Unknown User',
            station_name: stationDetailsMap.get(t.station_id) || 'Unknown Station',
            transaction_time: t.transaction_time,
            cost: t.cost,
          }));
          
          setRecentTransactions(formattedTransactions);
        } catch (err) {
          console.error('Error fetching transactions data:', err);
          setRecentTransactions([]);
        }

        // Fetch overview report
        try {
          const overviewData = await ReportsApi.getOverviewReport();
          setOverviewReport(overviewData.data);
        } catch (err) {
          console.error('Error fetching overview report:', err);
          setOverviewReport(null);
        }

        // Fetch usage report
        try {
          const usageData = await ReportsApi.getUsageReport();
          setUsageReport(usageData.data);
        } catch (err) {
          console.error('Error fetching usage report:', err);
          setUsageReport(null);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const totalStations = stations.length;
  const totalAvailableBatteries = stations.reduce((sum, s) => sum + s.availableBatteries, 0);
  const totalBatteries = batteries.length;
  // Count active users from API data
  const activeDrivers = drivers.filter(u => u.status === 'active').length;
  const activeStaff = staff.filter(u => u.status === 'active').length;

  // Calculate revenue from actual transactions
  const totalRevenue = allTransactions.reduce((sum, t) => sum + t.cost, 0);
  const todayRevenue = allTransactions
    .filter(t => new Date(t.transaction_time).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.cost, 0);

  // Map API status to display status (in-use without dash for display)
  const batteryByStatus = {
    charging: batteries.filter(b => b.status === 'charging').length,
    faulty: batteries.filter(b => b.status === 'faulty').length,
    idle: batteries.filter(b => b.status === 'idle').length,
    full: batteries.filter(b => b.status === 'full').length,
    'in-use': batteries.filter(b => b.status === 'in-use').length,
    'is-booking': batteries.filter(b => b.status === 'is-booking').length,
  } as const;

  // Display mapping: label and color for each raw status key
  const statusDisplayMap: Record<keyof typeof batteryByStatus, { label: string; color: string }> = {
    charging: { label: 'Charging', color: '#F97316' }, // orange-500
    faulty: { label: 'Faulty', color: '#EF4444' }, // red-500
    idle: { label: 'Idle', color: '#6B7280' }, // gray-500
    full: { label: 'Full', color: '#22C55E' }, // green-500
    'in-use': { label: 'In Use', color: '#3B82F6' }, // blue-500
    'is-booking': { label: 'Is Booking', color: '#6C47FF' }, // violet custom
  };

  // Convert to display-friendly object for chart consumption

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <KPISkeletonGroup count={4} className="mb-8" />

        {/* Battery Status Skeleton */}
        <div className="mb-8">
          <CardSkeleton className="h-96" />
        </div>

        {/* Recent Transactions Skeleton */}
        <div className="mb-8">
          <CardSkeleton className="h-64" />
        </div>

        {/* Reports Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && batteries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold mb-2">Error Loading Dashboard</p>
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
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Welcome back! This is an overview of the EV Battery Swap System
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`Today: ${formatCurrency(todayRevenue)}`}
          icon="💰"
          bgColor="bg-gray-100"
        />
        <KPICard
          title="Total Stations"
          value={totalStations}
          subtitle={`${totalAvailableBatteries} batteries available`}
          icon="🏢"
          bgColor="bg-blue-100"
        />
        <KPICard
          title="Total Batteries"
          value={totalBatteries}
          subtitle={`${batteryByStatus.idle + batteryByStatus.full} available`}
          icon="🔋"
          bgColor="bg-green-100"
        />
        <KPICard
          title="Active Users"
          value={activeDrivers + activeStaff}
          subtitle={`${activeDrivers} drivers, ${activeStaff} staff`}
          icon="👥"
          bgColor="bg-red-100"
        />
      </div>

      {/* Battery Status (only one below, with legend and numbers) */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Battery Status Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              {Object.keys(batteryByStatus).map((rawKey) => {
                const { label, color } = statusDisplayMap[rawKey as keyof typeof batteryByStatus];
                return (
                  <div key={rawKey} className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                      <span className="text-slate-700">{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col items-end text-right">
              {Object.keys(batteryByStatus).map((rawKey) => (
                <div key={rawKey} className="mb-4 text-slate-900 text-base">{batteryByStatus[rawKey as keyof typeof batteryByStatus]}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <RecentTransactionsTable transactions={recentTransactions} />
      </div>

      {/* Revenue & Usage Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Overview Report */}
        {overviewReport && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Revenue Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(overviewReport.revenue)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Battery Swaps</p>
                  <p className="text-2xl font-bold text-blue-600">{overviewReport.swaps.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
              {overviewReport.swaps > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Average Revenue per Swap</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(overviewReport.revenue / overviewReport.swaps)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage Report */}
        {usageReport && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Usage Report Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Usage Frequency Data Points</p>
                  <p className="text-2xl font-bold text-orange-600">{usageReport.frequency.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Recorded frequency measurements</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Peak Hours Data Points</p>
                  <p className="text-2xl font-bold text-rose-600">{usageReport.peakHours.length}</p>
                  <p className="text-xs text-slate-500 mt-1">High-traffic time periods</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}