interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  bgColor: string;
}

export default function KPICard({ title, value, subtitle, icon, bgColor }: KPICardProps) {
  return (
    <div 
      className="backdrop-blur-md p-6 rounded-xl shadow-lg transition-all hover:shadow-xl"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: '1px',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</h3>
          <p className="text-xs mt-2" style={{ color: 'var(--color-accent-pink)' }}>{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center text-2xl shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

