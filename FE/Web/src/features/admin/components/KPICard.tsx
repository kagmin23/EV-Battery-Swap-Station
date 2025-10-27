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
      className="bg-white p-6 rounded-xl shadow-lg transition-all hover:shadow-xl border border-gray-200"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm mb-2 text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-xs mt-2 text-blue-600">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center text-2xl shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

