interface BatteryStatus {
  available: number;
  in_use: number;
  charging: number;
  maintenance: number;
  retired: number;
}

interface BatteryStatusChartProps {
  batteryByStatus: BatteryStatus;
}

export default function BatteryStatusChart({ batteryByStatus }: BatteryStatusChartProps) {
  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    in_use: 'bg-blue-500',
    charging: 'bg-orange-500',
    maintenance: 'bg-yellow-500',
    retired: 'bg-red-500',
  };

  return (
    <div 
      className="backdrop-blur-md p-6 rounded-xl shadow-lg"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: '1px',
        borderColor: 'var(--color-border)',
      }}
    >
      <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>
        Battery Status Distribution
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(batteryByStatus).map(([status, count]) => (
          <div key={status} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusColors[status]} shadow-sm`} />
            <span className="capitalize flex-1" style={{ color: 'var(--color-text-secondary)' }}>
              {status.replace('_', ' ')}
            </span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

