import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BatteryCharging, Gauge, Zap, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import SearchBar from '../components/SearchBar';
import ActionMenu from '../components/ActionMenu';
import EditBatteryModal from '../components/EditBatteryModal';
import Pagination from '../components/Pagination';
import { getStationBatteries, updateBattery } from '../apis/DashboardApi';
import type { Battery as OrigBattery, UpdateBatteryRequest } from '../apis/DashboardApi';
import type { FilterValues } from '../components/FilterModal';
import { getStationById } from '../apis/BatteryLogApi';

type Battery = OrigBattery & { status: string };

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [filteredBatteries, setFilteredBatteries] = useState<Battery[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  const itemsPerPage = 10;

  // Get station name from localStorage cache or API
  const getStationName = async (stationId: string): Promise<string> => {
    try {
      // First, try to get from station_cache in localStorage
      const stationCacheStr = localStorage.getItem('station_cache');
      if (stationCacheStr) {
        try {
          const cache = JSON.parse(stationCacheStr);
          if (cache.data && Array.isArray(cache.data)) {
            const cachedStation = cache.data.find((s: { _id: string }) => s._id === stationId);
            if (cachedStation && cachedStation.stationName) {
              return cachedStation.stationName;
            }
          }
        } catch (e) {
          console.warn('Failed to parse station cache:', e);
        }
      }

      // If not in cache, fetch from staff API endpoint
      const stationData = await getStationById(stationId);
      return stationData.stationName;
    } catch (err) {
      console.error('Error fetching station name:', err);
      return 'Unknown Station';
    }
  };

  // Fetch batteries and station info on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get staff's station from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('User information not found. Please login again.');
        }
        
        const user = JSON.parse(userStr);
        const stationId = user.station;
        
        if (!stationId) {
          throw new Error('No station assigned to this staff member.');
        }
        
        // Fetch station name and batteries in parallel
        const [stationNameResult, batteryData] = await Promise.all([
          getStationName(stationId),
          getStationBatteries(stationId)
        ]);
        
        setStationName(stationNameResult);
        setBatteries(batteryData as Battery[]);
        setFilteredBatteries(batteryData as Battery[]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derive available models from batteries
  const availableModels: string[] = Array.from(
    new Set(
      batteries
        .map(b => (b.model || '').trim())
        .filter((m): m is string => m !== '')
    )
  );

  // Filter and search batteries
  useEffect(() => {
    let filtered = [...batteries];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((battery) => {
        const serial = (battery.serial ?? '').toLowerCase();
        const model = (battery.model ?? '').toLowerCase();
        const status = (battery.status ?? '').toLowerCase();

        return (
          serial.includes(query) ||
          model.includes(query) ||
          status.includes(query)
        );
      });
    }

    // Apply filters
    if (filters.model) {
      filtered = filtered.filter(battery => battery.model === filters.model);
    }

    if (filters.status) {
      filtered = filtered.filter(battery => battery.status === filters.status);
    }

    if (filters.minSOH !== undefined && filters.maxSOH !== undefined) {
      filtered = filtered.filter(battery => 
        battery.soh >= (filters.minSOH || 0) && battery.soh <= (filters.maxSOH || 100)
      );
    } else if (filters.minSOH !== undefined) {
      filtered = filtered.filter(battery => battery.soh >= (filters.minSOH || 0));
    } else if (filters.maxSOH !== undefined) {
      filtered = filtered.filter(battery => battery.soh <= (filters.maxSOH || 100));
    }

    if (filters.minCapacity !== undefined && filters.maxCapacity !== undefined) {
      filtered = filtered.filter(battery => 
        (battery.capacity_kWh || 0) >= (filters.minCapacity || 0) && 
        (battery.capacity_kWh || 0) <= (filters.maxCapacity || 1000)
      );
    } else if (filters.minCapacity !== undefined) {
      filtered = filtered.filter(battery => (battery.capacity_kWh || 0) >= (filters.minCapacity || 0));
    } else if (filters.maxCapacity !== undefined) {
      filtered = filtered.filter(battery => (battery.capacity_kWh || 0) <= (filters.maxCapacity || 1000));
    }

    setFilteredBatteries(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [batteries, searchQuery, filters]);

  // Calculate pagination
  const totalItems = filteredBatteries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatteries = filteredBatteries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (id: string) => {
    // Navigate to Battery Log page
    navigate(`/staff/battery/${id}`);
  };

  const handleEdit = (id: string) => {
    const battery = batteries.find(b => b._id === id);
    if (battery) {
      setSelectedBattery(battery);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveBattery = async (batteryId: string, data: UpdateBatteryRequest) => {
    try {
      await updateBattery(batteryId, data);
      toast.success('Battery updated successfully!');
      
      // Refresh the battery list
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const stationId = user.station;
        if (stationId) {
          const updatedData = await getStationBatteries(stationId);
          setBatteries(updatedData as Battery[]);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update battery');
      throw error;
    }
  };

  const statusCounts = useMemo(() => {
    return filteredBatteries.reduce<Record<string, number>>((acc, battery) => {
      const key = battery.status?.toLowerCase() ?? 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [filteredBatteries]);

  const summary = useMemo(() => {
    const avgHealth = filteredBatteries.length
      ? Math.round(filteredBatteries.reduce((sum, battery) => sum + (battery.soh || 0), 0) / filteredBatteries.length)
      : 0;

    const totalCapacity = filteredBatteries.reduce((sum, battery) => sum + (battery.capacity_kWh || 0), 0);

    return {
      avgHealth,
      totalCapacity,
      available: (statusCounts['idle'] ?? 0) + (statusCounts['full'] ?? 0),
      booking: statusCounts['is-booking'] ?? statusCounts['booking'] ?? 0,
    };
  }, [filteredBatteries, statusCounts]);

  if (isLoading) {
    return (
      <div className="min-h-screen  p-6">
        <div className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <TableSkeleton rows={10} columns={6} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-semibold mb-2">Data Loading Error</p>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen  p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Station overview</p>
          <h1 className="text-3xl font-bold text-slate-900">
            {stationName || 'Your Station'}
          </h1>
          <p className="text-slate-600">Manage every battery at a glance with filters, health, and actions.</p>
        </div>
 
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  <BatteryCharging className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Total batteries</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredBatteries.length}</p>
                  <p className="text-xs text-slate-500">{summary.totalCapacity.toFixed(0)} kWh capacity</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                  <Gauge className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Avg. SOH</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.avgHealth}%</p>
                  <p className="text-xs text-slate-500">health across list</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-yellow-100 p-3 text-yellow-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Available now</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.available}</p>
                  <p className="text-xs text-slate-500">idle or full</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Bookings</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.booking}</p>
                  <p className="text-xs text-slate-500">reserved batteries</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800">Filters &amp; search</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setFilters={setFilters}
                models={availableModels}
              />
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-lg">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl text-slate-900">Station inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Serial</th>
                      <th className="px-6 py-4">Model</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Health</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {currentBatteries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No batteries match your current filters.
                        </td>
                      </tr>
                    ) : (
                      currentBatteries.map((battery) => (
                        <tr key={battery._id} className="relative transition hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-semibold text-slate-900">{battery.serial}</td>
                          <td className="px-6 py-4">{battery.model || 'N/A'}</td>
                          <td className="px-6 py-4">{battery.capacity_kWh || 0} kWh</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-indigo-500"
                                  style={{ width: `${Math.min(battery.soh ?? 0, 100)}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-900">{battery.soh}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                battery.status === 'full'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : battery.status === 'charging'
                                    ? 'bg-blue-50 text-blue-700'
                                    : battery.status === 'faulty'
                                      ? 'bg-rose-50 text-rose-700'
                                      : battery.status === 'in-use'
                                        ? 'bg-amber-50 text-amber-700'
                                        : battery.status === 'is-booking'
                                          ? 'bg-indigo-50 text-indigo-700'
                                          : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {battery.status === 'is-booking'
                                ? 'Is Booking'
                                : battery.status === 'in-use'
                                  ? 'In Use'
                                  : battery.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <ActionMenu batteryId={battery._id} onView={handleView} onEdit={handleEdit} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </CardContent>
          </Card>
        </div>

      <EditBatteryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBattery(null);
        }}
        battery={selectedBattery}
        onSave={handleSaveBattery}
      />
      
    </div>
  );
}
