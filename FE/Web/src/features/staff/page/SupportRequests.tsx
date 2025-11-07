import { useEffect, useMemo, useState } from 'react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { SupportApi, type SupportRequest } from '../apis/SupportApi';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';

export default function SupportRequests() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('User information not found. Please login again.');
        const user = JSON.parse(userStr);
        const stationId: string | undefined = user.station;
        if (!stationId) throw new Error('No station assigned to this staff member.');

        const data = await SupportApi.getRequestsByStation(stationId);
        setRequests(data);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load support requests');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      new Date(r.booking.scheduledTime).toLocaleString().toLowerCase().includes(q) ||
      r.booking.battery.serial.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const current = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
    };
    const classes = map[status] || 'bg-gray-100 text-gray-800';
    const label = status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-flex ${classes}`}>{label}</span>;
  };

  const handleClose = async (id: string) => {
    const note = window.prompt('Enter close note (required):');
    if (note === null) return;
    if (!note || note.trim() === '') {
      toast.error('Close note is required');
      return;
    }
    try {
      await SupportApi.closeRequest(id, note.trim());
      toast.success('Support request closed');
      // refresh
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.station) {
          const data = await SupportApi.getRequestsByStation(user.station);
          setRequests(data);
          setCurrentPage(1);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-8 min-h-screen">
        <div className="w-full max-w-7xl px-4">
          {/* Header Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="w-80 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto">
            <div className="border border-black-500 rounded-lg shadow-xs">
              <TableSkeleton rows={10} columns={5} />
            </div>
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 min-h-screen">
      <div className="w-full max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Support Requests</h1>
            <p className="text-text-secondary">List of support requests at your station</p>
          </div>
          <div className="w-80">
            <input
              type="text"
              placeholder="Search by title, booking date, battery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="border border-black-500 rounded-lg shadow-xs dark:border-border dark:shadow-gray-900">
            <table className="min-w-full divide-y divide-border dark:divide-border">
              <thead className="bg-button-primary dark:bg-button-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase">Booking Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase">Battery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-table-row divide-y divide-border dark:divide-border">
                {current.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">No support requests found</td>
                  </tr>
                ) : (
                  current.map((r) => (
                    <tr key={r._id} className="hover:bg-table-row-hover transition-colors">
                      <td className="px-6 py-4 text-sm text-text-secondary">{r.title}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{new Date(r.booking.scheduledTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        <div>{r.booking.battery.serial}</div>
                        <div className="text-xs text-slate-500">{r.booking.battery.model}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{getStatusBadge(r.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {r.status === 'completed' ? (
                          <button
                            className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleClose(r._id)}
                          >
                            Close
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">No actions</span>
                        )}
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
