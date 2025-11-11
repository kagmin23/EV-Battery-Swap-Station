import { useState, useEffect } from 'react';
import { BatterySwapService, type SwapHistoryRecord, type SwapHistoryFilters } from '@/services/api/batterySwapService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton, KPISkeletonGroup } from '@/components/ui/table-skeleton';
import { 
  Calendar, 
  MapPin, 
  User, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function BatteryChanges() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swapHistory, setSwapHistory] = useState<SwapHistoryRecord[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 7,
    totalPages: 1,
  });

  // Filters
  const [filters, setFilters] = useState<SwapHistoryFilters>({
    page: 1,
    limit: 7,
  });

  // Client-side filters
  const [clientFilters, setClientFilters] = useState({
    userName: '',
    stationName: '',
    startDate: '',
    endDate: '',
  });

  // Fetch swap history
  const fetchSwapHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await BatterySwapService.getSwapHistory(filters);
      setSwapHistory(response.history);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch swap history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapHistory();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleClientFilterChange = (key: keyof typeof clientFilters, value: string) => {
    setClientFilters({ ...clientFilters, [key]: value });
  };

  // Apply client-side filtering
  const filteredSwapHistory = swapHistory.filter(swap => {
    // Filter by user name
    if (clientFilters.userName && !swap.user.email.toLowerCase().includes(clientFilters.userName.toLowerCase())) {
      return false;
    }

    // Filter by station name
    if (clientFilters.stationName && !swap.station.stationName.toLowerCase().includes(clientFilters.stationName.toLowerCase())) {
      return false;
    }

    // Filter by start date
    if (clientFilters.startDate) {
      const swapDate = new Date(swap.swapTime);
      const startDate = new Date(clientFilters.startDate);
      if (swapDate < startDate) return false;
    }

    // Filter by end date
    if (clientFilters.endDate) {
      const swapDate = new Date(swap.swapTime);
      const endDate = new Date(clientFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (swapDate > endDate) return false;
    }

    return true;
  });

  const handleExport = () => {
    const headers = [
      'Swap ID',
      'Date',
      'User Email',
      'Station',
      'Pillar',
      'Old Battery',
      'New Battery',
      'Status'
    ];

    const csvData = filteredSwapHistory.map(swap => [
      swap.swapId,
      new Date(swap.swapTime).toLocaleString(),
      swap.user.email,
      swap.station.stationName,
      swap.pillar.pillarName,
      swap.oldBattery?.battery.serial || 'N/A',
      swap.newBattery?.battery.serial || 'N/A',
      swap.status
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battery-swap-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, className: 'bg-green-100 text-green-800', label: 'Completed' },
      'in-progress': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      initiated: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800', label: 'Initiated' },
      cancelled: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.initiated;
    return <Badge className={`${config.className} whitespace-nowrap`}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen">
        <div className="mb-8 space-y-2">
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <KPISkeletonGroup count={4} className="mb-8" />
        <div className="bg-white rounded-xl shadow-lg p-6">
          <TableSkeleton rows={10} columns={6} />
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
          <Button onClick={() => fetchSwapHistory()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    totalSwaps: filteredSwapHistory.length,
    completedSwaps: filteredSwapHistory.filter(s => s.status === 'completed').length,
    inProgressSwaps: filteredSwapHistory.filter(s => s.status === 'in-progress').length,
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🔋 Swap History
            </h1>
            <p className="text-gray-600 mt-1">
              Track and analyze all battery swap transactions
            </p>
          </div>
          <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedSwaps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressSwaps}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">User Name</label>
              <Input
                placeholder="Search by user email..."
                value={clientFilters.userName}
                onChange={(e) => handleClientFilterChange('userName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Station Name</label>
              <Input
                placeholder="Search by station name..."
                value={clientFilters.stationName}
                onChange={(e) => handleClientFilterChange('stationName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
              <Input
                type="date"
                value={clientFilters.startDate}
                onChange={(e) => handleClientFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
              <Input
                type="date"
                value={clientFilters.endDate}
                onChange={(e) => handleClientFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swap History Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Swap History ({filteredSwapHistory.length} records)</CardTitle>
            <div className="text-sm text-gray-600">
              Showing {filteredSwapHistory.length} of {pagination.total} total records
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold text-gray-700">Swap ID</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">User</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Station</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Batteries</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSwapHistory.map((swap) => (
                  <tr key={swap._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm">{swap.swapId}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(swap.swapTime).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{swap.user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {swap.station.stationName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {swap.pillar.pillarName} ({swap.pillar.pillarCode})
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {swap.oldBattery && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-red-600">Out:</span>
                            <span className="font-medium">{swap.oldBattery.battery.serial}</span>
                            <span className="text-xs text-gray-500">({swap.oldBattery.soh}%)</span>
                          </div>
                        )}
                        {swap.newBattery && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">In:</span>
                            <span className="font-medium">{swap.newBattery.battery.serial}</span>
                            <span className="text-xs text-gray-500">({swap.newBattery.soh}%)</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(swap.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
