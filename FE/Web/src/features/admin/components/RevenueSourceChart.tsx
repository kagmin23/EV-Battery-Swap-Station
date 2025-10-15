import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { type RevenueBySource } from '@/mock/RevenueData';

interface RevenueSourceChartProps {
  data: RevenueBySource[];
}

export const RevenueSourceChart: React.FC<RevenueSourceChartProps> = ({ data }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Sources</h3>
      <div className="space-y-4">
        {data.map((source) => (
          <div key={source.source} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                ></div>
                <span className="text-sm font-medium text-slate-700">
                  {source.source}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(source.amount)}
                </span>
                <div className="flex items-center gap-1">
                  {source.trend >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      source.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {source.trend >= 0 ? '+' : ''}
                    {source.trend}%
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${source.percentage}%`,
                  backgroundColor: source.color,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{source.percentage}% of total</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

