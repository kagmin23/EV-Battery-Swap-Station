import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AIInsight } from '@/mock/ForecastData';

interface AIInsightCardProps {
  insight: AIInsight;
  onTakeAction?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, onTakeAction }) => {
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    demand: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    revenue: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    battery: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    maintenance: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    optimization: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };

  const colors = categoryColors[insight.category] || categoryColors.demand;

  const getImpactIcon = () => {
    switch (insight.impact) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${colors.border} p-5 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">{getImpactIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-800">{insight.title}</h4>
              {insight.actionRequired && (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
              {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">{insight.confidence}%</span>
          </div>
          <span className="text-xs text-slate-500">confidence</span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{insight.description}</p>

      {insight.actionRequired && onTakeAction && (
        <Button
          onClick={onTakeAction}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
        >
          Take Action
        </Button>
      )}
    </div>
  );
};

