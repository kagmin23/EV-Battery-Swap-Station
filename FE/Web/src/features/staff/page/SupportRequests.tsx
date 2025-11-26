import { useEffect, useMemo, useState } from 'react';
import { Search, Inbox, ShieldCheck, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  const statusClasses: Record<string, string> = {
    'in-progress': 'bg-amber-50 text-amber-700',
    resolved: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    closed: 'bg-slate-100 text-slate-600',
  };

  const statusCards = useMemo(() => {
    const total = requests.length;
    const active = requests.filter(r => r.status === 'in-progress').length;
    const completed = requests.filter(r => r.status === 'completed' || r.status === 'closed').length;
    const resolved = requests.filter(r => r.status === 'resolved').length;
    return { total, active, completed, resolved };
  }, [requests]);

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
      <div className="min-h-screen p-6">
        <div className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <TableSkeleton rows={10} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f4f5ff] via-white to-white p-6">
        <Card className="max-w-lg border-0 bg-white shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold text-slate-900">Data Loading Error</p>
            <p className="mt-2 text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6 space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Support operations</p>
        <h1 className="text-3xl font-bold text-slate-900">Support Requests</h1>
        <p className="text-slate-600">Monitor customer support tickets for your station.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Total requests</p>
              <p className="text-2xl font-bold text-slate-900">{statusCards.total}</p>
              <p className="text-xs text-slate-500">Overall tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-900">{statusCards.active}</p>
              <p className="text-xs text-slate-500">In progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Resolved</p>
              <p className="text-2xl font-bold text-slate-900">{statusCards.resolved}</p>
              <p className="text-xs text-slate-500">Awaiting confirmation</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Closed</p>
              <p className="text-2xl font-bold text-slate-900">{statusCards.completed}</p>
              <p className="text-xs text-slate-500">Completed or closed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">Search requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by title, booking date, battery serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-slate-200 pl-10 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-lg">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-xl text-slate-900">Tickets list</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Booking Date</th>
                  <th className="px-6 py-4">Battery</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {current.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">No support requests found</td>
                  </tr>
                ) : (
                  current.map((r) => (
                    <tr key={r._id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-semibold text-slate-900">{r.title}</td>
                      <td className="px-6 py-4">{new Date(r.booking.scheduledTime).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{r.booking.battery.serial}</div>
                        <div className="text-xs text-slate-500">{r.booking.battery.model}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[r.status] || 'bg-slate-100 text-slate-600'}`}>
                          {r.status === 'in-progress' ? 'In Progress' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.status === 'completed' ? (
                          <button
                            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                            onClick={() => handleClose(r._id)}
                          >
                            Close
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">No actions</span>
                        )}
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
