import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminService, type FeedbackItem } from '@/services/api/adminService';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Star, Users, MapPin, MessageSquareText, RotateCcw } from 'lucide-react';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { StatsCard } from '../components/StatsCard';
import { StationService } from '@/services/api/stationService';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const FeedbackManagementPage: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [stationId, setStationId] = useState<string>('ALL');
    const [limit, setLimit] = useState<string>('20');
    const [page, setPage] = useState<number>(1);
    const [isResetting, setIsResetting] = useState<boolean>(false);
    const [stations, setStations] = useState<{ id: string; name: string }[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); // only for loading feedbacks

    const load = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await AdminService.getFeedbacks({
                stationId: stationId !== 'ALL' ? stationId : undefined,
            });
            setFeedbacks(data);
        } catch (err) {
            console.error(err);
            setError('Unable to load feedbacks. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadStations = async () => {
            try {
                const apiStations = await StationService.getAllStations();
                const converted = apiStations.map((s: any) => ({ id: s._id, name: s.stationName }));
                setStations(converted);
            } catch (e) {
                setStations([]);
            }
        };
        loadStations();
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setPage(1);
    }, [stationId, limit]);

    // Auto apply filters like StaffSearchBar (no Apply button) – only when filters change
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stationId]);

    const filtered = useMemo(() => {
        if (!search) return feedbacks;
        const q = search.toLowerCase();
        return feedbacks.filter(f =>
            (f.user?.fullName || '').toLowerCase().includes(q) ||
            (f.user?.email || '').toLowerCase().includes(q) ||
            (f.booking?.station?.stationName || '').toLowerCase().includes(q) ||
            (f.comment || '').toLowerCase().includes(q)
        );
    }, [feedbacks, search]);

    const limitNum = Number(limit) || 20;
    const totalPages = Math.ceil(filtered.length / limitNum) || 1;
    const paginatedFeedbacks = filtered.slice((page - 1) * limitNum, page * limitNum);

    const overview = useMemo(() => {
        const total = feedbacks.length;
        const avg = total > 0 ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total) : 0;
        const uniqueUsers = new Set((feedbacks || []).map(f => f.user?._id)).size;
        const uniqueStations = new Set((feedbacks || []).map(f => f.booking?.station?._id)).size;
        return { total, avg: Number(avg.toFixed(2)), uniqueUsers, uniqueStations };
    }, [feedbacks]);

    // Keep the page chrome visible; loading spinner will appear inside the list only

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Feedback Management</h1>
                    <p className="text-slate-600 mt-2">Manage and view user feedbacks</p>
                </div>
                <Button onClick={load} className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>
            {/* Error: show only feedbacks load error, not as toast nor for delete. */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setError(null)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300">Close</Button>
                </div>
            )}

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Feedbacks" value={overview.total} icon={MessageSquareText} gradientFrom="from-blue-50" gradientTo="to-blue-100/50" textColor="text-blue-900" iconBg="bg-blue-500" />
                <StatsCard title="Average Rating" value={overview.avg} icon={Star} gradientFrom="from-yellow-50" gradientTo="to-yellow-100/50" textColor="text-yellow-900" iconBg="bg-yellow-500" />
                <StatsCard title="Unique Users" value={overview.uniqueUsers} icon={Users} gradientFrom="from-emerald-50" gradientTo="to-emerald-100/50" textColor="text-emerald-900" iconBg="bg-emerald-500" />
                <StatsCard title="Stations Covered" value={overview.uniqueStations} icon={MapPin} gradientFrom="from-purple-50" gradientTo="to-purple-100/50" textColor="text-purple-900" iconBg="bg-purple-500" />
            </div>

            <Card className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
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
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user, station, comment" className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Station Dropdown like StaffSearchBar */}
                            <Select value={stationId} onValueChange={setStationId}>
                                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300">
                                    <SelectValue placeholder="Select station" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem value="ALL" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">All stations</SelectItem>
                                    {stations.map((s) => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={limit} onValueChange={setLimit}>
                                <SelectTrigger className="w-full sm:w-[120px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700"><SelectValue placeholder="Limit" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setIsResetting(true);
                                    setSearch('');
                                    setStationId('ALL');
                                    setLimit('20');
                                    setPage(1);
                                    await new Promise(r => setTimeout(r, 300));
                                    setIsResetting(false);
                                }}
                                disabled={isResetting}
                                className="h-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-slate-700 px-4 whitespace-nowrap"
                            >
                                {isResetting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                )}
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                        Feedback List
                        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{filtered.length}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {isLoading ? (
                        <PageLoadingSpinner text="Loading feedbacks..." />
                    ) : paginatedFeedbacks.map((fb) => (
                        <Card key={fb._id} className="hover:shadow-xl transition-transform duration-200 hover:scale-[1.01] border border-slate-200">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="font-semibold text-slate-900">
                                        {fb.user?.fullName || 'Unknown User'}
                                        <span className="text-slate-500 ml-2 text-sm">{fb.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                            disabled={!!deletingId}
                                            onClick={() => {
                                                setSelectedDeleteId(fb._id);
                                                setIsConfirmOpen(true);
                                            }}
                                        >
                                            {deletingId === fb._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Delete'
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {fb.comment && (
                                    <div className="bg-gradient-to-br from-green-50 to-green-100/40 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs uppercase tracking-wide text-green-700 font-semibold">Feedback</div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < (fb.rating || 0) ? '' : 'text-slate-300'}`} fill={i < (fb.rating || 0) ? 'currentColor' : 'none'} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-slate-900 font-medium leading-relaxed">{fb.comment}</div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
                                    <div>
                                        <div className="text-slate-500">Station</div>
                                        <div className="font-medium text-slate-900">{fb.booking?.station?.stationName || fb.booking?.station?._id}</div>
                                        {fb.booking?.station?.address && (
                                            <div className="text-slate-500">{fb.booking?.station?.address}</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Booking</div>
                                        <div className="font-medium text-slate-900">{fb.booking?._id}</div>
                                        <div className="text-slate-500">Battery</div>
                                        <div className="font-medium text-slate-900">{fb.booking?.battery?.serial || fb.booking?.battery?._id}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Created</div>
                                        <div className="font-medium text-slate-900">{new Date(fb.createdAt).toLocaleString('en-US')}</div>
                                    </div>
                                </div>

                                {fb.images && fb.images.length > 0 && (
                                    <div className="flex gap-3 flex-wrap">
                                        {fb.images.map((url) => (
                                            <img key={url} src={url} alt="feedback" className="w-28 h-28 object-cover rounded-lg border" />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {!isLoading && paginatedFeedbacks.length === 0 && (
                        <div className="text-center text-slate-600 py-10">No feedback found.</div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination like StaffListPage */}
            {!isLoading && filtered.length > 0 && (
                <div className="flex flex-col items-center py-4 gap-3">
                    <nav className="flex items-center -space-x-px" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-s-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:cursor-not-allowed transition-colors"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:block">Previous</span>
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i === 4 ? totalPages : i + 1;
                                if (i === 3 && totalPages > 5) {
                                    return (
                                        <React.Fragment key={`fragment-${i}`}>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                            <button
                                                key={totalPages}
                                                type="button"
                                                onClick={() => setPage(totalPages)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${page === totalPages
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                                    }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                            } else if (page >= totalPages - 2) {
                                if (i === 0) {
                                    return (
                                        <React.Fragment key={`fragment-start-${i}`}>
                                            <button
                                                key={1}
                                                type="button"
                                                onClick={() => setPage(1)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${page === 1
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                                    }`}
                                            >
                                                1
                                            </button>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                        </React.Fragment>
                                    );
                                }
                                pageNum = totalPages - 4 + i;
                            } else {
                                if (i === 0) {
                                    return (
                                        <React.Fragment key={`fragment-mid-start`}>
                                            <button
                                                key={1}
                                                type="button"
                                                onClick={() => setPage(1)}
                                                className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                1
                                            </button>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                        </React.Fragment>
                                    );
                                } else if (i === 4) {
                                    return (
                                        <React.Fragment key={`fragment-mid-end`}>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                            <button
                                                key={totalPages}
                                                type="button"
                                                onClick={() => setPage(totalPages)}
                                                className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                {totalPages}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                                pageNum = page + i - 2;
                            }

                            const allDisabled = totalPages === 1;
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setPage(pageNum)}
                                    disabled={allDisabled}
                                    className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                        (allDisabled || page === pageNum)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                    } disabled:hover:cursor-not-allowed`}
                                    aria-current={page === pageNum ? "page" : undefined}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-e-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:cursor-not-allowed transition-colors"
                            aria-label="Next"
                        >
                            <span className="hidden sm:block">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </nav>

                    {/* Items info */}
                    <div className="text-sm text-gray-800">
                        Showing <span className="font-semibold text-slate-900">{(page - 1) * limitNum + 1}</span> to{" "}
                        <span className="font-semibold text-slate-900">{Math.min(page * limitNum, filtered.length)}</span> of{" "}
                        <span className="font-semibold text-slate-900">{filtered.length}</span> results
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => { setIsConfirmOpen(false); setSelectedDeleteId(null); setSubmitError(null); }}
                onConfirm={async () => {
                    if (!selectedDeleteId) return;
                    setSubmitError(null);
                    try {
                        setDeletingId(selectedDeleteId);
                        await AdminService.deleteFeedback(selectedDeleteId);
                        setFeedbacks(prev => prev.filter(f => f._id !== selectedDeleteId));
                        setIsConfirmOpen(false);
                    } catch (e) {
                        const msg = e instanceof Error ? e.message : 'Failed to delete feedback';
                        setSubmitError(msg);
                    } finally {
                        setDeletingId(null);
                        setSelectedDeleteId(null);
                    }
                }}
                title="CONFIRM DELETE FEEDBACK"
                message={<div>Are you sure you want to delete this feedback? This action cannot be undone.{submitError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-3 mb-1 rounded-lg">
                        <AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" />
                        <span className="font-medium">{submitError}</span>
                    </div>
                )}</div>}
                confirmText="Delete"
                variant="delete"
                isLoading={!!deletingId}
            />
        </div>
    );
};

export default FeedbackManagementPage;



