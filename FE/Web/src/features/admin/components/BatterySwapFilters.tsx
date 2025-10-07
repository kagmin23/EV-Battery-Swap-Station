import React from 'react';
import type { BatterySwapFilters as FiltersType } from '../types/batteryChanges.types';

interface BatterySwapFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
  stations: Array<{ id: string; name: string }>;
  batteryModels: string[];
}

const BatterySwapFilters: React.FC<BatterySwapFiltersProps> = ({
  filters,
  onFilterChange,
  stations,
  batteryModels,
}) => {
  const handleInputChange = (field: keyof FiltersType, value: string | number) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      dateFrom: '',
      dateTo: '',
      stationId: '',
      batteryModel: '',
      status: '',
      minSOH: 0,
      maxSOH: 100,
      searchQuery: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔍 Filters</h3>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleInputChange('searchQuery', e.target.value)}
            placeholder="Driver, Battery ID, Transaction ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Station */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Station
          </label>
          <select
            value={filters.stationId}
            onChange={(e) => handleInputChange('stationId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stations</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        {/* Battery Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Battery Model
          </label>
          <select
            value={filters.batteryModel}
            onChange={(e) => handleInputChange('batteryModel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Models</option>
            {batteryModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* Min SOH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min SOH (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.minSOH}
            onChange={(e) => handleInputChange('minSOH', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Max SOH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max SOH (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.maxSOH}
            onChange={(e) => handleInputChange('maxSOH', parseInt(e.target.value) || 100)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default BatterySwapFilters;

