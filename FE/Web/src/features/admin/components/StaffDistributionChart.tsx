import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MapPin } from 'lucide-react';
import type { StaffStats } from '../types/staff';

interface StaffDistributionChartProps {
  stats: StaffStats;
}

export const StaffDistributionChart: React.FC<StaffDistributionChartProps> = ({ stats }) => {
  const maxCount = Math.max(...stats.staffByStation.map(s => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Phân bố nhân viên theo trạm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.staffByStation.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Không có dữ liệu</p>
          ) : (
            stats.staffByStation.map((station) => {
              const percentage = (station.count / maxCount) * 100;
              return (
                <div key={station.stationId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{station.stationName}</span>
                    </div>
                    <span className="text-sm text-gray-500">{station.count} nhân viên</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
