import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Battery as BatteryIcon,
    MapPin,
    Activity,
    AlertCircle,
    Zap,
    Thermometer,
    RotateCcw,
    TrendingUp,
    Search,
    Grid,
    List,
    Plus,
    Edit,
    Trash2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService, type Battery as ApiBattery, type BatteryFilters as ApiBatteryFilters } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import { AddBatteryModal } from '../components/AddBatteryModal';
import { EditBatteryModal } from '../components/EditBatteryModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { BatteryTable } from '../components/BatteryTable';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Battery, BatteryStatus } from '../types/battery';

export const BatteryInventoryPage: React.FC = () => {
    const [batteries, setBatteries] = useState<Battery[]>([]);
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStation, setSelectedStation] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<BatteryStatus | 'ALL'>('ALL');
    const [sohMin, setSohMin] = useState<string>('');
    const [sohMax, setSohMax] = useState<string>('');
    const [limit, setLimit] = useState<string>('20');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [isAddBatteryModalOpen, setIsAddBatteryModalOpen] = useState(false);
    const [isEditBatteryModalOpen, setIsEditBatteryModalOpen] = useState(false);
    const [editingBattery, setEditingBattery] = useState<Battery | null>(null);
    const [deletingBatteryId, setDeletingBatteryId] = useState<string | null>(null);

    // Confirmation modal states
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState<'edit' | 'delete' | null>(null);
    const [confirmationBattery, setConfirmationBattery] = useState<Battery | null>(null);

    // Load stations data
    const loadStations = async () => {
        try {
            const apiStations = await StationService.getAllStations();
            const stationList = apiStations.map((station: ApiStation) => ({
                id: station._id,
                name: station.stationName
            }));
            setStations(stationList);
        } catch (err) {
            console.error('Error loading stations:', err);
        }
    };

    // Load batteries data
    const loadBatteries = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const filters: ApiBatteryFilters = {
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                stationId: selectedStation !== 'ALL' ? selectedStation : undefined,
                sohMin: sohMin ? Number(sohMin) : undefined,
                sohMax: sohMax ? Number(sohMax) : undefined,
                page: currentPage,
                limit: limit ? Number(limit) : 20,
                sort: 'soh',
                order: 'desc'
            };

            // Use main endpoint with filters (backend handles all filtering)
            const response = await BatteryService.getAllBatteries(filters);
            const apiBatteries = response.data || [];
            const meta = response.meta || { page: 1, limit: 20, total: 0 };

            // Update pagination state
            setTotalPages(Math.ceil(meta.total / meta.limit) || 1);
            setTotal(meta.total);

            // Convert API batteries to UI format
            const convertedBatteries: Battery[] = apiBatteries.map((apiBattery: ApiBattery & { stationName?: string }) => {
                console.log('API Battery data:', apiBattery); // Debug API response

                // Extract all available fields from API response
                const batteryData = {
                    id: apiBattery._id,
                    batteryId: apiBattery.serial, // Use serial as batteryId
                    stationId: apiBattery.station?._id || '',
                    stationName: apiBattery.station?.stationName || stations.find(s => s.id === apiBattery.station?._id)?.name || 'Unknown Station',
                    status: apiBattery.status,
                    soh: apiBattery.soh || 100,
                    voltage: apiBattery.voltage || 400, // Default voltage for EV batteries
                    current: 0, // Not available in backend
                    temperature: 0, // Not available in backend
                    cycleCount: 0, // Not available in backend
                    lastMaintenance: new Date(), // Not available in backend
                    createdAt: new Date(apiBattery.createdAt),
                    updatedAt: new Date(apiBattery.updatedAt),
                    // Additional fields for editing - use actual values or sensible defaults
                    model: apiBattery.model || `Battery-${apiBattery.serial}`,
                    manufacturer: apiBattery.manufacturer || 'Unknown Manufacturer',
                    capacity_kWh: apiBattery.capacity_kWh || 50,
                    price: (apiBattery as any).price || 0,
                };

                console.log('Converted battery data:', batteryData);
                return batteryData;
            });

            setBatteries(convertedBatteries);
            // Success message removed to avoid notification spam
        } catch (err) {
            setError('Unable to load batteries. Please try again later.');
            console.error('Error loading batteries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter batteries by search term (client-side filtering)
    const filteredBatteries = React.useMemo(() => {
        if (!searchTerm.trim()) return batteries;

        return batteries.filter(battery =>
            battery.batteryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            battery.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            battery.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            battery.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [batteries, searchTerm]);

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            await loadStations();
            await loadBatteries();
        };
        loadData();
    }, []);

    // Reload batteries when filters change
    useEffect(() => {
        if (stations.length > 0) {
            setCurrentPage(1); // Reset to first page when filters change
            loadBatteries();
        }
    }, [selectedStation, statusFilter, sohMin, sohMax, limit, stations, currentPage]);

    const getStatusBadge = (status: BatteryStatus) => {
        switch (status) {
            case 'charging':
                return <Badge variant="warning">Charging</Badge>;
            case 'full':
                return <Badge variant="success">Full</Badge>;
            case 'faulty':
                return <Badge variant="destructive">Faulty</Badge>;
            case 'in-use':
                return <Badge variant="default">In Use</Badge>;
            case 'idle':
                return <Badge variant="secondary">Idle</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'charging':
                return 'text-orange-500';
            case 'full':
                return 'text-green-500';
            case 'faulty':
                return 'text-red-500';
            case 'in-use':
                return 'text-blue-500';
            case 'idle':
                return 'text-gray-500';
            default:
                return 'text-gray-400';
        }
    };

    const getSohColor = (soh: number) => {
        if (soh >= 80) return 'text-green-600';
        if (soh >= 60) return 'text-yellow-600';
        if (soh >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    // Handle successful operations
    const handleBatteryOperationSuccess = () => {
        loadBatteries();
    };

    // Handle edit battery - open edit modal directly
    const handleEditBattery = (battery: Battery) => {
        setEditingBattery(battery);
        setIsEditBatteryModalOpen(true);
    };

    // Handle delete battery - show confirmation first
    const handleDeleteBattery = (battery: Battery) => {
        setConfirmationBattery(battery);
        setConfirmationAction('delete');
        setIsConfirmationModalOpen(true);
    };

    // Handle confirmation modal actions
    const handleConfirmationConfirm = async () => {
        if (!confirmationBattery || !confirmationAction) return;

        try {
            if (confirmationAction === 'edit') {
                // Close confirmation modal first
                handleConfirmationClose();
                // Then open edit modal
                setEditingBattery(confirmationBattery);
                setIsEditBatteryModalOpen(true);
            } else if (confirmationAction === 'delete') {
                // Delete battery
                setDeletingBatteryId(confirmationBattery.id);
                await BatteryService.deleteBattery(confirmationBattery.id);

                // Update local state - useEffect will automatically regroup
                setBatteries(prev => prev.filter(b => b.id !== confirmationBattery.id));

                toast.success(`Battery ${confirmationBattery.batteryId} deleted successfully`);
                handleConfirmationClose();
            }
        } catch (err) {
            toast.error('Unable to delete battery. Please try again.');
            console.error('Error:', err);
        } finally {
            setDeletingBatteryId(null);
        }
    };

    // Handle confirmation modal close
    const handleConfirmationClose = () => {
        setIsConfirmationModalOpen(false);
        setConfirmationAction(null);
        setConfirmationBattery(null);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Header */}
            <PageHeader
                title="Battery Inventory"
                description="Manage and track battery status at battery swap stations"
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
                    title="Total Batteries"
                    value={batteries.length}
                    icon={BatteryIcon}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Charging"
                    value={batteries.filter(b => b.status === 'charging').length}
                    icon={Zap}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="Ready"
                    value={batteries.filter(b => b.status === 'full').length}
                    icon={Activity}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Average SOH"
                    value={`${batteries.length > 0 ? Math.round(batteries.reduce((sum, b) => sum + b.soh, 0) / batteries.length) : 0}%`}
                    icon={TrendingUp}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Search className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Search & Filters</h3>
                    </div>

                    <div className="space-y-4">
                        {/* First Row: Station ID, Station, Status */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Station ID Input */}
                            <div className="flex-1 relative">
                                <Input
                                    type="text"
                                    placeholder="Station ID"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Station Filter */}
                            <Select value={selectedStation} onValueChange={setSelectedStation}>
                                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Select Station" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="ALL"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        All Stations
                                    </SelectItem>
                                    {stations.map(station => (
                                        <SelectItem
                                            key={station.id}
                                            value={station.id}
                                            className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                        >
                                            {station.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BatteryStatus | 'ALL')}>
                                <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="ALL"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        All Status
                                    </SelectItem>
                                    <SelectItem
                                        value="charging"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Charging
                                    </SelectItem>
                                    <SelectItem
                                        value="full"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Full
                                    </SelectItem>
                                    <SelectItem
                                        value="faulty"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Faulty
                                    </SelectItem>
                                    <SelectItem
                                        value="in-use"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        In Use
                                    </SelectItem>
                                    <SelectItem
                                        value="idle"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Idle
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Second Row: SOH Min, SOH Max, Sort, Order, Page, Limit, Reset, Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                            {/* SOH Min */}
                            <Input
                                type="number"
                                placeholder="SOH Min"
                                value={sohMin}
                                onChange={(e) => setSohMin(e.target.value)}
                                className="w-full sm:w-[120px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            {/* SOH Max */}
                            <Input
                                type="number"
                                placeholder="SOH Max"
                                value={sohMax}
                                onChange={(e) => setSohMax(e.target.value)}
                                className="w-full sm:w-[120px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            {/* Limit */}
                            <Select value={limit} onValueChange={setLimit}>
                                <SelectTrigger className="w-full sm:w-[120px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Limit" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem value="10" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700">10</SelectItem>
                                    <SelectItem value="20" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700">20</SelectItem>
                                    <SelectItem value="50" className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700">50</SelectItem>
                                </SelectContent>
                            </Select>


                            {/* Reset Button */}
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setIsResetting(true);
                                    setSearchTerm('');
                                    setSelectedStation('ALL');
                                    setStatusFilter('ALL');
                                    setSohMin('');
                                    setSohMax('');
                                    setLimit('20');
                                    await new Promise(resolve => setTimeout(resolve, 300));
                                    setIsResetting(false);
                                }}
                                disabled={isResetting}
                                className="h-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-slate-700 px-4 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            {/* Battery List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-blue-100 rounded-xl mr-3">
                                <BatteryIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            Battery List
                            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {total}
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
                                onClick={() => setIsAddBatteryModalOpen(true)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg border border-green-600 hover:border-green-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Battery
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Loading battery list..." />
                    ) : filteredBatteries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <BatteryIcon className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No Batteries</h3>
                            <p className="text-slate-600 text-center">
                                No batteries found matching the current filters.
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredBatteries.map((battery) => (
                                <Card
                                    key={battery.id}
                                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className={`w-14 h-14 bg-gradient-to-br ${getStatusColor(battery.status).includes('green') ? 'from-green-500 to-green-600' :
                                                        getStatusColor(battery.status).includes('blue') ? 'from-blue-500 to-blue-600' :
                                                            getStatusColor(battery.status).includes('yellow') ? 'from-yellow-500 to-yellow-600' :
                                                                getStatusColor(battery.status).includes('red') ? 'from-red-500 to-red-600' :
                                                                    'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                        <BatteryIcon className="h-7 w-7" />
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(battery.status).includes('green') ? 'bg-green-500' :
                                                        getStatusColor(battery.status).includes('blue') ? 'bg-blue-500' :
                                                            getStatusColor(battery.status).includes('yellow') ? 'bg-yellow-500' :
                                                                getStatusColor(battery.status).includes('red') ? 'bg-red-500' :
                                                                    'bg-gray-400'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-800 truncate text-lg">{battery.batteryId}</h3>
                                                    <p className="text-sm text-slate-500 truncate">{battery.stationName}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        {getStatusBadge(battery.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                                <span className="truncate font-medium">{battery.stationName}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                                <BatteryIcon className="h-4 w-4 mr-2 text-green-500" />
                                                <span>{battery.voltage}V</span>
                                            </div>
                                            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                                                <span className="font-medium">SOH:</span> <span className={`font-semibold ${getSohColor(battery.soh)}`}>{battery.soh}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Current:</span>
                                                <span className="font-medium flex items-center">
                                                    <Zap className="h-3 w-3 mr-1" />
                                                    {battery.current}A
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Temperature:</span>
                                                <span className="font-medium flex items-center">
                                                    <Thermometer className="h-3 w-3 mr-1" />
                                                    {battery.temperature}°C
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Cycle:</span>
                                                <span className="font-medium flex items-center">
                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                    {battery.cycleCount}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditBattery(battery);
                                                }}
                                                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 hover:shadow-sm"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBattery(battery);
                                                }}
                                                disabled={deletingBatteryId === battery.id}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                                            >
                                                {deletingBatteryId === battery.id ? (
                                                    <ButtonLoadingSpinner size="sm" variant="default" text="Deleting..." />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <BatteryTable
                                batteries={filteredBatteries}
                                onEdit={handleEditBattery}
                                onDelete={handleDeleteBattery}
                                deletingBatteryId={deletingBatteryId}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && filteredBatteries.length > 0 && totalPages > 1 && (
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
                        Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * Number(limit) + 1}</span> to{" "}
                        <span className="font-semibold text-slate-900">{Math.min(currentPage * Number(limit), total)}</span> of{" "}
                        <span className="font-semibold text-slate-900">{total}</span> results
                    </div>
                </div>
            )}

            {/* Add Battery Modal */}
            <AddBatteryModal
                isOpen={isAddBatteryModalOpen}
                onClose={() => setIsAddBatteryModalOpen(false)}
                onSuccess={handleBatteryOperationSuccess}
            />

            {/* Edit Battery Modal */}
            <EditBatteryModal
                isOpen={isEditBatteryModalOpen}
                onClose={() => {
                    setIsEditBatteryModalOpen(false);
                    setEditingBattery(null);
                }}
                onSuccess={handleBatteryOperationSuccess}
                battery={editingBattery}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={handleConfirmationClose}
                onConfirm={handleConfirmationConfirm}
                title={
                    confirmationAction === 'edit'
                        ? `Confirm edit battery ${confirmationBattery?.batteryId}`
                        : `Confirm delete battery ${confirmationBattery?.batteryId}`
                }
                message={
                    confirmationAction === 'edit'
                        ? (
                            <div>
                                Are you sure you want to edit battery <span className="font-bold text-slate-800">{confirmationBattery?.batteryId}</span>?
                            </div>
                        )
                        : (
                            <div>
                                Are you sure you want to delete battery <span className="font-bold text-slate-800">{confirmationBattery?.batteryId}</span>?<br />
                                <span className="text-red-600 font-medium">This action cannot be undone.</span>
                            </div>
                        )
                }
                confirmText={confirmationAction === 'edit' ? 'Edit' : 'Delete'}
                type={confirmationAction || 'edit'}
                isLoading={deletingBatteryId === confirmationBattery?.id}
            />
        </div>
    );
};