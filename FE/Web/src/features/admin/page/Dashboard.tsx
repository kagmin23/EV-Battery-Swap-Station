import { mockBatteries } from '../../../mock/BatteryData';
import { mockStations } from '../../../mock/StationData';
import { mockTransactions, mockRevenueData } from '../../../mock/TransactionData';
import { getUsersByRole } from '../../../mock/UserData';
import { getPendingSupportRequestsCount } from '../../../mock/SupportRequestData';
import KPICard from '../components/KPICard';
import BatteryStatusChart from '../components/BatteryStatusChart';
import AlertsPanel from '../components/AlertsPanel';
import RecentTransactionsTable from '../components/RecentTransactionsTable';
import QuickActionsGrid from '../components/QuickActionsGrid';

export default function Dashboard() {
  // Calculate statistics
  const totalStations = mockStations.length;
  const totalBatteries = mockBatteries.length;
  const activeDrivers = getUsersByRole('driver').filter(u => u.status === 'active').length;
  const activeStaff = getUsersByRole('staff').filter(u => u.status === 'active').length;
  
  const todayRevenue = mockRevenueData[mockRevenueData.length - 1]?.revenue || 0;
  const totalRevenue = mockRevenueData.reduce((sum, day) => sum + day.revenue, 0);
  
  const batteryByStatus = {
    available: mockBatteries.filter(b => b.status === 'available').length,
    in_use: mockBatteries.filter(b => b.status === 'in_use').length,
    charging: mockBatteries.filter(b => b.status === 'charging').length,
    maintenance: mockBatteries.filter(b => b.status === 'maintenance').length,
    retired: mockBatteries.filter(b => b.status === 'retired').length,
  };
  
  const pendingSupport = getPendingSupportRequestsCount();
  const lowHealthBatteries = mockBatteries.filter(b => b.soh_percent < 85).length;
  const recentTransactions = mockTransactions.slice(0, 5);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="p-6 min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-bg-primary), var(--color-bg-secondary), var(--color-bg-tertiary))' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Welcome back! Here's an overview of your EV Battery Swap System
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
          subtitle="All operational"
          icon="🏢"
          bgColor="bg-blue-100"
        />
        <KPICard
          title="Total Batteries"
          value={totalBatteries}
          subtitle={`${batteryByStatus.available} available`}
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

      {/* Battery Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <BatteryStatusChart batteryByStatus={batteryByStatus} />
        <AlertsPanel 
          lowHealthBatteries={lowHealthBatteries}
          pendingSupport={pendingSupport}
        />
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <RecentTransactionsTable transactions={recentTransactions} />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid />
    </div>
  );
}