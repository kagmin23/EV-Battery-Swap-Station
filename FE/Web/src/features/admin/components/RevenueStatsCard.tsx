import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
}

export const RevenueStatsCard: React.FC<RevenueStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradientFrom,
  gradientTo,
  iconBg,
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="mt-3 flex items-center gap-1">
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-semibold ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend >= 0 ? '+' : ''}
                {trend}%
              </span>
              <span className="text-xs text-slate-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

