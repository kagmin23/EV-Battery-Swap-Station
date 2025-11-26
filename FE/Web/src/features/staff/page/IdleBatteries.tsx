import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BatteryCharging, ShieldCheck, Gauge, Zap, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Pagination from '../components/Pagination';
import { getStationBatteries } from '../apis/DashboardApi';
import type { Battery } from '../apis/DashboardApi';

export default function IdleBatteries() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('User information not found. Please login again.');
        const user = JSON.parse(userStr);
        const stationId = user.station;
        if (!stationId) throw new Error('No station assigned to this staff member.');

        const data = await getStationBatteries(stationId);
        setBatteries((data || []).filter(b => b.status === 'idle'));
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load idle batteries');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBatteries = useMemo(() => {
    if (!searchQuery.trim()) return batteries;
    const query = searchQuery.trim().toLowerCase();
    return batteries.filter((battery) => {
      const model = battery.model?.toLowerCase() ?? '';
      return battery.serial.toLowerCase().includes(query) || model.includes(query);
    });
  }, [batteries, searchQuery]);

  const totalItems = filteredBatteries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatteries = filteredBatteries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleView = (id: string) => {
    navigate(`/staff/battery/${id}`);
  };

  const averageHealth = batteries.length
    ? Math.round(batteries.reduce((sum, battery) => sum + (battery.soh || 0), 0) / batteries.length)
    : 0;

  const averageCapacity = batteries.length
    ? (batteries.reduce((sum, battery) => sum + (battery.capacity_kWh || 0), 0) / batteries.length).toFixed(1)
    : '0.0';

  const highHealthCount = batteries.filter((battery) => battery.soh >= 95).length;
  const readyToSwap = batteries.filter((battery) => battery.status === 'idle' && (battery.soh ?? 0) >= 85).length;

  if (isLoading) {
    return (
      <div className="min-h-screen  p-6">
        <div className="space-y-4">
          <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <TableSkeleton rows={10} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="min-h-screen  p-6 space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Station operations</p>
        <h1 className="text-3xl font-bold text-slate-900">Idle Batteries</h1>
        <p className="text-slate-600">Monitor ready-to-deploy batteries and keep utilization balanced.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <BatteryCharging className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Total idle</p>
              <p className="text-2xl font-bold text-slate-900">{batteries.length}</p>
              <p className="text-xs text-slate-500">Ready to deploy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Avg. capacity</p>
              <p className="text-2xl font-bold text-slate-900">{averageCapacity} kWh</p>
              <p className="text-xs text-slate-500">Across idle stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-yellow-100 p-3 text-yellow-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Avg. health</p>
              <p className="text-2xl font-bold text-slate-900">{averageHealth}%</p>
              <p className="text-xs text-slate-500">{highHealthCount} batteries ≥ 95%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Ready for swap</p>
              <p className="text-2xl font-bold text-slate-900">{readyToSwap}</p>
              <p className="text-xs text-slate-500">Idle &amp; ≥ 85% SOH</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">Filters &amp; search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by battery code or model..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <Badge variant="secondary" className="self-start rounded-full bg-slate-100 px-4 py-2 text-slate-600">
              {filteredBatteries.length} idle batteries
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-lg">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-xl text-slate-900">Inventory table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Battery Code</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Health</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {currentBatteries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No idle batteries match your filters.
                    </td>
                  </tr>
                ) : (
                  currentBatteries.map((battery) => (
                    <tr key={battery._id} className="transition hover:bg-slate-50/60">
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
                      <td className="px-6 py-4 text-center">
                        <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Idle
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700"
                          onClick={() => handleView(battery._id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
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
  );
}
