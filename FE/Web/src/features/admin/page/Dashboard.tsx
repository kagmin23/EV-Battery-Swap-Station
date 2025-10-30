import { useState, useEffect } from 'react';
import { mockBatteries } from '../../../mock/BatteryData';
import { mockStations } from '../../../mock/StationData';
import { mockRevenueData } from '../../../mock/TransactionData';
import { getPendingSupportRequestsCount } from '../../../mock/SupportRequestData';
import KPICard from '../components/KPICard';
import BatteryStatusChart from '../components/BatteryStatusChart';
import AlertsPanel from '../components/AlertsPanel';
import RecentTransactionsTable from '../components/RecentTransactionsTable';
import { Spinner } from '@/components/ui/spinner';
import { BatteryApi, type Battery } from '../apis/batteryApi';
import { toast } from 'sonner';
import { StaffService, type Staff } from '../../../services/api/staffService';
import { DriverService, type Driver } from '../../../services/api/driverService';
import { TransactionApi } from '../apis/transactionApi';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    transaction_id: string;
    user_name: string;
    station_name: string;
    transaction_time: string;
    cost: number;
  }>>([]);
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
        
        // Fetch recent transactions from API (limit to 5)
        try {
          const transactionData = await TransactionApi.getAllTransactions({ limit: 5 });
          // Map API response to table format
          const formattedTransactions = transactionData.map(t => {
            // Helper to get user name safely
            const getUserName = () => {
              if (typeof t.user === 'string') return 'Unknown User';
              return t.user?.fullName || 'Unknown User';
            };

            // Helper to get station name safely
            const getStationName = () => {
              if (typeof t.station === 'string') return 'Unknown Station';
              return t.station?.stationName || 'Unknown Station';
            };

            return {
              transaction_id: t._id,
              user_name: getUserName(),
              station_name: getStationName(),
              transaction_time: t.createdAt || t.created_at || t.transaction_time || new Date().toISOString(),
              cost: t.amount || t.cost || 0,
            };
          });
          setRecentTransactions(formattedTransactions);
        } catch (err) {
          console.error('Error fetching transactions data:', err);
          setRecentTransactions([]);
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
  const totalStations = mockStations.length;
  const totalBatteries = batteries.length;
  // Count active users from API data
  const activeDrivers = drivers.filter(u => u.status === 'active').length;
  const activeStaff = staff.filter(u => u.status === 'active').length;

  const todayRevenue = mockRevenueData[mockRevenueData.length - 1]?.revenue || 0;
  const totalRevenue = mockRevenueData.reduce((sum, day) => sum + day.revenue, 0);

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
  const batteryByStatusDisplay = Object.entries(batteryByStatus).reduce<Record<string, number>>((acc, [key, value]) => {
    const display = statusDisplayMap[key as keyof typeof batteryByStatus];
    acc[display.label] = value;
    return acc;
  }, {});

  const pendingSupport = getPendingSupportRequestsCount();
  const lowHealthBatteries = batteries.filter(b => b.soh < 85).length;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
          subtitle="Active"
          icon="🏢"
          bgColor="bg-blue-100"
        />
        <KPICard
          title="Total Batteries"
          value={totalBatteries}
          subtitle={`${batteryByStatus.full} available`}
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
    </div>
  );
}