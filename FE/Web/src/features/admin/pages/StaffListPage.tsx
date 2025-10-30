import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid, List, Users, Clock, Activity, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { StaffSearchBar } from '../components/StaffSearchBar';
import { StaffCard } from '../components/StaffCard';
import { StaffTable } from '../components/StaffTable';
import { StaffModal } from '../components/StaffModal';
import { StaffDetailModal } from '../components/StaffDetailModal';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { StaffService, type CreateStaffRequest, type UpdateStaffRequest as ApiUpdateStaffRequest, type Staff as ApiStaff } from '@/services/api/staffService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import type { Staff, StaffFilters, AddStaffRequest, UpdateStaffRequest, Station, StaffStatus } from '../types/staff';

// Mock data removed - now using API data

interface StaffListPageProps {
    onStaffSelect?: (staff: Staff) => void;
}

export const StaffListPage: React.FC<StaffListPageProps> = ({ onStaffSelect }) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [filters, setFilters] = useState<StaffFilters>({
        search: '',
        stationId: 'ALL',
        role: 'ALL',
        status: 'ALL',
        limit: '20',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [suspendingStaffId, setSuspendingStaffId] = useState<string | null>(null);
    const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
    const [savingStaffId, setSavingStaffId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [suspendAction, setSuspendAction] = useState<'lock' | 'activate'>('lock');
    const [suspendTargetName, setSuspendTargetName] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [suspendingStaff, setSuspendingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState<string>('');

    // Load stations data from API
    const loadStations = async () => {
        try {
            const apiStations = await StationService.getAllStations();

            // Convert API stations to UI station format
            const convertedStations: Station[] = apiStations.map((apiStation: ApiStation) => ({
                id: apiStation._id,
                name: apiStation.stationName,
                address: apiStation.address,
                city: apiStation.city,
                coordinates: {
                    lat: apiStation.location.coordinates[1],
                    lng: apiStation.location.coordinates[0],
                },
                totalSlots: apiStation.capacity,
                availableSlots: apiStation.availableBatteries,
                status: 'ACTIVE' as const,
            }));

            setStations(convertedStations);
        } catch (err) {
            console.error('Error loading stations:', err);
            // Set default station if API fails
            setStations([{
                id: 'default',
                name: 'Chưa phân trạm',
                address: 'Chưa xác định',
                city: 'Chưa xác định',
                coordinates: { lat: 0, lng: 0 },
                totalSlots: 0,
                availableSlots: 0,
                status: 'ACTIVE' as const,
            }]);
        }
    };

    // Load staff data from API
    const loadStaff = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const apiStaff = await StaffService.getAllStaff();

            // Convert API staff to UI staff format
            const convertedStaff: Staff[] = apiStaff.map((apiStaffMember: ApiStaff) => {
                // Find station info from stations or use default
                const defaultStation = {
                    id: 'default',
                    name: 'Chưa phân trạm',
                    address: 'Chưa xác định',
                    city: 'Chưa xác định',
                    coordinates: { lat: 0, lng: 0 },
                    totalSlots: 0,
                    availableSlots: 0,
                    status: 'ACTIVE' as const,
                };

                // Handle station - can be string ID or populated object
                let stationInfo: Station = defaultStation;
                if (apiStaffMember.station) {
                    const stationId = typeof apiStaffMember.station === 'string'
                        ? apiStaffMember.station
                        : (apiStaffMember.station as any)._id;
                    const foundStation = stations.find(s => s.id === stationId);
                    if (foundStation) {
                        stationInfo = foundStation;
                    }
                }

                return {
                    id: apiStaffMember._id,
                    name: apiStaffMember.fullName || 'N/A',
                    email: apiStaffMember.email || 'N/A',
                    phone: apiStaffMember.phoneNumber || 'N/A',
                    role: 'STAFF' as const,
                    stationId: stationInfo.id,
                    stationName: stationInfo.name,
                    status: apiStaffMember.status === 'active' ? 'ONLINE' : 'OFFLINE',
                    permissions: [],
                    createdAt: new Date(apiStaffMember.createdAt),
                    updatedAt: new Date(apiStaffMember.updatedAt),
                };
            });

            setStaff(convertedStaff);
            // Success message removed to avoid notification spam
        } catch (err) {
            setError('Unable to load staff list. Please try again later.');
            console.error('Error loading staff:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            await loadStations();
            // loadStaff will be called by the stations useEffect
        };
        loadData();
    }, []);

    // Reload staff when stations change
    useEffect(() => {
        if (stations.length > 0) {
            loadStaff();
        }
    }, [stations]);

    const filteredStaff = staff.filter((staffMember) => {
        const matchesSearch = filters.search === '' ||
            staffMember.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            staffMember.email.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStation = filters.stationId === 'ALL' || staffMember.stationId === filters.stationId;
        const matchesRole = filters.role === 'ALL' || staffMember.role === filters.role;
        const matchesStatus = filters.status === 'ALL' || staffMember.status === filters.status;

        return matchesSearch && matchesStation && matchesRole && matchesStatus;
    });

    // Calculate pagination
    const limitNum = Number(filters.limit) || 20;
    const totalPages = Math.ceil(filteredStaff.length / limitNum);
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * limitNum,
        currentPage * limitNum
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.stationId, filters.role, filters.status, filters.limit]);

    const handleStaffEdit = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleStaffSuspend = (staffMember: Staff) => {
        setSuspendingStaff(staffMember);
        const isCurrentlyActive = staffMember.status === 'ONLINE' || staffMember.status === 'SHIFT_ACTIVE' || staffMember.status === 'active';
        setSuspendAction(isCurrentlyActive ? 'lock' : 'activate');
        setSuspendTargetName(staffMember.name || '');
        setIsConfirmationModalOpen(true);
    };

    const handleStaffDelete = (staffMember: Staff) => {
        setDeletingStaff(staffMember);
        setDeleteTargetName(staffMember.name || '');
        setIsDeleteModalOpen(true);
    };

    const handleConfirmSuspend = async () => {
        if (!suspendingStaff) return;

        try {
            setSuspendingStaffId(suspendingStaff.id);
            // Determine new status: if staff is active/locked -> lock them, if locked -> activate them
            const isCurrentlyActive = suspendingStaff.status === 'ONLINE' || suspendingStaff.status === 'SHIFT_ACTIVE' || suspendingStaff.status === 'active';
            const newStatus = isCurrentlyActive ? 'locked' : 'active';

            await StaffService.changeStaffStatus(suspendingStaff.id, newStatus);

            // Update local state - map to UI status format
            const newUISatus: StaffStatus = newStatus === 'active' ? 'ONLINE' : 'locked';
            setStaff(prev => prev.map(s =>
                s.id === suspendingStaff.id
                    ? {
                        ...s,
                        status: newUISatus,
                        updatedAt: new Date()
                    }
                    : s
            ));

            toast.success(
                newStatus === 'active'
                    ? `Staff member "${suspendingStaff.name}" activated successfully`
                    : `Staff member "${suspendingStaff.name}" locked successfully`
            );
        } catch (err) {
            toast.error('Unable to change staff status. Please try again.');
            console.error('Error changing staff status:', err);
        } finally {
            setSuspendingStaffId(null);
            setIsConfirmationModalOpen(false);
            setSuspendingStaff(null);
        }
    };

    const handleCancelSuspend = () => {
        // Close modal only; keep suspendingStaff until fully closed to avoid flicker/opposite state during fade-out
        setIsConfirmationModalOpen(false);
    };

    const handleCancelDelete = () => {
        // Close modal only; keep deletingStaff to prevent content flicker during closing animation
        setIsDeleteModalOpen(false);
    };

    const handleAddStaff = () => {
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const handleViewStaffDetails = (staffMember: Staff) => {
        setSelectedStaff(staffMember);
        setIsDetailModalOpen(true);
    };

    const handleResetFilters = async () => {
        setIsResetting(true);
        setFilters({
            search: '',
            stationId: 'ALL',
            role: 'ALL',
            status: 'ALL',
            limit: '20',
        });
        setCurrentPage(1);
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsResetting(false);
    };

    const handleSaveStaff = async (data: AddStaffRequest | UpdateStaffRequest): Promise<void> => {
        try {
            setSavingStaffId('id' in data ? data.id as string : 'new');
            // setError(null); // Remove global error

            if ('id' in data) {
                // Update existing staff
                const updateData: ApiUpdateStaffRequest = {
                    fullName: data.name || '',
                    email: data.email || '',
                    phoneNumber: data.phone || '',
                    password: (data as any).password,
                    stationId: (data as UpdateStaffRequest).stationId,
                };

                const updatedStaff = await StaffService.updateStaff(data.id as string, updateData);

                // Convert API response to UI format
                const convertedStaff: Staff = {
                    id: updatedStaff._id,
                    name: updatedStaff.fullName || 'N/A',
                    email: updatedStaff.email || 'N/A',
                    phone: updatedStaff.phoneNumber || 'N/A',
                    role: 'STAFF' as const,
                    stationId: (data as UpdateStaffRequest).stationId || '1',
                    stationName: stations.find(s => s.id === (data as UpdateStaffRequest).stationId)?.name || '',
                    status: updatedStaff.status === 'active' ? 'ONLINE' : 'OFFLINE',
                    permissions: [],
                    createdAt: new Date(updatedStaff.createdAt),
                    updatedAt: new Date(updatedStaff.updatedAt),
                };

                setStaff(prev => prev.map(s => s.id === data.id ? convertedStaff : s));
                toast.success(`Staff member "${convertedStaff.name}" updated successfully`);
            } else {
                // Add new staff
                const createData: CreateStaffRequest = {
                    fullName: data.name || '',
                    email: data.email || '',
                    phoneNumber: data.phone || '',
                    password: (data as any).password,
                    stationId: (data as AddStaffRequest).stationId,
                };

                const newStaff = await StaffService.createStaff(createData);

                // Convert API response to UI format
                const convertedStaff: Staff = {
                    id: newStaff._id,
                    name: newStaff.fullName || 'N/A',
                    email: newStaff.email || 'N/A',
                    phone: newStaff.phoneNumber || 'N/A',
                    role: 'STAFF' as const,
                    stationId: (data as AddStaffRequest).stationId,
                    stationName: stations.find(s => s.id === (data as AddStaffRequest).stationId)?.name || '',
                    status: newStaff.status === 'active' ? 'ONLINE' : 'OFFLINE',
                    permissions: [],
                    createdAt: new Date(newStaff.createdAt),
                    updatedAt: new Date(newStaff.updatedAt),
                };

                setStaff(prev => [...prev, convertedStaff]);
                toast.success(`Staff member "${convertedStaff.name}" added successfully`);
            }

            setIsModalOpen(false);
            setEditingStaff(null);
        } catch (err) {
            // Global error removed: let modal/ui handle
            // const errorMessage = err instanceof Error ? err.message : 'Error saving staff information';
            // setError(errorMessage);
            // console.error('Error saving staff:', err);
            throw err;
        } finally {
            setSavingStaffId(null);
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Staff List"
                description="Manage staff information"
            />

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-sm"
                    >
                        Close
                    </Button>
                </div>
            )}

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Staff"
                    value={staff.length}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Active"
                    value={staff.filter(s => s.status === 'active' || s.status === 'ONLINE').length}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Locked"
                    value={staff.filter(s => s.status === 'locked' || s.status === 'SUSPENDED').length}
                    icon={Clock}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <StaffSearchBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    stations={stations}
                    isResetting={isResetting}
                    onResetFilters={handleResetFilters}
                />
            </div>

            {/* Staff List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            Staff List
                            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {filteredStaff.length}
                            </span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl border-blue-600 hover:border-blue-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'table'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl border-blue-600 hover:border-blue-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleAddStaff}
                                disabled={savingStaffId === 'new'}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700"
                            >
                                {savingStaffId === 'new' ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Adding..." />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Staff
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Loading staff list..." />
                    ) : filteredStaff.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No staff found</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.stationId !== 'ALL' || filters.role !== 'ALL' || filters.status !== 'ALL'
                                    ? 'No staff found matching the current filters.'
                                    : 'No staff has been added to the system yet.'}
                            </p>
                            {(!filters.search && filters.stationId === 'ALL' && filters.role === 'ALL' && filters.status === 'ALL') && (
                                <Button
                                    onClick={handleAddStaff}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Staff
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedStaff.map((staffMember) => (
                                <StaffCard
                                    key={staffMember.id}
                                    staff={staffMember}
                                    onSelect={onStaffSelect || (() => { })}
                                    onEdit={handleStaffEdit}
                                    onSuspend={handleStaffSuspend}
                                    onDelete={handleStaffDelete}
                                    onViewDetails={handleViewStaffDetails}
                                    isSuspending={suspendingStaffId === staffMember.id}
                                    isSaving={savingStaffId === staffMember.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <StaffTable
                                staff={paginatedStaff}
                                onSelect={onStaffSelect || (() => { })}
                                onEdit={handleStaffEdit}
                                onSuspend={handleStaffSuspend}
                                onDelete={handleStaffDelete}
                                onViewDetails={handleViewStaffDetails}
                                suspendingStaffId={suspendingStaffId}
                                savingStaffId={savingStaffId}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && filteredStaff.length > 0 && (
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
                                            <button
                                                key={totalPages}
                                                type="button"
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === totalPages
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                                    }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                            } else if (currentPage >= totalPages - 2) {
                                if (i === 0) {
                                    return (
                                        <React.Fragment key={`fragment-start-${i}`}>
                                            <button
                                                key={1}
                                                type="button"
                                                onClick={() => setCurrentPage(1)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === 1
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
                                                onClick={() => setCurrentPage(1)}
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
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                {totalPages}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                                pageNum = currentPage + i - 2;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === pageNum
                                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                        }`}
                                    aria-current={currentPage === pageNum ? "page" : undefined}
                                >
                                    {pageNum}
                                </button>
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

                    {/* Items info */}
                    <div className="text-sm text-gray-800">
                        Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * limitNum + 1}</span> to{" "}
                        <span className="font-semibold text-slate-900">{Math.min(currentPage * limitNum, filteredStaff.length)}</span> of{" "}
                        <span className="font-semibold text-slate-900">{filteredStaff.length}</span> results
                    </div>
                </div>
            )}

            {/* Staff Modal */}
            <StaffModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingStaff(null);
                }}
                onSave={handleSaveStaff}
                staff={editingStaff}
                stations={stations}
                isSaving={!!savingStaffId}
            />

            {/* Staff Detail Modal */}
            <StaffDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedStaff(null);
                }}
                staff={selectedStaff}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleCancelSuspend}
                onConfirm={handleConfirmSuspend}
                title={`Confirm ${suspendAction} staff`}
                message={<div>Are you sure you want to {suspendAction} staff <span className="font-bold text-slate-800">{suspendTargetName}</span>?</div>}
                confirmText={suspendAction === 'lock' ? 'Lock' : 'Activate'}
                type="delete"
                isLoading={suspendingStaffId === suspendingStaff?.id}
            />

            {/* Delete Staff Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={async () => {
                    if (!deletingStaff) return;
                    try {
                        setDeletingStaffId(deletingStaff.id);
                        await StaffService.deleteStaff(deletingStaff.id);
                        setStaff(prev => prev.filter(s => s.id !== deletingStaff.id));
                        toast.success(`Staff "${deletingStaff.name}" deleted`);
                    } catch (err) {
                        toast.error('Unable to delete staff. Please try again.');
                        console.error('Error deleting staff:', err);
                    } finally {
                        setDeletingStaffId(null);
                        setIsDeleteModalOpen(false);
                        setDeletingStaff(null);
                    }
                }}
                title="Confirm delete staff"
                message={<div>Are you sure you want to delete staff <span className="font-bold text-slate-800">{deleteTargetName}</span>? This action cannot be undone.</div>}
                confirmText="Delete"
                type="delete"
                isLoading={deletingStaffId === deletingStaff?.id}
            />
        </div>
    );
};
