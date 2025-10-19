import { useState } from 'react';
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
import { TableSkeleton, CardSkeleton } from '@/components/ui/table-skeleton';

export default function Dashboard() {
  const [isLoading] = useState(false); // Set to true when integrating real API

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

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-9 w-80 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
          <div className="h-5 w-96 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        
        {/* KPI Cards Skeleton */}
        <CardSkeleton count={4} />
        
        {/* Charts & Alerts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-4" />
              <div className="h-64 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-700" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions Table Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
          <TableSkeleton rows={5} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Bảng điều khiển Admin
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Chào mừng trở lại! Đây là tổng quan về Hệ thống đổi Pin EV
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPICard
          title="Tổng doanh thu"
          value={formatCurrency(totalRevenue)}
          subtitle={`Hôm nay: ${formatCurrency(todayRevenue)}`}
          icon="💰"
          bgColor="bg-gray-100"
        />
        <KPICard
          title="Tổng số Trạm"
          value={totalStations}
          subtitle="Đang hoạt động"
          icon="🏢"
          bgColor="bg-blue-100"
        />
        <KPICard
          title="Tổng số Pin"
          value={totalBatteries}
          subtitle={`${batteryByStatus.available} sẵn sàng`}
          icon="🔋"
          bgColor="bg-green-100"
        />
        <KPICard
          title="Người dùng hoạt động"
          value={activeDrivers + activeStaff}
          subtitle={`${activeDrivers} tài xế, ${activeStaff} nhân viên`}
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