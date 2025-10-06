interface QuickAction {
  icon: string;
  label: string;
  color: string;
}

export default function QuickActionsGrid() {
  const actions: QuickAction[] = [
    { icon: '👤', label: 'Manage Users', color: '#5B4CFF' },
    { icon: '🏢', label: 'Station Management', color: '#22C55E' },
    { icon: '🔋', label: 'Battery Inventory', color: '#F97316' },
    { icon: '📊', label: 'Revenue Reports', color: '#E91E8C' },
    { icon: '🤖', label: 'AI Forecasts', color: '#EAB308' },
    { icon: '💬', label: 'Support Requests', color: '#EF4444' },
  ];

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
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            className="p-4 backdrop-blur border-2 rounded-lg cursor-pointer flex items-center gap-3 transition-all text-sm font-medium hover:shadow-lg"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: action.color,
              color: 'var(--color-text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = action.color;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
          >
            <span className="text-2xl">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

