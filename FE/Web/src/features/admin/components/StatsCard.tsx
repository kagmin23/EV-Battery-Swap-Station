import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  iconBg: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  gradientFrom,
  gradientTo,
  textColor,
  iconBg
}) => {
  return (
    <Card className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} shadow-lg border-0`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 ${iconBg} rounded-xl`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className={`text-4xl font-bold ${textColor}`}>{value}</div>
            <div className={`text-lg ${textColor} font-medium`}>{title}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
