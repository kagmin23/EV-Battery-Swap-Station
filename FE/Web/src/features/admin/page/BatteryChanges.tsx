import { useState, useMemo } from 'react';
import { mockBatterySwaps, getBatterySwapStats, mockBatteryHistory } from '../../../mock/BatterySwapData';
import { mockStations } from '../../../mock/StationData';
import type { BatterySwapFilters as FiltersType } from '../types/batteryChanges.types';
import BatterySwapStats from '../components/BatterySwapStats';
import BatterySwapFilters from '../components/BatterySwapFilters';
import BatterySwapTable from '../components/BatterySwapTable';
import BatterySwapCharts from '../components/BatterySwapCharts';
import BatteryDetailsModal from '../components/BatteryDetailsModal';

type ViewMode = 'table' | 'analytics';

export default function BatteryChanges() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<FiltersType>({
    dateFrom: '',
    dateTo: '',
    stationId: '',
    batteryModel: '',
    status: '',
    minSOH: 0,
    maxSOH: 100,
    searchQuery: '',
  });
  const [selectedBatteryId, setSelectedBatteryId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get unique battery models for filter
  const batteryModels = useMemo(() => {
    const models = new Set<string>();
    mockBatterySwaps.forEach(swap => {
      models.add(swap.batteryGiven.model);
      models.add(swap.batteryReturned.model);
    });
    return Array.from(models).sort();
  }, []);

  // Filter transactions based on filters
  const filteredTransactions = useMemo(() => {
    return mockBatterySwaps.filter(transaction => {
      // Date filters
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.timestamp);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const transactionDate = new Date(transaction.timestamp);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (transactionDate > toDate) return false;
      }

      // Station filter
      if (filters.stationId && transaction.station.id !== filters.stationId) {
        return false;
      }

      // Battery model filter
      if (filters.batteryModel) {
        if (
          transaction.batteryGiven.model !== filters.batteryModel &&
          transaction.batteryReturned.model !== filters.batteryModel
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }

      // SOH filter
      const minSOH = Math.min(
        transaction.batteryGiven.sohAfter,
        transaction.batteryReturned.sohBefore
      );
      const maxSOH = Math.max(
        transaction.batteryGiven.sohAfter,
        transaction.batteryReturned.sohBefore
      );
      if (minSOH < filters.minSOH || maxSOH > filters.maxSOH) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          transaction.transaction_id,
          transaction.driver.name,
          transaction.driver.vehicle,
          transaction.station.name,
          transaction.batteryGiven.id,
          transaction.batteryReturned.id,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const stats = getBatterySwapStats();

  const handleViewBatteryDetails = (batteryId: string) => {
    setSelectedBatteryId(batteryId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBatteryId(null);
  };

  const selectedBatteryHistory = useMemo(() => {
    if (!selectedBatteryId) return null;
    return mockBatteryHistory.find(h => h.battery_id === selectedBatteryId) || null;
  }, [selectedBatteryId]);

  const handleExportData = () => {
    // Convert filtered transactions to CSV
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Driver',
      'Vehicle',
      'Station',
      'Battery Returned',
      'Battery Given',
      'Duration (s)',
      'Cost',
      'Status'
    ];
    
    const csvData = filteredTransactions.map(t => [
      t.transaction_id,
      t.timestamp,
      t.driver.name,
      t.driver.vehicle,
      t.station.name,
      `${t.batteryReturned.id} (SOH: ${t.batteryReturned.sohBefore}%)`,
      `${t.batteryGiven.id} (SOH: ${t.batteryGiven.sohAfter}%)`,
      t.duration,
      t.cost,
      t.status
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battery-swaps-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="p-6 min-h-screen" 
      style={{ 
        background: 'linear-gradient(to bottom right, var(--color-bg-primary), var(--color-bg-secondary), var(--color-bg-tertiary))' 
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              🔋 Battery Changes Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Track and analyze all battery swap transactions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <BatterySwapStats stats={stats} />

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
          <button
            onClick={() => setViewMode('table')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Table View
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              viewMode === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Analytics View
          </button>
        </div>
      </div>

      {/* Filters */}
      <BatterySwapFilters
        filters={filters}
        onFilterChange={setFilters}
        stations={mockStations.map(s => ({ id: s.station_id, name: s.station_name }))}
        batteryModels={batteryModels}
      />

      {/* Results Count */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-md px-6 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredTransactions.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{mockBatterySwaps.length}</span> transactions
          </span>
          {filteredTransactions.length !== mockBatterySwaps.length && (
            <button
              onClick={() => setFilters({
                dateFrom: '',
                dateTo: '',
                stationId: '',
                batteryModel: '',
                status: '',
                minSOH: 0,
                maxSOH: 100,
                searchQuery: '',
              })}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <BatterySwapTable
          transactions={filteredTransactions}
          onViewDetails={handleViewBatteryDetails}
        />
      ) : (
        <BatterySwapCharts transactions={filteredTransactions} />
      )}

      {/* Battery Details Modal */}
      <BatteryDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        batteryId={selectedBatteryId || ''}
        batteryHistory={selectedBatteryHistory}
      />
    </div>
  );
}