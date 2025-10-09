import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = false,
  onBackClick,
  children
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <p className="text-slate-600 font-medium">{description}</p>
      </div>
      {children}
    </div>
  );
};
