import React from 'react';
import { Button } from '@/components/ui/button';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  lastGenerated?: string;
  isFavorite?: boolean;
  onGenerate: () => void;
  onView: () => void;
  onToggleFavorite?: () => void;
  iconColor: string;
  iconBg: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  icon: Icon,
  category,
  lastGenerated,
  isFavorite,
  onGenerate,
  onView,
  onToggleFavorite,
  iconColor,
  iconBg,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative group">
      {/* Favorite Star */}
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-500 transition-colors"
          aria-label="Toggle favorite"
        >
          {isFavorite ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 20 20">
              <path strokeWidth="2" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          )}
        </button>
      )}

      {/* Category Badge */}
      <div className="mb-4">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
          {category}
        </span>
      </div>

      {/* Icon */}
      <div className={`${iconBg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`${iconColor} w-7 h-7`} />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{description}</p>

      {/* Last Generated */}
      {lastGenerated && (
        <p className="text-xs text-slate-500 mb-4">
          Last generated: <span className="font-medium">{lastGenerated}</span>
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onView}
          variant="outline"
          size="sm"
          className="flex-1 text-slate-700 border-slate-300 hover:bg-slate-100"
        >
          View
        </Button>
        <Button
          onClick={onGenerate}
          size="sm"
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
        >
          Generate
        </Button>
      </div>
    </div>
  );
};

