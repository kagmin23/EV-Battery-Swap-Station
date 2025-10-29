import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Grid, List, MapPin, Activity, AlertCircle, Battery, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
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
import type { Station, StationFilters, AddStationRequest, UpdateStationRequest } from '../types/station';
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
        limit: '20',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
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
                stationName: 'Unassigned',
                status: apiStaffMember.status === 'active' ? 'ONLINE' : 'OFFLINE',
                permissions: [],
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
                // Use available from batteryCounts if available (real-time data), fallback to availableBatteries
                availableBatteries: apiStation.batteryCounts?.available ?? apiStation.availableBatteries,
                batteryCounts: apiStation.batteryCounts,
                createdAt: new Date(apiStation.createdAt),
                updatedAt: new Date(apiStation.updatedAt),
            }));

            setStations(convertedStations);
            // Success message removed to avoid notification spam
        } catch (err) {
            setError('Unable to load stations. Please try again later.');
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

        return matchesSearch && matchesCity && matchesDistrict;
    });

    // Calculate pagination
    const limitNum = Number(filters.limit) || 20;
    const totalPages = Math.ceil(filteredStations.length / limitNum);
    const paginatedStations = filteredStations.slice(
        (currentPage - 1) * limitNum,
        currentPage * limitNum
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.city, filters.district, filters.limit]);

    const handleStationEdit = async (station: Station) => {
        try {
            // Fetch fresh station data from API
            const apiStation = await StationService.getStationById(station.id);

            // Convert API station to UI format
            const convertedStation: Station = {
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
                // Use available from batteryCounts if available (real-time data), fallback to availableBatteries
                availableBatteries: apiStation.batteryCounts?.available ?? apiStation.availableBatteries,
                batteryCounts: apiStation.batteryCounts,
                createdAt: new Date(apiStation.createdAt),
                updatedAt: new Date(apiStation.updatedAt),
            };

            setEditingStation(convertedStation);
            setIsModalOpen(true);
        } catch (err) {
            toast.error('Unable to load station details. Please try again.');
            console.error('Error loading station:', err);
        }
    };

    const handleAddStation = () => {
        setEditingStation(null);
        setIsModalOpen(true);
    };

    const handleViewStationDetails = async (station: Station) => {
        try {
            // Fetch fresh station data from API
            const apiStation = await StationService.getStationById(station.id);

            // Convert API station to UI format
            const convertedStation: Station = {
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
                // Use available from batteryCounts if available (real-time data), fallback to availableBatteries
                availableBatteries: apiStation.batteryCounts?.available ?? apiStation.availableBatteries,
                batteryCounts: apiStation.batteryCounts,
                createdAt: new Date(apiStation.createdAt),
                updatedAt: new Date(apiStation.updatedAt),
            };

            setSelectedStation(convertedStation);
            setIsDetailModalOpen(true);
        } catch (err) {
            toast.error('Unable to load station details. Please try again.');
            console.error('Error loading station:', err);
        }
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
                s.id === staffId ? { ...s, stationId, stationName: stations.find(st => st.id === stationId)?.name || 'Unassigned' } : s
            ));

            toast.success('Staff member assigned successfully');
        } catch (err) {
            toast.error('Unable to assign staff member. Please try again.');
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
                s.id === staffId ? { ...s, stationId: 'default', stationName: 'Unassigned' } : s
            ));

            toast.success('Staff member removed successfully');
        } catch (err) {
            toast.error('Unable to remove staff member. Please try again.');
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
                    lat: data.coordinates?.lat || 0,
                    lng: data.coordinates?.lng || 0,
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
                    // Use available from batteryCounts if available (real-time data), fallback to availableBatteries
                    availableBatteries: updatedStation.batteryCounts?.available ?? updatedStation.availableBatteries,
                    batteryCounts: updatedStation.batteryCounts,
                    createdAt: new Date(updatedStation.createdAt),
                    updatedAt: new Date(updatedStation.updatedAt),
                };

                setStations(prev => prev.map(s => s.id === data.id ? convertedStation : s));
                toast.success(`Station "${convertedStation.name}" updated successfully`);
            } else {
                // Add new station
                const createData: CreateStationRequest = {
                    stationName: data.name,
                    address: data.address,
                    city: data.city,
                    district: data.district,
                    lat: data.coordinates.lat,
                    lng: data.coordinates.lng,
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
                    // Use available from batteryCounts if available (real-time data), fallback to availableBatteries
                    availableBatteries: newStation.batteryCounts?.available ?? newStation.availableBatteries,
                    batteryCounts: newStation.batteryCounts,
                    createdAt: new Date(newStation.createdAt),
                    updatedAt: new Date(newStation.updatedAt),
                };

                setStations(prev => [...prev, convertedStation]);
                toast.success(`Station "${convertedStation.name}" added successfully`);
            }

            setIsModalOpen(false);
            setEditingStation(null);
        } catch (err) {
            toast.error('Unable to save station information. Please check your inputs and try again.');
            console.error('Error saving station:', err);
        } finally {
            setSavingStationId(null);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header */}
            <PageHeader
                title="Battery Swap Station List"
                description="Manage battery swap station information"
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatsCard
                    title="Total Stations"
                    value={stations.length}
                    icon={MapPin}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Average Capacity"
                    value={Math.round(stations.reduce((sum, s) => sum + s.capacity, 0) / (stations.length || 1))}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Average SOH"
                    value={`${Math.round(stations.reduce((sum, s) => sum + s.sohAvg, 0) / (stations.length || 1))}%`}
                    icon={Wrench}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="Total Batteries"
                    value={stations.reduce((sum, s) => sum + (s.batteryCounts?.total ?? 0), 0)}
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
                    isResetting={isResetting}
                    onResetFilters={async () => {
                        setIsResetting(true);
                        setFilters({
                            search: '',
                            city: 'ALL',
                            district: 'ALL',
                            limit: '20',
                        });
                        setCurrentPage(1);
                        await new Promise(resolve => setTimeout(resolve, 300));
                        setIsResetting(false);
                    }}
                />
            </div>

            {/* Station List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center text-lg md:text-xl font-bold text-slate-800 flex-wrap gap-2">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            Battery Swap Station List
                            <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-semibold">
                                {filteredStations.length}
                            </span>
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
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
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 md:px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700 flex-1 md:flex-initial"
                            >
                                {savingStationId === 'new' ? (
                                    <ButtonLoadingSpinner size="sm" variant="white" text="Adding..." />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">Add Station</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-4 md:p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Loading station list..." />
                    ) : filteredStations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <MapPin className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No stations found</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.city !== 'ALL' || filters.district !== 'ALL'
                                    ? 'No stations found matching the current filters.'
                                    : 'No stations have been added to the system yet.'}
                            </p>
                            {(!filters.search && filters.city === 'ALL' && filters.district === 'ALL') && (
                                <Button
                                    onClick={handleAddStation}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Station
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {paginatedStations.map((station) => (
                                <StationCard
                                    key={station.id}
                                    station={station}
                                    onSelect={onStationSelect || (() => { })}
                                    onEdit={handleStationEdit}
                                    onViewDetails={handleViewStationDetails}
                                    onViewStaff={handleViewStationStaff}
                                    isSaving={savingStationId === station.id}
                                    staffCount={getStaffByStation(station.id).length}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <StationTable
                                stations={paginatedStations}
                                onSelect={onStationSelect || (() => { })}
                                onEdit={handleStationEdit}
                                onViewDetails={handleViewStationDetails}
                                onViewStaff={handleViewStationStaff}
                                savingStationId={savingStationId}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && filteredStations.length > 0 && totalPages > 1 && (
                <div className="flex flex-col items-center py-4 gap-3">
                    <nav className="flex items-center -space-x-px" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-s-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
                            disabled={currentPage === totalPages}
                            className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-e-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                            aria-label="Next"
                        >
                            <span className="hidden sm:block">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </nav>

                    {/* Items info */}
                    <div className="text-sm text-gray-800">
                        Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * limitNum + 1}</span> to{" "}
                        <span className="font-semibold text-slate-900">{Math.min(currentPage * limitNum, filteredStations.length)}</span> of{" "}
                        <span className="font-semibold text-slate-900">{filteredStations.length}</span> results
                    </div>
                </div>
            )}

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
                onRemoveStaff={handleRemoveStaffFromStation}
                onReloadStaff={handleReloadStaff}
                savingStaffId={savingStaffId}
            />
        </div>
    );
};
