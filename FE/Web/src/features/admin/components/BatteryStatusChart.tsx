interface BatteryStatus {
  charging: number;
  faulty: number;
  idle: number;
  full: number;
  'in-use': number;
}

interface BatteryStatusChartProps {
  batteryByStatus: BatteryStatus;
}

export default function BatteryStatusChart({ batteryByStatus }: BatteryStatusChartProps) {
  const statusColors: Record<string, string> = {
    charging: 'bg-orange-500',
    faulty: 'bg-red-500',
    idle: 'bg-gray-500',
    full: 'bg-green-500',
    'in-use': 'bg-blue-500',
  };

  const statusLabels: Record<string, string> = {
    charging: 'Charging',
    faulty: 'Faulty',
    idle: 'Idle',
    full: 'Full',
    'in-use': 'In Use',
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold mb-5 text-gray-900">
        Battery Status Distribution
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(batteryByStatus).map(([status, count]) => (
          <div key={status} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'} shadow-sm`} />
            <span className="flex-1 text-gray-600">
              {statusLabels[status] || status}
            </span>
            <span className="font-bold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

