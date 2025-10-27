import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid, List, Users, Clock, Activity, AlertCircle } from 'lucide-react';
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
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [suspendingStaffId, setSuspendingStaffId] = useState<string | null>(null);
    const [savingStaffId, setSavingStaffId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [suspendingStaff, setSuspendingStaff] = useState<Staff | null>(null);

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
                    lastActive: new Date(apiStaffMember.updatedAt),
                    createdAt: new Date(apiStaffMember.createdAt),
                    updatedAt: new Date(apiStaffMember.updatedAt),
                };
            });

            setStaff(convertedStaff);
            toast.success('Tải danh sách nhân viên thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách nhân viên';
            setError(errorMessage);
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

    const handleStaffEdit = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleStaffSuspend = (staffMember: Staff) => {
        setSuspendingStaff(staffMember);
        setIsConfirmationModalOpen(true);
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
                    ? `Đã kích hoạt nhân viên ${suspendingStaff.name}`
                    : `Đã tạm khóa nhân viên ${suspendingStaff.name}`
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thay đổi trạng thái nhân viên';
            setError(errorMessage);
            console.error('Error changing staff status:', err);
        } finally {
            setSuspendingStaffId(null);
            setIsConfirmationModalOpen(false);
            setSuspendingStaff(null);
        }
    };

    const handleCancelSuspend = () => {
        setIsConfirmationModalOpen(false);
        setSuspendingStaff(null);
    };

    const handleAddStaff = () => {
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const handleViewStaffDetails = (staffMember: Staff) => {
        setSelectedStaff(staffMember);
        setIsDetailModalOpen(true);
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            stationId: 'ALL',
            role: 'ALL',
            status: 'ALL',
        });
    };

    const handleSaveStaff = async (data: AddStaffRequest | UpdateStaffRequest): Promise<void> => {
        try {
            setSavingStaffId('id' in data ? data.id as string : 'new');
            setError(null);

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
                    lastActive: new Date(updatedStaff.updatedAt),
                    createdAt: new Date(updatedStaff.createdAt),
                    updatedAt: new Date(updatedStaff.updatedAt),
                };

                setStaff(prev => prev.map(s => s.id === data.id ? convertedStaff : s));
                toast.success(`Đã cập nhật thông tin nhân viên ${convertedStaff.name}`);
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
                    lastActive: new Date(newStaff.createdAt),
                    createdAt: new Date(newStaff.createdAt),
                    updatedAt: new Date(newStaff.updatedAt),
                };

                setStaff(prev => [...prev, convertedStaff]);
                toast.success(`Đã thêm nhân viên ${convertedStaff.name} thành công`);
            }

            setIsModalOpen(false);
            setEditingStaff(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu thông tin nhân viên';
            setError(errorMessage);
            console.error('Error saving staff:', err);
        } finally {
            setSavingStaffId(null);
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Danh sách nhân viên"
                description="Quản lý thông tin nhân viên trạm đổi pin"
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
                        Đóng
                    </Button>
                </div>
            )}

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Tổng nhân viên"
                    value={staff.length}
                    icon={Users}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Hoạt động"
                    value={staff.filter(s => s.status === 'active' || s.status === 'ONLINE').length}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Tạm khóa"
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
                            Danh sách nhân viên
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
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Đang thêm..." />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm nhân viên
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Đang tải danh sách nhân viên..." />
                    ) : filteredStaff.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Không có nhân viên nào</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.stationId !== 'ALL' || filters.role !== 'ALL' || filters.status !== 'ALL'
                                    ? 'Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.'
                                    : 'Chưa có nhân viên nào được thêm vào hệ thống.'}
                            </p>
                            {(!filters.search && filters.stationId === 'ALL' && filters.role === 'ALL' && filters.status === 'ALL') && (
                                <Button
                                    onClick={handleAddStaff}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm nhân viên đầu tiên
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStaff.map((staffMember) => (
                                <StaffCard
                                    key={staffMember.id}
                                    staff={staffMember}
                                    onSelect={onStaffSelect || (() => { })}
                                    onEdit={handleStaffEdit}
                                    onSuspend={handleStaffSuspend}
                                    onViewDetails={handleViewStaffDetails}
                                    isSuspending={suspendingStaffId === staffMember.id}
                                    isSaving={savingStaffId === staffMember.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <StaffTable
                                staff={filteredStaff}
                                onSelect={onStaffSelect || (() => { })}
                                onEdit={handleStaffEdit}
                                onSuspend={handleStaffSuspend}
                                onViewDetails={handleViewStaffDetails}
                                suspendingStaffId={suspendingStaffId}
                                savingStaffId={savingStaffId}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

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
                title={`Xác nhận ${suspendingStaff?.status === 'ONLINE' ? 'tạm khóa' : 'kích hoạt'} nhân viên`}
                message={
                    <div>
                        Bạn có chắc chắn muốn {suspendingStaff?.status === 'ONLINE' ? 'tạm khóa' : 'kích hoạt'} nhân viên <span className="font-bold text-slate-800">{suspendingStaff?.name}</span>?
                    </div>
                }
                confirmText={suspendingStaff?.status === 'ONLINE' ? 'Tạm khóa' : 'Kích hoạt'}
                type="delete"
                isLoading={suspendingStaffId === suspendingStaff?.id}
            />
        </div>
    );
};
