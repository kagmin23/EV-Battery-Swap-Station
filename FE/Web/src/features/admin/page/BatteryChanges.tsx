import { useState, useMemo, useEffect } from 'react';
import { mockStations } from '../../../mock/StationData';
import type { BatterySwapFilters as FiltersType, BatterySwapTransaction } from '../types/batteryChanges.types';
import BatterySwapStats from '../components/BatterySwapStats';
import BatterySwapFilters from '../components/BatterySwapFilters';
import BatterySwapTable from '../components/BatterySwapTable';
import BatterySwapCharts from '../components/BatterySwapCharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { TransactionApi } from '../apis/transactionApi';

type ViewMode = 'table' | 'analytics';

export default function BatteryChanges() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<BatterySwapTransaction[]>([]);
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

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiTransactions = await TransactionApi.getAllTransactions();

        // Map API response to BatterySwapTransaction format
        const mappedTransactions: BatterySwapTransaction[] = apiTransactions
          .filter(t => (t.batteryIdGiven || t.battery_given) && (t.batteryIdReturned || t.battery_returned)) // Only include battery swap transactions
          .map((t) => {
            // Helper to get user info (handle both string and object)
            const getUserInfo = () => {
              if (typeof t.user === 'string') {
                return { id: t.user, name: 'Unknown Driver', phone: 'N/A' };
              }
              return {
                id: t.userId,
                name: t.user?.fullName || 'Unknown Driver',
                phone: t.user?.phoneNumber || 'N/A',
              };
            };

            // Helper to get station info (handle both string and object)
            const getStationInfo = () => {
              if (typeof t.station === 'string') {
                return { id: t.station, name: 'Unknown Station', location: 'N/A' };
              }
              return {
                id: t.stationId,
                name: t.station?.stationName || 'Unknown Station',
                location: t.station?.address || 'N/A',
              };
            };

            const userInfo = getUserInfo();
            const stationInfo = getStationInfo();

            return {
              transaction_id: t._id,
              timestamp: t.createdAt || t.created_at || t.transaction_time || new Date().toISOString(),
              driver: {
                id: userInfo.id,
                name: userInfo.name,
                vehicle: 'N/A', // API doesn't provide vehicle info yet
                phone: userInfo.phone,
              },
              station: {
                id: stationInfo.id,
                name: stationInfo.name,
                location: stationInfo.location,
              },
              batteryReturned: {
                id: t.batteryIdReturned || t.battery_returned || 'N/A',
                model: typeof t.batteryReturned !== 'string' && t.batteryReturned?.model ? t.batteryReturned.model : 'N/A',
                sohBefore: typeof t.batteryReturned !== 'string' && t.batteryReturned?.soh ? t.batteryReturned.soh : 0,
                chargeLevel: typeof t.batteryReturned !== 'string' && t.batteryReturned?.chargeLevel ? t.batteryReturned.chargeLevel : 0,
                cycleCount: 0, // API doesn't provide cycle count yet
              },
              batteryGiven: {
                id: t.batteryIdGiven || t.battery_given || 'N/A',
                model: typeof t.batteryGiven !== 'string' && t.batteryGiven?.model ? t.batteryGiven.model : 'N/A',
                sohAfter: typeof t.batteryGiven !== 'string' && t.batteryGiven?.soh ? t.batteryGiven.soh : 0,
                chargeLevel: typeof t.batteryGiven !== 'string' && t.batteryGiven?.chargeLevel ? t.batteryGiven.chargeLevel : 0,
                cycleCount: 0, // API doesn't provide cycle count yet
              },
              processedBy: 'Staff', // API doesn't provide processed by info yet
              duration: 300, // Default 5 minutes, API doesn't provide duration yet
              cost: t.amount || t.cost || 0,
              status: t.status.toLowerCase() as 'completed' | 'cancelled' | 'disputed' | 'pending',
            };
          });

        setTransactions(mappedTransactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Get unique battery models for filter
  const batteryModels = useMemo(() => {
    const models = new Set<string>();
    transactions.forEach(swap => {
      models.add(swap.batteryGiven.model);
      models.add(swap.batteryReturned.model);
    });
    return Array.from(models).sort();
  }, [transactions]);

  // Filter transactions based on filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
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
  }, [filters, transactions]);

  // Calculate stats from transactions
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedTransactions = transactions.filter(t => t.status === 'completed');

    const todaySwaps = completedTransactions.filter(t => new Date(t.timestamp) >= todayStart);
    const weekSwaps = completedTransactions.filter(t => new Date(t.timestamp) >= weekStart);
    const monthSwaps = completedTransactions.filter(t => new Date(t.timestamp) >= monthStart);

    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.cost, 0);
    const avgSwapTime = completedTransactions.reduce((sum, t) => sum + t.duration, 0) / completedTransactions.length || 0;

    // Find most active station
    const stationCounts: Record<string, { name: string; count: number }> = {};
    completedTransactions.forEach(t => {
      if (!stationCounts[t.station.id]) {
        stationCounts[t.station.id] = { name: t.station.name, count: 0 };
      }
      stationCounts[t.station.id].count++;
    });

    const mostActiveStation = Object.values(stationCounts).sort((a, b) => b.count - a.count)[0] || {
      name: 'N/A',
      count: 0,
    };

    return {
      totalSwapsToday: todaySwaps.length,
      totalSwapsWeek: weekSwaps.length,
      totalSwapsMonth: monthSwaps.length,
      averageSwapTime: avgSwapTime,
      totalRevenue,
      mostActiveStation,
    };
  }, [transactions]);

  const handleViewBatteryDetails = (batteryId: string) => {
    setSelectedBatteryId(batteryId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBatteryId(null);
  };



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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading battery change data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold mb-2">Data Loading Error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              🔋 Battery Change Management
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
            className={`px-6 py-2 rounded-lg transition-colors ${viewMode === 'table'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            📋 Table View
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-6 py-2 rounded-lg transition-colors ${viewMode === 'analytics'
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
            <span className="font-semibold text-gray-900">{transactions.length}</span> transactions
          </span>
          {filteredTransactions.length !== transactions.length && (
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

      {/* Battery Logs Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Battery Logs - {selectedBatteryId}
            </DialogTitle>
            <DialogDescription>
              Battery activity and event history
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Logs Content */}
            <div className="space-y-4">
              {/* Mock log entries */}
              {[
                {
                  timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Nguyễn Văn Minh (ID: DRV-001) - Trạm Hà Nội - SOH: 89% - Thời gian sử dụng: 3h 45m'
                },
                {
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được sạc đầy 100%',
                  details: 'Thời gian sạc: 2h 30m - Nhiệt độ: 25°C'
                },
                {
                  timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Trần Thị Hoa (ID: DRV-002) - Xe: VF8 - Thời gian thuê: 14:30 - SOH: 95%'
                },
                {
                  timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                  level: 'WARNING',
                  message: 'Nhiệt độ pin cao',
                  details: 'Nhiệt độ: 45°C, Ngưỡng: 40°C - Đã làm mát tự động'
                },
                {
                  timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Lê Văn Đức (ID: DRV-003) - Trạm TP.HCM - SOH: 87% - Thời gian sử dụng: 2h 15m'
                },
                {
                  timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được đổi tại trạm Hà Nội',
                  details: 'Tài xế: Nguyễn Văn A (ID: DRV-004) - Xe: VF9 - SOH: 92% - Thời gian đổi: 5 phút'
                },
                {
                  timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Phạm Thị Lan (ID: DRV-005) - Xe: VF8 - Thời gian thuê: 09:15 - SOH: 94%'
                },
                {
                  timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                  level: 'ERROR',
                  message: 'Lỗi kết nối với hệ thống',
                  details: 'Mất kết nối trong 5 phút - Đã khôi phục tự động'
                },
                {
                  timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Hoàng Văn Nam (ID: DRV-006) - Trạm Đà Nẵng - SOH: 91% - Thời gian sử dụng: 4h 20m'
                },
                {
                  timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Vũ Thị Mai (ID: DRV-007) - Xe: VF9 - Thời gian thuê: 16:45 - SOH: 88%'
                },
                {
                  timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được kiểm tra định kỳ',
                  details: 'SOH: 92%, Sức khỏe: Tốt - Nhiệt độ: 22°C - Điện áp: 400V'
                },
                {
                  timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Đặng Văn Tùng (ID: DRV-008) - Trạm Hà Nội - SOH: 85% - Thời gian sử dụng: 6h 15m'
                },
                {
                  timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Bùi Thị Hương (ID: DRV-009) - Xe: VF8 - Thời gian thuê: 08:30 - SOH: 93%'
                },
                {
                  timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
                  level: 'WARNING',
                  message: 'Pin được trả về với cảnh báo',
                  details: 'Tài xế: Lê Văn Đức (ID: DRV-010) - Nhiệt độ cao: 48°C - Trạm TP.HCM - Đã xử lý'
                },
                {
                  timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Nguyễn Thị Linh (ID: DRV-011) - Xe: VF9 - Thời gian thuê: 11:20 - SOH: 90%'
                },
                {
                  timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Trần Văn Hùng (ID: DRV-012) - Trạm Đà Nẵng - SOH: 86% - Thời gian sử dụng: 5h 30m'
                },
                {
                  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Phạm Văn Tuấn (ID: DRV-013) - Xe: VF8 - Thời gian thuê: 13:15 - SOH: 89%'
                },
                {
                  timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Hoàng Thị Lan (ID: DRV-014) - Trạm Hà Nội - SOH: 84% - Thời gian sử dụng: 7h 45m'
                },
                {
                  timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
                  level: 'ERROR',
                  message: 'Lỗi khi tài xế trả pin',
                  details: 'Tài xế: Vũ Văn Nam (ID: DRV-015) - Lỗi kết nối - Trạm TP.HCM - Đã xử lý thủ công'
                },
                {
                  timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được thuê bởi tài xế',
                  details: 'Tài xế: Đặng Thị Hoa (ID: DRV-016) - Xe: VF9 - Thời gian thuê: 15:40 - SOH: 91%'
                },
                {
                  timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được trả về trạm',
                  details: 'Tài xế: Bùi Văn Minh (ID: DRV-017) - Trạm Đà Nẵng - SOH: 88% - Thời gian sử dụng: 3h 20m'
                },
                {
                  timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
                  level: 'INFO',
                  message: 'Pin được kiểm tra bảo trì',
                  details: 'SOH: 89%, Sức khỏe: Tốt - Nhiệt độ: 24°C - Điện áp: 398V - Chu kỳ: 150/2000'
                }
              ].map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${log.level === 'ERROR' ? 'border-red-500 bg-red-50' :
                    log.level === 'WARNING' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                          log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {log.level}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.timestamp.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 mb-1">{log.message}</p>
                      <p className="text-sm text-gray-600">{log.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => console.log('Download logs')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}