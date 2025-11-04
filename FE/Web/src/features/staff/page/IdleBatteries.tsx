import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import Pagination from '../components/Pagination';
import { getStationBatteries } from '../apis/DashboardApi';
import type { Battery } from '../apis/DashboardApi';

export default function IdleBatteries() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalItems = batteries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBatteries = batteries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleView = (id: string) => {
    navigate(`/staff/battery/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-8 min-h-screen">
        <div className="w-full max-w-7xl px-4">
          <div className="mb-6 space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <TableSkeleton rows={10} columns={5} />
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
    <div className="flex flex-col items-center py-8 min-h-screen">
      <div className="w-full max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Idle Batteries</h1>
          <p className="text-text-secondary">Only batteries with status Idle in your station</p>
        </div>

        <div className="overflow-x-auto">
          <div className="border border-black-500 rounded-lg shadow-xs dark:border-border dark:shadow-gray-900">
            <table className="min-w-full divide-y divide-border dark:divide-border">
              <thead className="bg-button-primary dark:bg-button-secondary">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase">Battery Code</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase">Model</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase">Capacity</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase">Health</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-text-primary uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-table-row divide-y divide-border dark:divide-border">
                {currentBatteries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">No idle batteries</td>
                  </tr>
                ) : (
                  currentBatteries.map((battery) => (
                    <tr key={battery._id} className="hover:bg-table-row-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{battery.serial}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{battery.model || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{battery.capacity_kWh || 0}kWh</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{battery.soh}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Idle</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => handleView(battery._id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
