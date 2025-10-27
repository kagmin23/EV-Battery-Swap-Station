import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ForecastDataPoint } from '@/mock/ForecastData';

interface ForecastChartProps {
  data: ForecastDataPoint[];
  title: string;
  unit: string;
  color: string;
  showConfidence?: boolean;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  title,
  unit,
  color,
  showConfidence = true,
}) => {
  const maxValue = Math.max(
    ...data.map(d => showConfidence ? d.confidenceHigh : d.predicted)
  );
  const minValue = Math.min(
    ...data.map(d => showConfidence ? d.confidenceLow : d.predicted)
  );
  const range = maxValue - minValue;

  const getY = (value: number): number => {
    return 100 - ((value - minValue) / range) * 100;
  };

  const formatValue = (value: number): string => {
    if (unit === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    }
    if (unit === '%') {
      return `${value.toFixed(0)}%`;
    }
    return value.toString();
  };

  // Calculate trend
  const firstValue = data[0]?.predicted || 0;
  const lastValue = data[data.length - 1]?.predicted || 0;
  const trendPercentage = ((lastValue - firstValue) / firstValue) * 100;
  const isPositiveTrend = trendPercentage > 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2 mt-2">
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveTrend ? '+' : ''}{trendPercentage.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500">forecast period</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Predicted Value</p>
          <p className="text-xl font-bold text-slate-800">
            {formatValue(lastValue)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-4">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          {/* Confidence Band */}
          {showConfidence && (
            <path
              d={`M 0,${getY(data[0].confidenceHigh)} ${data.map((d, i) => 
                `L ${(i / (data.length - 1)) * 800},${getY(d.confidenceHigh)}`
              ).join(' ')} ${data.slice().reverse().map((d, i) => 
                `L ${((data.length - 1 - i) / (data.length - 1)) * 800},${getY(d.confidenceLow)}`
              ).join(' ')} Z`}
              fill={color}
              fillOpacity="0.1"
            />
          )}

          {/* Predicted Line */}
          <path
            d={`M 0,${getY(data[0].predicted)} ${data.map((d, i) => 
              `L ${(i / (data.length - 1)) * 800},${getY(d.predicted)}`
            ).join(' ')}`}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Actual Data Points (if available) */}
          {data.filter(d => d.actual !== undefined).map((d, i) => {
            const actualIndex = data.indexOf(d);
            return (
              <circle
                key={i}
                cx={(actualIndex / (data.length - 1)) * 800}
                cy={getY(d.actual!)}
                r="4"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Grid Lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2="800"
              y2={y * 2}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}
        </svg>

        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 -ml-16">
          {[maxValue, (maxValue + minValue) / 2, minValue].map((value, i) => (
            <span key={i}>{formatValue(value)}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: color }}></div>
          <span className="text-slate-600">Predicted</span>
        </div>
        {data.some(d => d.actual !== undefined) && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600">Actual</span>
          </div>
        )}
        {showConfidence && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded`} style={{ backgroundColor: color, opacity: 0.2 }}></div>
            <span className="text-slate-600">Confidence Interval</span>
          </div>
        )}
      </div>
    </div>
  );
};

