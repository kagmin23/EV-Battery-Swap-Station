interface AlertsPanelProps {
  lowHealthBatteries: number;
  pendingSupport: number;
}

export default function AlertsPanel({ lowHealthBatteries, pendingSupport }: AlertsPanelProps) {
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
        Alerts & Notifications
      </h3>
      <div className="flex flex-col gap-4">
        <div className="p-3 backdrop-blur border-l-4 border-red-400 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
          <p className="text-sm font-semibold text-red-100 mb-1">Low Battery Health Alert</p>
          <p className="text-xs text-red-200">
            {lowHealthBatteries} batteries have SOH below 85%
          </p>
        </div>
        
        <div className="p-3 backdrop-blur border-l-4 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', borderLeftColor: 'var(--color-accent-pink)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Pending Support Requests
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {pendingSupport} support requests need attention
          </p>
        </div>

        <div className="p-3 backdrop-blur border-l-4 border-green-400 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
          <p className="text-sm font-semibold text-green-100 mb-1">System Status</p>
          <p className="text-xs text-green-200">All systems operational</p>
        </div>
      </div>
    </div>
  );
}

