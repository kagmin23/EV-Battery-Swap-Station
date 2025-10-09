import React from 'react';
import type { BatterySwapTransaction } from '../types/batteryChanges.types';

interface BatterySwapChartsProps {
  transactions: BatterySwapTransaction[];
}

const BatterySwapCharts: React.FC<BatterySwapChartsProps> = ({ transactions }) => {
  // Calculate swaps by station
  const swapsByStation = transactions.reduce((acc, swap) => {
    const stationName = swap.station.name;
    acc[stationName] = (acc[stationName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stationData = Object.entries(swapsByStation).sort((a, b) => b[1] - a[1]);
  const maxStationCount = Math.max(...Object.values(swapsByStation));

  // Calculate swaps by battery model
  const swapsByModel = transactions.reduce((acc, swap) => {
    const model = swap.batteryGiven.model;
    acc[model] = (acc[model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modelData = Object.entries(swapsByModel).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxModelCount = Math.max(...Object.values(swapsByModel));

  // Calculate swaps by hour (for peak hours)
  const swapsByHour = transactions.reduce((acc, swap) => {
    const hour = new Date(swap.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: swapsByHour[i] || 0,
  }));
  const maxHourCount = Math.max(...hourData.map(h => h.count));

  // Calculate status distribution
  const statusCounts = transactions.reduce((acc, swap) => {
    acc[swap.status] = (acc[swap.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSwaps = transactions.length;

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500',
    pending: 'bg-yellow-500',
    cancelled: 'bg-red-500',
    disputed: 'bg-orange-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Swaps by Station */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Swaps by Station
        </h3>
        <div className="space-y-3">
          {stationData.map(([station, count]) => (
            <div key={station}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{station}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxStationCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Battery Models */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🔋 Top Battery Models
        </h3>
        <div className="space-y-3">
          {modelData.map(([model, count]) => (
            <div key={model}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{model}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxModelCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ⏰ Peak Hours
        </h3>
        <div className="grid grid-cols-12 gap-1">
          {hourData.map(({ hour, count }) => {
            const intensity = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
            let bgColor = 'bg-gray-100';
            if (intensity > 75) bgColor = 'bg-red-500';
            else if (intensity > 50) bgColor = 'bg-orange-400';
            else if (intensity > 25) bgColor = 'bg-yellow-300';
            else if (intensity > 0) bgColor = 'bg-green-200';

            return (
              <div
                key={hour}
                className={`${bgColor} rounded p-2 text-center transition-all duration-300 hover:scale-110`}
                title={`${hour}:00 - ${count} swaps`}
              >
                <div className="text-xs font-semibold text-gray-700">
                  {hour}h
                </div>
                <div className="text-xs text-gray-600">{count}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>No activity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-300 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Peak</span>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 Transaction Status Distribution
        </h3>
        <div className="space-y-4">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = ((count / totalSwaps) * 100).toFixed(1);
            return (
              <div key={status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${statusColors[status]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pie Chart Visualization */}
        <div className="mt-6 flex justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {(() => {
                let currentAngle = 0;
                return Object.entries(statusCounts).map(([status, count]) => {
                  const percentage = (count / totalSwaps) * 100;
                  const angle = (percentage / 100) * 360;
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                  const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                  const endX = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                  const endY = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                  
                  currentAngle += angle;
                  
                  const pathColor = statusColors[status].replace('bg-', '');
                  const colorMap: Record<string, string> = {
                    'green-500': '#22c55e',
                    'yellow-500': '#eab308',
                    'red-500': '#ef4444',
                    'orange-500': '#f97316',
                  };
                  
                  return (
                    <path
                      key={status}
                      d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                      fill={colorMap[pathColor]}
                      opacity="0.8"
                    />
                  );
                });
              })()}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{totalSwaps}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatterySwapCharts;

