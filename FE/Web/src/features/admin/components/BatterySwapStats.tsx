import React from 'react';
import type { BatterySwapStats as StatsType } from '../types/batteryChanges.types';
import KPICard from './KPICard';

interface BatterySwapStatsProps {
  stats: StatsType;
}

const BatterySwapStats: React.FC<BatterySwapStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <KPICard
        title="Today's Swaps"
        value={stats.totalSwapsToday}
        subtitle="Completed today"
        icon="⚡"
        bgColor="bg-blue-100"
      />
      <KPICard
        title="This Week"
        value={stats.totalSwapsWeek}
        subtitle="Last 7 days"
        icon="📊"
        bgColor="bg-green-100"
      />
      <KPICard
        title="This Month"
        value={stats.totalSwapsMonth}
        subtitle="Last 30 days"
        icon="📈"
        bgColor="bg-purple-100"
      />
      <KPICard
        title="Avg Swap Time"
        value={formatTime(stats.averageSwapTime)}
        subtitle="Average duration"
        icon="⏱️"
        bgColor="bg-yellow-100"
      />
      <KPICard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        subtitle="All transactions"
        icon="💰"
        bgColor="bg-red-100"
      />
      <KPICard
        title="Most Active"
        value={stats.mostActiveStation.count.toString()}
        subtitle={stats.mostActiveStation.name}
        icon="🏆"
        bgColor="bg-indigo-100"
      />
    </div>
  );
};

export default BatterySwapStats;

