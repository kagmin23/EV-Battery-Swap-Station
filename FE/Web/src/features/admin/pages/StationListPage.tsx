import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid, List, MapPin, Activity, AlertCircle, Battery, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { StationSearchBar } from '../components/StationSearchBar';
import { StationCard } from '../components/StationCard';
import { StationTable } from '../components/StationTable';
import { StationModal } from '../components/StationModal';
import { StationDetailModal } from '../components/StationDetailModal';
import { StationStaffModal } from '../components/StationStaffModal';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { StationService, type CreateStationRequest, type UpdateStationRequest as ApiUpdateStationRequest, type Station as ApiStation } from '@/services/api/stationService';
import { StaffService, type Staff as ApiStaff } from '@/services/api/staffService';
import type { Station, StationFilters, AddStationRequest, UpdateStationRequest, StationStatus } from '../types/station';
import type { Staff } from '../types/staff';

interface StationListPageProps {
    onStationSelect?: (station: Station) => void;
}

export const StationListPage: React.FC<StationListPageProps> = ({ onStationSelect }) => {
    const [stations, setStations] = useState<Station[]>([]);
    const [allStaff, setAllStaff] = useState<Staff[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<Station | null>(null);
    const [filters, setFilters] = useState<StationFilters>({
        search: '',
        city: 'ALL',
        district: 'ALL',
        status: 'ALL',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [suspendingStationId, setSuspendingStationId] = useState<string | null>(null);
    const [savingStationId, setSavingStationId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [selectedStationForStaff, setSelectedStationForStaff] = useState<Station | null>(null);
    const [savingStaffId, setSavingStaffId] = useState<string | null>(null);

    // Load staff data from API
    const loadStaff = async () => {
        try {
            const apiStaff = await StaffService.getAllStaff();

            // Convert API staff to UI staff format
            const convertedStaff: Staff[] = apiStaff.map((apiStaffMember: ApiStaff) => ({
                id: apiStaffMember._id,
                name: apiStaffMember.fullName || 'N/A',
                email: apiStaffMember.email || 'N/A',
                phone: apiStaffMember.phoneNumber || 'N/A',
                role: 'STAFF' as const,
                stationId: apiStaffMember.station ? apiStaffMember.station.toString() : 'default',
                stationName: 'Chưa phân trạm',
                status: apiStaffMember.status === 'active' ? 'ONLINE' : 'OFFLINE',
                permissions: [],
                lastActive: new Date(apiStaffMember.updatedAt),
                createdAt: new Date(apiStaffMember.createdAt),
                updatedAt: new Date(apiStaffMember.updatedAt),
            }));

            setAllStaff(convertedStaff);
        } catch (err) {
            console.error('Error loading staff:', err);
        }
    };

    // Load station data from API
    const loadStations = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const apiStations = await StationService.getAllStations();

            // Convert API stations to UI station format
            const convertedStations: Station[] = apiStations.map((apiStation: ApiStation) => ({
                id: apiStation._id,
                name: apiStation.stationName,
                address: apiStation.address,
                city: apiStation.city,
                district: apiStation.district,
                coordinates: {
                    lat: apiStation.location.coordinates[1], // latitude
                    lng: apiStation.location.coordinates[0], // longitude
                },
                mapUrl: apiStation.map_url,
                capacity: apiStation.capacity,
                sohAvg: apiStation.sohAvg,
                availableBatteries: apiStation.availableBatteries,
                status: 'ACTIVE' as StationStatus, // Default status since API doesn't provide it
                createdAt: new Date(apiStation.createdAt),
                updatedAt: new Date(apiStation.updatedAt),
            }));

            setStations(convertedStations);
            toast.success('Tải danh sách trạm thành công');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách trạm';
            setError(errorMessage);
            console.error('Error loading stations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            await loadStaff();
            await loadStations();
        };
        loadData();
    }, []);

    const filteredStations = stations.filter((station) => {
        const matchesSearch = filters.search === '' ||
            station.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            station.address.toLowerCase().includes(filters.search.toLowerCase()) ||
            station.city.toLowerCase().includes(filters.search.toLowerCase()) ||
            station.district.toLowerCase().includes(filters.search.toLowerCase());

        const matchesCity = filters.city === 'ALL' || station.city === filters.city;
        const matchesDistrict = filters.district === 'ALL' || station.district === filters.district;
        const matchesStatus = filters.status === 'ALL' || station.status === filters.status;

        return matchesSearch && matchesCity && matchesDistrict && matchesStatus;
    });

    const handleStationEdit = (station: Station) => {
        setEditingStation(station);
        setIsModalOpen(true);
    };

    const handleStationSuspend = async (station: Station) => {
        if (window.confirm(`Bạn có chắc chắn muốn tạm dừng trạm ${station.name}?`)) {
            try {
                setSuspendingStationId(station.id);
                const newStatus = station.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
                await StationService.changeStationStatus(station.id, newStatus);

                // Update local state
                setStations(prev => prev.map(s =>
                    s.id === station.id
                        ? {
                            ...s,
                            status: newStatus as StationStatus,
                            updatedAt: new Date()
                        }
                        : s
                ));

                toast.success(
                    newStatus === 'ACTIVE'
                        ? `Đã kích hoạt trạm ${station.name}`
                        : `Đã tạm dừng trạm ${station.name}`
                );
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thay đổi trạng thái trạm';
                setError(errorMessage);
                console.error('Error changing station status:', err);
            } finally {
                setSuspendingStationId(null);
            }
        }
    };

    const handleAddStation = () => {
        setEditingStation(null);
        setIsModalOpen(true);
    };

    const handleViewStationDetails = (station: Station) => {
        setSelectedStation(station);
        setIsDetailModalOpen(true);
    };

    const handleViewStationStaff = (station: Station) => {
        setSelectedStationForStaff(station);
        setIsStaffModalOpen(true);
    };

    // Get staff by station
    const getStaffByStation = (stationId: string): Staff[] => {
        return allStaff.filter(staff => staff.stationId === stationId);
    };

    // Add staff to station
    const handleAddStaffToStation = async (stationId: string, staffId: string) => {
        try {
            setSavingStaffId(staffId);
            await StationService.addStaffToStation(stationId, staffId);

            // Update local state
            setAllStaff(prev => prev.map(s =>
                s.id === staffId ? { ...s, stationId, stationName: stations.find(st => st.id === stationId)?.name || 'Chưa phân trạm' } : s
            ));

            toast.success('Đã thêm nhân viên vào trạm');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm nhân viên vào trạm';
            setError(errorMessage);
            console.error('Error adding staff to station:', err);
        } finally {
            setSavingStaffId(null);
        }
    };

    // Remove staff from station
    const handleRemoveStaffFromStation = async (stationId: string, staffId: string) => {
        try {
            setSavingStaffId(staffId);
            await StationService.removeStaffFromStation(stationId, staffId);

            // Update local state
            setAllStaff(prev => prev.map(s =>
                s.id === staffId ? { ...s, stationId: 'default', stationName: 'Chưa phân trạm' } : s
            ));

            toast.success('Đã xóa nhân viên khỏi trạm');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa nhân viên khỏi trạm';
            toast.error(errorMessage);
            console.error('Error removing staff from station:', err);
        } finally {
            setSavingStaffId(null);
        }
    };

    // Reload staff data
    const handleReloadStaff = async () => {
        await loadStaff();
    };


    const handleSaveStation = async (data: AddStationRequest | UpdateStationRequest): Promise<void> => {
        try {
            setSavingStationId('id' in data ? data.id as string : 'new');
            setError(null);

            if ('id' in data) {
                // Update existing station
                const updateData: ApiUpdateStationRequest = {
                    stationName: data.name,
                    address: data.address,
                    city: data.city,
                    district: data.district,
                    location: {
                        type: 'Point',
                        coordinates: [data.coordinates?.lng || 0, data.coordinates?.lat || 0]
                    },
                    map_url: data.mapUrl || '',
                    capacity: data.capacity || 0,
                    sohAvg: data.sohAvg,
                    availableBatteries: data.availableBatteries,
                };

                const updatedStation = await StationService.updateStation(data.id as string, updateData);

                // Convert API response to UI format
                const convertedStation: Station = {
                    id: updatedStation._id,
                    name: updatedStation.stationName,
                    address: updatedStation.address,
                    city: updatedStation.city,
                    district: updatedStation.district,
                    coordinates: {
                        lat: updatedStation.location.coordinates[1],
                        lng: updatedStation.location.coordinates[0],
                    },
                    mapUrl: updatedStation.map_url,
                    capacity: updatedStation.capacity,
                    sohAvg: updatedStation.sohAvg,
                    availableBatteries: updatedStation.availableBatteries,
                    status: 'ACTIVE' as StationStatus,
                    lastActive: new Date(updatedStation.updatedAt),
                    createdAt: new Date(updatedStation.createdAt),
                    updatedAt: new Date(updatedStation.updatedAt),
                };

                setStations(prev => prev.map(s => s.id === data.id ? convertedStation : s));
                toast.success(`Đã cập nhật thông tin trạm ${convertedStation.name}`);
            } else {
                // Add new station
                const createData: CreateStationRequest = {
                    stationName: data.name,
                    address: data.address,
                    city: data.city,
                    district: data.district,
                    location: {
                        type: 'Point',
                        coordinates: [data.coordinates.lng, data.coordinates.lat]
                    },
                    map_url: data.mapUrl,
                    capacity: data.capacity,
                    sohAvg: data.sohAvg,
                    availableBatteries: data.availableBatteries,
                };

                const newStation = await StationService.createStation(createData);

                // Convert API response to UI format
                const convertedStation: Station = {
                    id: newStation._id,
                    name: newStation.stationName,
                    address: newStation.address,
                    city: newStation.city,
                    district: newStation.district,
                    coordinates: {
                        lat: newStation.location.coordinates[1],
                        lng: newStation.location.coordinates[0],
                    },
                    mapUrl: newStation.map_url,
                    capacity: newStation.capacity,
                    sohAvg: newStation.sohAvg,
                    availableBatteries: newStation.availableBatteries,
                    status: 'ACTIVE' as StationStatus,
                    lastActive: new Date(newStation.createdAt),
                    createdAt: new Date(newStation.createdAt),
                    updatedAt: new Date(newStation.updatedAt),
                };

                setStations(prev => [...prev, convertedStation]);
                toast.success(`Đã thêm trạm ${convertedStation.name} thành công`);
            }

            setIsModalOpen(false);
            setEditingStation(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu thông tin trạm';
            setError(errorMessage);
            console.error('Error saving station:', err);
        } finally {
            setSavingStationId(null);
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Danh sách trạm đổi pin"
                description="Quản lý thông tin các trạm đổi pin xe điện"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng trạm"
                    value={stations.length}
                    icon={MapPin}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Đang hoạt động"
                    value={stations.filter(s => s.status === 'ACTIVE').length}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Bảo trì"
                    value={stations.filter(s => s.status === 'MAINTENANCE').length}
                    icon={Wrench}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="Tổng pin"
                    value={stations.reduce((sum, s) => sum + s.availableBatteries, 0)}
                    icon={Battery}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <StationSearchBar
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            </div>

            {/* Station List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                            Danh sách trạm đổi pin
                            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {filteredStations.length}
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
                                onClick={handleAddStation}
                                disabled={savingStationId === 'new'}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700"
                            >
                                {savingStationId === 'new' ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Đang thêm..." />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm trạm
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Đang tải danh sách trạm..." />
                    ) : filteredStations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <MapPin className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Không có trạm nào</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.city !== 'ALL' || filters.district !== 'ALL' || filters.status !== 'ALL'
                                    ? 'Không tìm thấy trạm phù hợp với bộ lọc hiện tại.'
                                    : 'Chưa có trạm nào được thêm vào hệ thống.'}
                            </p>
                            {(!filters.search && filters.city === 'ALL' && filters.district === 'ALL' && filters.status === 'ALL') && (
                                <Button
                                    onClick={handleAddStation}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm trạm đầu tiên
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStations.map((station) => (
                                <StationCard
                                    key={station.id}
                                    station={station}
                                    onSelect={onStationSelect || (() => { })}
                                    onEdit={handleStationEdit}
                                    onSuspend={handleStationSuspend}
                                    onViewDetails={handleViewStationDetails}
                                    onViewStaff={handleViewStationStaff}
                                    isSuspending={suspendingStationId === station.id}
                                    isSaving={savingStationId === station.id}
                                    staffCount={getStaffByStation(station.id).length}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <StationTable
                                stations={filteredStations}
                                onSelect={onStationSelect || (() => { })}
                                onEdit={handleStationEdit}
                                onSuspend={handleStationSuspend}
                                onViewDetails={handleViewStationDetails}
                                onViewStaff={handleViewStationStaff}
                                suspendingStationId={suspendingStationId}
                                savingStationId={savingStationId}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Station Modal */}
            <StationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingStation(null);
                }}
                onSave={handleSaveStation}
                station={editingStation}
            />

            {/* Station Detail Modal */}
            <StationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedStation(null);
                }}
                station={selectedStation}
            />

            {/* Station Staff Modal */}
            <StationStaffModal
                isOpen={isStaffModalOpen}
                onClose={() => {
                    setIsStaffModalOpen(false);
                    setSelectedStationForStaff(null);
                }}
                station={selectedStationForStaff}
                staff={selectedStationForStaff ? getStaffByStation(selectedStationForStaff.id) : []}
                allStaff={allStaff}
                onAddStaff={handleAddStaffToStation}
                onRemoveStaff={handleRemoveStaffFromStation}
                onReloadStaff={handleReloadStaff}
                savingStaffId={savingStaffId}
            />
        </div>
    );
};
