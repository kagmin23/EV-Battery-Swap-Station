import React from 'react';
import { Calendar, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RevenueFiltersProps {
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly') => void;
  selectedStation: string;
  onStationChange: (station: string) => void;
  onExport: () => void;
}

const stations = [
  { id: 'ALL', name: 'All Stations' },
  { id: 'ST001', name: 'Downtown Swap Station' },
  { id: 'ST002', name: 'Airport Battery Hub' },
  { id: 'ST003', name: 'Tech Park Station' },
  { id: 'ST004', name: 'University Swap Point' },
  { id: 'ST005', name: 'Shopping Mall Hub' },
];

export const RevenueFilters: React.FC<RevenueFiltersProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedStation,
  onStationChange,
  onExport,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Period Selection */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Period:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPeriodChange('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === 'daily'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => onPeriodChange('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === 'weekly'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => onPeriodChange('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Station Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Station:</span>
          </div>
          <select
            value={selectedStation}
            onChange={(e) => onStationChange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
          >
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <Button
          onClick={onExport}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

