import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronLeft, ChevronRight, LifeBuoy, RotateCcw, Search, Clock, CheckCircle2, BadgeCheck, XCircle } from 'lucide-react';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '../components/PageHeader';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { StatsCard } from '../components/StatsCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import SupportService from '@/services/api/supportService';
import type { SupportRequestItem, SupportRequestStatus } from '@/services/api/supportService';

const STATUSES: Array<{ label: string; value: 'ALL' | SupportRequestStatus }> = [
  { label: 'All status', value: 'ALL' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Completed', value: 'completed' },
  { label: 'Closed', value: 'closed' },
];

export const SupportRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SupportRequestItem[]>([]);
  const [status, setStatus] = useState<'ALL' | SupportRequestStatus>('ALL');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'resolve' | 'close' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<SupportRequestItem | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupportService.getAdminSupportRequests(status === 'ALL' ? undefined : status);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Unable to load support requests');
    } finally {
      setLoading(false);
    }
  };
  const openConfirm = (action: 'resolve' | 'close', id: string) => {
    setConfirmAction(action);
    setTargetId(id);
    setNote('');
    setIsConfirmOpen(true);
  };

  const executeAction = async () => {
    if (!confirmAction || !targetId) return;
    try {
      setActionLoading(true);
      if (confirmAction === 'resolve') {
        const updated = await SupportService.resolveRequest(targetId, note || undefined);
        setItems(prev => prev.map(it => it._id === targetId ? updated : it));
      } else {
        if (!note.trim()) { setActionLoading(false); return; }
        const updated = await SupportService.closeRequest(targetId, note.trim());
        setItems(prev => prev.map(it => it._id === targetId ? updated : it));
      }
      setIsConfirmOpen(false);
      setConfirmAction(null);
      setTargetId(null);
      setNote('');
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };


  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // filter client-side by search (title, user, bookingId)
  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((it) =>
      (it.title || '').toLowerCase().includes(q) ||
      (it.user?.fullName || '').toLowerCase().includes(q) ||
      (it.user?.email || '').toLowerCase().includes(q) ||
      (it.booking?.bookingId || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const limitNum = Number(limit) || 20;
  const totalPages = Math.ceil(filtered.length / limitNum) || 1;
  const paginated = filtered.slice((currentPage - 1) * limitNum, currentPage * limitNum);

  useEffect(() => { setCurrentPage(1); }, [search, status, limit]);

  // Stats
  const total = items.length;
  const inProgress = items.filter(i => i.status === 'in-progress').length;
  const resolved = items.filter(i => i.status === 'resolved').length;
  const completed = items.filter(i => i.status === 'completed').length;
  const closed = items.filter(i => i.status === 'closed').length;

  return (
    <div className="p-6 space-y-8">
      <PageHeader title="Support Requests" description="View and manage support tickets from users" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard title="Total" value={total} icon={LifeBuoy} gradientFrom="from-blue-50" gradientTo="to-blue-100/50" textColor="text-blue-900" iconBg="bg-blue-500" />
        <StatsCard title="In Progress" value={inProgress} icon={Clock} gradientFrom="from-amber-50" gradientTo="to-amber-100/50" textColor="text-amber-900" iconBg="bg-amber-500" />
        <StatsCard title="Resolved" value={resolved} icon={CheckCircle2} gradientFrom="from-emerald-50" gradientTo="to-emerald-100/50" textColor="text-emerald-900" iconBg="bg-emerald-500" />
        <StatsCard title="Completed" value={completed} icon={BadgeCheck} gradientFrom="from-indigo-50" gradientTo="to-indigo-100/50" textColor="text-indigo-900" iconBg="bg-indigo-500" />
        <StatsCard title="Closed" value={closed} icon={XCircle} gradientFrom="from-slate-50" gradientTo="to-slate-100/50" textColor="text-slate-900" iconBg="bg-slate-500" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setError(null)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300">Close</Button>
        </div>
      )}

      {/* Search & Filters (matches StaffSearchBar style) */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Search & Filter</h3>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, user, bookingId"
                className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="w-full sm:w-[220px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto">
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value as string}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="w-full sm:w-[120px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={async () => { setIsResetting(true); setSearch(''); setStatus('ALL'); setLimit('20'); setCurrentPage(1); await new Promise(r => setTimeout(r, 200)); setIsResetting(false); }}
                disabled={isResetting}
                className="h-12 px-4 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl font-bold text-slate-800">
              <div className="p-2 bg-blue-100 rounded-xl mr-3">
                <LifeBuoy className="h-6 w-6 text-blue-600" />
              </div>
              Support Requests
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{filtered.length}</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <PageLoadingSpinner text="Loading support requests..." />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LifeBuoy className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600 text-center">Try changing status or search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((it) => {
                const created = it.createdAt ? new Date(it.createdAt) : null;
                const statusStyle =
                  it.status === 'in-progress'
                    ? 'text-amber-700 border-amber-200 bg-amber-50'
                    : it.status === 'resolved'
                    ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                    : it.status === 'completed'
                    ? 'text-indigo-700 border-indigo-200 bg-indigo-50'
                    : 'text-slate-700 border-slate-200 bg-slate-50';
                return (
                  <div key={it._id} className="relative border border-slate-200 rounded-2xl p-5 bg-white/95 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl cursor-pointer" onClick={() => { setSelected(it); setDetailOpen(true); }}>
                    {/* top-right chips: status and resolved-by */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {it.resolvedBy?.fullName && (
                        <span className="px-2 py-0.5 text-xs rounded-full border border-violet-200 bg-violet-50 text-violet-700">Resolved by {it.resolvedBy.fullName}</span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full border capitalize ${statusStyle}`}>{it.status}</span>
                    </div>
                    <div className="flex items-center gap-2 pr-28">
                      <LifeBuoy className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-slate-900 truncate">{it.title}</h4>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>Booking: <span className="font-medium text-slate-800">{it.booking?.bookingId}</span></span>
                      <span>Requester: <span className="font-medium text-slate-800">{it.user?.fullName || 'N/A'}</span></span>
                      {created && <span>Created: <span className="font-medium text-slate-800">{created.toLocaleString()}</span></span>}
                      {/* resolved by moved to top-right with status */}
                    </div>
                    {it.description && (
                      <div className="mt-3 text-slate-700 text-sm leading-relaxed line-clamp-3">{it.description}</div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {it.images && it.images.length > 0 && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{it.images.length} image{it.images.length > 1 ? 's' : ''}</span>
                        )}
                        {it.resolveNote && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Resolve note available</span>
                        )}
                        {it.closeNote && (
                          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">Closed note available</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {it.status === 'in-progress' && user?.role === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirm('resolve', it._id)}
                            className="rounded-md border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                          >
                            Resolve
                          </Button>
                        )}
                        {it.status === 'completed' && (user?.role === 'admin' || user?.role === 'staff') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirm('close', it._id)}
                            className="rounded-md border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal for resolve/close */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeAction}
        title={confirmAction === 'resolve' ? 'Confirm resolve request' : 'Confirm close request'}
        message={
          <div className="w-full">
            <div className="text-sm text-slate-700 mb-2">
              {confirmAction === 'resolve' ? 'Optional note (visible to driver):' : 'Close note (required):'}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[90px] rounded-lg border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={confirmAction === 'resolve' ? 'Enter resolve note (optional)' : 'Enter close note (required)'}
            />
          </div>
        }
        confirmText={confirmAction === 'resolve' ? 'Resolve' : 'Close'}
        type={confirmAction === 'close' ? 'delete' : 'edit'}
        isLoading={actionLoading}
      />

      {/* Detail modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl bg-white">
          {selected && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-blue-100">
                    <LifeBuoy className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-slate-900">Support Request Details</h2>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">{selected.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 text-sm rounded-lg border bg-slate-50 border-slate-200 capitalize text-slate-700">{selected.status}</span>
                      {selected.resolvedBy?.fullName && (
                        <span className="px-3 py-1 text-sm rounded-lg border border-violet-200 bg-violet-50 text-violet-700">Resolved by {selected.resolvedBy.fullName}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Information cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-slate-500 text-sm">Booking</div>
                  <div className="font-semibold text-slate-900 break-all">{selected.booking?.bookingId}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-slate-500 text-sm">User</div>
                  <div className="font-semibold text-slate-900">{selected.user?.fullName} <span className="text-slate-400">({selected.user?.email})</span></div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-slate-500 text-sm">Created</div>
                  <div className="font-semibold text-slate-900">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-slate-700 font-semibold mb-2">Description</div>
                  <div className="text-slate-800 leading-relaxed">{selected.description}</div>
                </div>
              )}

              {/* Images */}
              {selected.images && selected.images.length > 0 && (
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-slate-700 font-semibold mb-3">Images</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selected.images.map((url) => (
                      <img key={url} src={url} alt="support" className="w-full h-28 object-cover rounded-xl border" />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.resolveNote && (
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-violet-800">
                  <div className="font-semibold mb-1">Resolve Note</div>
                  <div className="leading-relaxed">{selected.resolveNote}</div>
                </div>
              )}
              {selected.closeNote && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-800">
                  <div className="font-semibold mb-1">Close Note</div>
                  <div className="leading-relaxed">{selected.closeNote}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination like StaffList */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col items-center py-4 gap-3">
          <nav className="flex items-center -space-x-px" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || totalPages === 1}
              className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-s-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:block">Previous</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i === 4 ? totalPages : i + 1;
                if (i === 3 && totalPages > 5) {
                  return (
                    <React.Fragment key={`fragment-${i}`}>
                      <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                      <button key={totalPages} type="button" onClick={() => setCurrentPage(totalPages)} className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === totalPages ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'}`}>{totalPages}</button>
                    </React.Fragment>
                  );
                }
              } else if (currentPage >= totalPages - 2) {
                if (i === 0) {
                  return (
                    <React.Fragment key={`fragment-start-${i}`}>
                      <button key={1} type="button" onClick={() => setCurrentPage(1)} className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === 1 ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'}`}>1</button>
                      <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                    </React.Fragment>
                  );
                }
                pageNum = totalPages - 4 + i;
              } else {
                if (i === 0) {
                  return (
                    <React.Fragment key={`fragment-mid-start`}>
                      <button key={1} type="button" onClick={() => setCurrentPage(1)} className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">1</button>
                      <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                    </React.Fragment>
                  );
                } else if (i === 4) {
                  return (
                    <React.Fragment key={`fragment-mid-end`}>
                      <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                      <button key={totalPages} type="button" onClick={() => setCurrentPage(totalPages)} className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">{totalPages}</button>
                    </React.Fragment>
                  );
                }
                pageNum = currentPage + i - 2;
              }
              return (
                <button key={pageNum} type="button" onClick={() => setCurrentPage(pageNum!)} className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'}`} aria-current={currentPage === pageNum ? 'page' : undefined}>{pageNum}</button>
              );
            })}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 1}
              className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-e-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next"
            >
              <span className="hidden sm:block">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
          <div className="text-sm text-gray-800">
            Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * limitNum + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(currentPage * limitNum, filtered.length)}</span> of{' '}
            <span className="font-semibold text-slate-900">{filtered.length}</span> results
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportRequestsPage;


