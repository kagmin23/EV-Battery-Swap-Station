interface AlertsPanelProps {
  lowHealthBatteries: number;
  pendingSupport: number;
}

export default function AlertsPanel({ lowHealthBatteries, pendingSupport }: AlertsPanelProps) {
  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold mb-5 text-gray-900">
        Alerts & Notifications
      </h3>
      <div className="flex flex-col gap-4">
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-sm font-semibold text-red-800 mb-1">Low Battery Health Alert</p>
          <p className="text-xs text-red-600">
            {lowHealthBatteries} batteries have SOH below 85%
          </p>
        </div>
        
        <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
          <p className="text-sm font-semibold text-orange-800 mb-1">
            Pending Support Requests
          </p>
          <p className="text-xs text-orange-600">
            {pendingSupport} support requests need attention
          </p>
        </div>
        
        <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
          <p className="text-sm font-semibold text-green-800 mb-1">System Status</p>
          <p className="text-xs text-green-600">All systems operational</p>
        </div>
      </div>
    </div>
  );
}

