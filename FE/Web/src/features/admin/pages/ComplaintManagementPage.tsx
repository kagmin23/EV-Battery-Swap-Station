import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/text-area';
import {
    Search,
    AlertCircle,
    CheckCircle,
    Clock,
    MessageSquareText,
    RefreshCw,
    CheckCheck,
    X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminService, type Complaint } from '@/services/api/adminService';

export const ComplaintManagementPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [responseText, setResponseText] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await AdminService.getAllComplaints();
            setComplaints(data);
            toast.success('Successfully loaded complaints list');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error loading complaints list';
            setError(errorMessage);
            console.error('Error loading complaints:', err);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadComplaints();
    }, []);

    // Filter complaints
    useEffect(() => {
        let filtered = complaints;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(complaint =>
                complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.userId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(complaint => complaint.status === statusFilter);
        }

        setFilteredComplaints(filtered);
    }, [complaints, searchTerm, statusFilter]);

    const handleOpenResolveModal = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setResponseText(complaint.response || '');
        setIsResolveModalOpen(true);
    };

    const handleResolveComplaint = async () => {
        if (!selectedComplaint || !responseText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        try {
            setIsResolving(true);
            await AdminService.resolveComplaint(selectedComplaint._id, responseText);

            // Update local state
            setComplaints(prev => prev.map(c =>
                c._id === selectedComplaint._id
                    ? { ...c, status: 'resolved' as const, response: responseText }
                    : c
            ));

            toast.success('Successfully resolved complaint');
            setIsResolveModalOpen(false);
            setSelectedComplaint(null);
            setResponseText('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error resolving complaint';
            toast.error(errorMessage);
            console.error('Error resolving complaint:', err);
        } finally {
            setIsResolving(false);
        }
    };

    const handleCloseModal = () => {
        setIsResolveModalOpen(false);
        setSelectedComplaint(null);
        setResponseText('');
    };

    const getStatusBadge = (status: string) => {
        if (status === 'resolved') {
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Resolved</Badge>;
        }
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Pending</Badge>;
    };

    const getStatusIcon = (status: string) => {
        if (status === 'resolved') {
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        }
        return <Clock className="h-5 w-5 text-yellow-600" />;
    };

    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

    if (isLoading) {
        return <PageLoadingSpinner text="Loading complaints list..." />;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600">{error}</span>
                    </div>
                    <Button onClick={loadComplaints} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Complaint Management</h1>
                    <p className="text-slate-600 mt-2">Manage and handle customer complaints</p>
                </div>
                <Button onClick={loadComplaints} className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Total Complaints</CardTitle>
                            <MessageSquareText className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{complaints.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-900">{pendingCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-700 text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{resolvedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
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
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <Input
                                placeholder="Search by description, category, user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                className="h-12"
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('pending')}
                                className="h-12"
                            >
                                Pending
                            </Button>
                            <Button
                                variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('resolved')}
                                className="h-12"
                            >
                                Resolved
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Complaints List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-blue-100 rounded-xl mr-3">
                            <MessageSquareText className="h-6 w-6 text-blue-600" />
                        </div>
                        Complaints List
                        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {filteredComplaints.length}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <MessageSquareText className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No complaints found</h3>
                            <p className="text-slate-600">No complaints found matching the filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredComplaints.map((complaint) => (
                                <Card key={complaint._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {getStatusIcon(complaint.status)}
                                                    <span className="font-semibold text-slate-900">User: {complaint.userId}</span>
                                                    {getStatusBadge(complaint.status)}
                                                    <span className="text-sm text-slate-500">Category: {complaint.category}</span>
                                                </div>
                                                <p className="text-slate-700 mb-3">{complaint.description}</p>
                                                {complaint.response && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <p className="text-sm text-green-900 font-medium mb-1">Response:</p>
                                                        <p className="text-sm text-green-700">{complaint.response}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-500">
                                                    Created: {new Date(complaint.createdAt).toLocaleString('en-US')}
                                                </p>
                                            </div>
                                            {complaint.status === 'pending' && (
                                                <Button
                                                    onClick={() => handleOpenResolveModal(complaint)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCheck className="h-4 w-4 mr-2" />
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resolve Complaint Modal */}
            <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Resolve Complaint</DialogTitle>
                        <DialogDescription>
                            Enter response for the customer complaint
                        </DialogDescription>
                    </DialogHeader>

                    {selectedComplaint && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Complaint Description:</p>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedComplaint.description}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Response:</p>
                                <Textarea
                                    placeholder="Enter your response..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isResolving}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResolveComplaint}
                            disabled={isResolving}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isResolving ? (
                                <>
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Resolving..." />
                                </>
                            ) : (
                                <>
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Resolve
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

