import React, { useState, useEffect } from 'react';
import { AlertTriangle, Battery as BatteryIcon, Eye, AlertCircle, TrendingUp, Search, Grid, List, MapPin, RotateCcw, ChevronLeft, ChevronRight, Edit, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner, ButtonLoadingSpinner } from '@/components/ui/loading-spinner';
import { BatteryService, type Battery as ApiBattery } from '@/services/api/batteryService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import type { BatteryStatus } from '../types/battery';
import { EditBatteryModal } from '../components/EditBatteryModal';
import { UserService } from '@/services/api/userService';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface FaultyBatteryCardProps {
    battery: ApiBattery;
    onClick: () => void;
    onEdit: (battery: ApiBattery) => void;
    onDelete: (battery: ApiBattery) => void;
    onLogs: (battery: ApiBattery) => void;
    deletingId: string | null;
}

const FaultyBatteryCard: React.FC<FaultyBatteryCardProps> = ({ battery, onClick, onEdit, onDelete, onLogs, deletingId }) => {
    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'charging':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'full':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-use':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'idle':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'Faulty';
            case 'charging':
                return 'Charging';
            case 'full':
                return 'Full';
            case 'in-use':
                return 'In Use';
            case 'idle':
                return 'Idle';
            default:
                return 'Unknown';
        }
    };

    const getSohColor = (soh: number) => {
        if (soh >= 80) return 'text-green-600';
        if (soh >= 60) return 'text-yellow-600';
        if (soh >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <Card
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white overflow-hidden"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                <BatteryIcon className="h-7 w-7" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-lg">{battery.serial}</h3>
                            <p className="text-sm text-slate-500 truncate">{battery.model || 'N/A'}</p>
                            <div className="flex items-center space-x-2 mt-2">
                                <Badge className={`${getStatusColor(battery.status)} border`}>
                                    {getStatusText(battery.status)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate font-medium">{battery.station?.stationName || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <BatteryIcon className="h-4 w-4 mr-2 text-green-500" />
                        <span>{battery.capacity_kWh || 'N/A'} kWh</span>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                        <span className="font-medium">SOH:</span> <span className={`font-semibold ${getSohColor(battery.soh)}`}>{battery.soh}%</span>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Voltage:</span>
                        <span className="font-medium">{battery.voltage || 'N/A'}V</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Manufacturer:</span>
                        <span className="font-medium">{battery.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-red-100">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">
                                Battery needs inspection and repair
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={e => { e.stopPropagation(); onLogs(battery); }}
                        className="hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 border-slate-200"
                    >
                        <BookOpen className="h-4 w-4 mr-2" />Logs
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={e => { e.stopPropagation(); onEdit(battery); }}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border-slate-200"
                    >
                        <Edit className="h-4 w-4 mr-2" />Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={e => { e.stopPropagation(); onDelete(battery); }}
                        disabled={deletingId === battery._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                    >
                        {deletingId === battery._id
                            ? <ButtonLoadingSpinner size="sm" variant="default" text="Deleting..." />
                            : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const FaultyBatteryDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    battery: ApiBattery | null;
}> = ({ isOpen, onClose, battery }) => {
    if (!isOpen || !battery) return null;

    const getStatusColor = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'charging':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'full':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-use':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'idle':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: BatteryStatus) => {
        switch (status) {
            case 'faulty':
                return 'Faulty';
            case 'charging':
                return 'Charging';
            case 'full':
                return 'Full';
            case 'in-use':
                return 'In Use';
            case 'idle':
                return 'Idle';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <BatteryIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    Faulty Battery Details
                                </h2>
                                <p className="text-slate-500">
                                    Battery #{battery.serial}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-10 w-10 rounded-full hover:bg-slate-100"
                        >
                            ×
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Thông tin cơ bản */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Serial Number</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.serial}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Station</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.station?.stationName || 'Not assigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Status</p>
                                    <Badge className={`${getStatusColor(battery.status)} border`}>
                                        {getStatusText(battery.status)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">SOH</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.soh}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Capacity</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.capacity_kWh || 'N/A'} kWh
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Voltage</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.voltage || 'N/A'}V
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Model</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.model || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Manufacturer</p>
                                    <p className="font-medium text-slate-800">
                                        {battery.manufacturer || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin lỗi */}
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center space-x-2 mb-4">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h3 className="text-lg font-semibold text-red-800">
                                    Error Information
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-red-600 mb-1">Error Type</p>
                                    <p className="font-medium text-red-800">
                                        System battery error
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-600 mb-1">Error Description</p>
                                    <p className="text-red-700">
                                        Battery has low SOH ({battery.soh}%) and needs technical inspection.
                                        May be due to improper charging/discharging or hardware failure.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-600 mb-1">Recommendation</p>
                                    <p className="text-red-700">
                                        • Check charging system<br />
                                        • Replace battery if necessary<br />
                                        • Report to technician
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin thời gian */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                Time Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Created Date</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(battery.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Last Updated</p>
                                    <p className="font-medium text-slate-800">
                                        {new Date(battery.updatedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-6 py-2"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaultyBatteryPage: React.FC = () => {
    const [batteries, setBatteries] = useState<ApiBattery[]>([]);
    const [filteredBatteries, setFilteredBatteries] = useState<ApiBattery[]>([]);
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBattery, setSelectedBattery] = useState<ApiBattery | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BatteryStatus | 'ALL'>('ALL');
    const [selectedStation, setSelectedStation] = useState<string>('ALL');
    const [limit, setLimit] = useState<string>('20');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBattery, setEditingBattery] = useState<ApiBattery | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
    const [logsOpen, setLogsOpen] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsBattery, setLogsBattery] = useState<ApiBattery | null>(null);
    const [logsData, setLogsData] = useState<{ battery: any; history: any[] } | null>(null);
    const [logsUserNameMap, setLogsUserNameMap] = useState<Record<string, string>>({});

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

    const loadFaultyBatteries = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await BatteryService.getFaultyBatteries();
            setBatteries(response.data);
            setFilteredBatteries(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading faulty battery list');
        } finally {
            setLoading(false);
        }
    };

    // Filter batteries based on search term, status, and station
    const filterBatteries = () => {
        let filtered = batteries;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(battery =>
                battery.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (battery.station?.stationName && battery.station.stationName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(battery => battery.status === statusFilter);
        }

        // Filter by station
        if (selectedStation !== 'ALL') {
            filtered = filtered.filter(battery => battery.station?._id === selectedStation);
        }

        setFilteredBatteries(filtered);
    };

    // Calculate pagination - apply after filtering
    const limitNum = Number(limit) || 20;
    const totalPages = Math.ceil(filteredBatteries.length / limitNum);
    const paginatedBatteries = filteredBatteries.slice(
        (currentPage - 1) * limitNum,
        currentPage * limitNum
    );

    // Reset to first page when filters or limit change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, selectedStation, limit]);

    useEffect(() => {
        loadStations();
        loadFaultyBatteries();
    }, []);

    useEffect(() => {
        filterBatteries();
    }, [searchTerm, statusFilter, selectedStation, batteries]);

    const handleBatteryClick = (battery: ApiBattery) => {
        setSelectedBattery(battery);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedBattery(null);
    };

    const handleEditBattery = (battery: ApiBattery) => {
        setEditingBattery(battery);
        setIsEditModalOpen(true);
    };
    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditingBattery(null);
        loadFaultyBatteries();
    };
    const handleDeleteBattery = (battery: ApiBattery) => {
        setSelectedDeleteId(battery._id);
        setIsConfirmModalOpen(true);
        setSubmitError(null);
    };
    const handleOpenLogs = async (battery: ApiBattery) => {
        try {
            setLogsBattery(battery);
            setLogsOpen(true);
            setLogsLoading(true);
            const data = await BatteryService.getBatteryLogs(battery._id);
            setLogsData(data);
            // Resolve user names for any referenced IDs
            const ids = new Set<string>();
            (data.history || []).forEach((raw: any) => {
                let item = raw;
                if (typeof raw === 'string') { try { item = JSON.parse(raw); } catch { item = {}; } }
                const uid = item.user?._id || item.driver?._id || item.user_id || item.driver_id;
                if (uid && typeof uid === 'string') ids.add(uid);
            });
            if (ids.size > 0) {
                const entries = await Promise.all(Array.from(ids).map(async (id) => {
                    try { const res = await UserService.getUserById(id); return [id, res.data.fullName] as const; } catch { return [id, 'Unknown']; }
                }));
                const map: Record<string, string> = {};
                entries.forEach(([id, name]) => { map[id] = name; });
                setLogsUserNameMap(map);
            }
        } catch (e) {
            console.error('Failed to load battery logs', e);
        } finally {
            setLogsLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!selectedDeleteId) return;
        setSubmitError(null);
        try {
            setDeletingId(selectedDeleteId);
            await BatteryService.deleteBattery(selectedDeleteId);
            setFilteredBatteries(prev => prev.filter(b => b._id !== selectedDeleteId));
            setBatteries(prev => prev.filter(b => b._id !== selectedDeleteId));
            setIsConfirmModalOpen(false);
            setSelectedDeleteId(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to delete battery';
            setSubmitError(msg);
        } finally {
            setDeletingId(null);
        }
    };

    // Remove the early return for loading state - handle it inside the CardContent like StaffListPage

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Faulty Batteries"
                description="Manage and track faulty batteries in the system"
            />

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Faulty Batteries"
                    value={batteries.length}
                    icon={BatteryIcon}
                    gradientFrom="from-red-50"
                    gradientTo="to-red-100/50"
                    textColor="text-red-900"
                    iconBg="bg-red-500"
                />
                <StatsCard
                    title="Need Repair"
                    value={batteries.length}
                    icon={AlertCircle}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
                />
                <StatsCard
                    title="Inspected"
                    value={0}
                    icon={Eye}
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
                        <h3 className="text-lg font-semibold text-slate-800">Search & Filter</h3>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by battery ID or station name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Station Filter */}
                            <Select value={selectedStation} onValueChange={setSelectedStation}>
                                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Select station" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="ALL"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        All stations
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
                                        All status
                                    </SelectItem>
                                    <SelectItem
                                        value="faulty"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Faulty
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

                            {/* Limit Filter */}
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
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setSelectedStation('ALL');
                                    setLimit('20');
                                    setCurrentPage(1);
                                }}
                                className="h-12 px-4 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Battery List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-red-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-red-100 rounded-xl mr-3">
                                <BatteryIcon className="h-6 w-6 text-red-600" />
                            </div>
                            Faulty Battery List
                            <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                {filteredBatteries.length}
                            </span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl border-red-600 hover:border-red-700'
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
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl border-red-600 hover:border-red-700'
                                    : 'hover:bg-slate-100 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <PageLoadingSpinner text="Loading faulty battery list..." />
                    ) : filteredBatteries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <BatteryIcon className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {batteries.length === 0 ? 'No faulty batteries' : 'No matching batteries found'}
                            </h3>
                            <p className="text-slate-600 text-center mb-6">
                                {batteries.length === 0
                                    ? 'Currently no batteries are faulty in the system.'
                                    : 'Try changing the search keyword or filters to see more results.'
                                }
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedBatteries.map((battery) => (
                                <FaultyBatteryCard
                                    key={battery._id}
                                    battery={battery}
                                    onClick={() => handleBatteryClick(battery)}
                                    onEdit={handleEditBattery}
                                    onDelete={handleDeleteBattery}
                                    onLogs={handleOpenLogs}
                                    deletingId={deletingId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Battery ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Model</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Station</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">SOH</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Capacity (kWh)</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Voltage (V)</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Manufacturer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedBatteries.map((battery) => {
                                        const getStatusColor = (status: BatteryStatus) => {
                                            switch (status) {
                                                case 'faulty':
                                                    return 'bg-red-100 text-red-800 border-red-200';
                                                case 'charging':
                                                    return 'bg-blue-100 text-blue-800 border-blue-200';
                                                case 'full':
                                                    return 'bg-green-100 text-green-800 border-green-200';
                                                case 'in-use':
                                                    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                                case 'idle':
                                                    return 'bg-gray-100 text-gray-800 border-gray-200';
                                                default:
                                                    return 'bg-gray-100 text-gray-800 border-gray-200';
                                            }
                                        };

                                        const getStatusText = (status: BatteryStatus) => {
                                            switch (status) {
                                                case 'faulty':
                                                    return 'Faulty';
                                                case 'charging':
                                                    return 'Charging';
                                                case 'full':
                                                    return 'Full';
                                                case 'in-use':
                                                    return 'In Use';
                                                case 'idle':
                                                    return 'Idle';
                                                default:
                                                    return 'Unknown';
                                            }
                                        };

                                        const getSohColor = (soh: number) => {
                                            if (soh >= 80) return 'text-green-600';
                                            if (soh >= 60) return 'text-yellow-600';
                                            if (soh >= 40) return 'text-orange-600';
                                            return 'text-red-600';
                                        };

                                        return (
                                            <tr
                                                key={battery._id}
                                                className="hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => handleBatteryClick(battery)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                            <BatteryIcon className="h-5 w-5 flex-shrink-0" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{battery.serial}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.model || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.station?.stationName || 'Not assigned'}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`${getStatusColor(battery.status)} border`}>
                                                        {getStatusText(battery.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium ${getSohColor(battery.soh)}`}>
                                                        {battery.soh}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.capacity_kWh || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.voltage || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-800">{battery.manufacturer || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={e => { e.stopPropagation(); handleEditBattery(battery); }}
                                                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border-slate-200"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={e => { e.stopPropagation(); handleDeleteBattery(battery); }}
                                                            disabled={deletingId === battery._id}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                                        >
                                                            {deletingId === battery._id
                                                                ? <ButtonLoadingSpinner size="sm" variant="default" text="Deleting..." />
                                                                : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination - copied logic/markup from StaffListPage */}
            {filteredBatteries.length > 0 && (
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
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i === 4 ? totalPages : i + 1;
                                if (i === 3) {
                                    return (
                                        <React.Fragment key={`fragment-${i}`}>
                                            <div className="min-h-[38px] min-w-[38px] flex justify-center items-center border border-gray-300 bg-white text-gray-500 py-2 px-3 text-sm">...</div>
                                            <button
                                                key={totalPages}
                                                type="button"
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`min-h-[38px] min-w-[38px] flex justify-center items-center border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentPage === totalPages
                                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
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
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
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
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"}`}
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
                        Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * limitNum + 1}</span> to {" "}
                        <span className="font-semibold text-slate-900">{Math.min(currentPage * limitNum, filteredBatteries.length)}</span> of {" "}
                        <span className="font-semibold text-slate-900">{filteredBatteries.length}</span> results
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <FaultyBatteryDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                battery={selectedBattery}
            />
            <EditBatteryModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingBattery(null); }}
                onSuccess={handleEditSuccess}
                battery={editingBattery ? {
                    id: editingBattery._id,
                    batteryId: editingBattery.serial,
                    stationId: editingBattery.station?._id || '',
                    stationName: editingBattery.station?.stationName || 'Unknown Station',
                    status: editingBattery.status as any,
                    soh: editingBattery.soh,
                    voltage: editingBattery.voltage || 0,
                    current: 0,
                    temperature: 0,
                    cycleCount: 0,
                    lastMaintenance: new Date(editingBattery.updatedAt),
                    createdAt: new Date(editingBattery.createdAt),
                    updatedAt: new Date(editingBattery.updatedAt),
                    model: editingBattery.model,
                    manufacturer: editingBattery.manufacturer,
                    capacity_kWh: editingBattery.capacity_kWh,
                    price: (editingBattery as any).price || 0,
                } : null}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => { setIsConfirmModalOpen(false); setSelectedDeleteId(null); setSubmitError(null); }}
                onConfirm={handleConfirmDelete}
                title="Confirm delete battery"
                message={<div>Are you sure you want to delete this battery? This action cannot be undone.{submitError && (<div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-3 mb-1 rounded-lg"><AlertCircle className="h-5 w-5 mr-1 text-red-600 flex-shrink-0" /><span className="font-medium">{submitError}</span></div>)}</div>}
                confirmText="Delete"
                variant="delete"
                isLoading={!!deletingId}
            />

            {/* Battery Logs Modal */}
            {logsOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setLogsOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-amber-100 rounded-xl">
                                        <BookOpen className="h-8 w-8 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Battery Logs</h2>
                                        <p className="text-slate-500">Battery #{logsBattery?.serial}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setLogsOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-100">×</Button>
                            </div>

                            {logsLoading ? (
                                <div className="py-10 flex justify-center"><Spinner /></div>
                            ) : logsData ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="text-slate-500 text-sm">Status</div>
                                            <div className="font-semibold text-slate-900 capitalize">{logsData.battery.status}</div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="text-slate-500 text-sm">SOH</div>
                                            <div className="font-semibold text-slate-900">{logsData.battery.soh}%</div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="text-slate-700 font-semibold mb-3">History</div>
                                        {logsData.history && logsData.history.length > 0 ? (
                                            <ul className="space-y-3">
                                                {logsData.history.map((raw, idx) => {
                                                    let item: any = raw;
                                                    if (typeof raw === 'string') {
                                                        try { item = JSON.parse(raw); } catch { item = { details: raw }; }
                                                    }
                                                    const at = item.at || item.createdAt || item.updatedAt;
                                                    const time = at ? new Date(at) : null;
                                                    const idGuess = item.user?._id || item.driver?._id || item.user_id || item.driver_id;
                                                    const driverName = item.driver?.name || item.user?.fullName || item.user?.name || (idGuess ? logsUserNameMap[idGuess] : undefined);
                                                    // Only show vehicle if we have a friendly plate/name
                                                    const vehicle = item.vehicle?.plate || item.vehiclePlate || item.vehicleName || undefined;
                                                    const soh = item.soh ?? item.SOH ?? undefined;
                                                    const action = (item.action || item.status || 'update') as string;
                                                    const stationName = item.station?.stationName || item.station?.name || undefined;
                                                    const details = item.details || '';
                                                    const actionColor =
                                                        action === 'swap' ? 'bg-blue-100 border-blue-200 text-blue-700'
                                                            : action === 'return' ? 'bg-green-100 border-green-200 text-green-700'
                                                                : action === 'check-out' || action === 'checkout' ? 'bg-amber-100 border-amber-200 text-amber-700'
                                                                    : 'bg-slate-100 border-slate-200 text-slate-700';
                                                    return (
                                                        <li key={idx} className="border rounded-lg p-3 bg-white">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <span className={`px-2 py-0.5 text-xs rounded-full border capitalize ${actionColor}`}>{action}</span>
                                                                {time && <span className="text-xs text-slate-500">{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(time)}</span>}
                                                                {typeof soh === 'number' && <span className="text-xs text-slate-600">SOH: <span className="font-semibold">{soh}%</span></span>}
                                                            </div>
                                                            <div className="text-sm text-slate-800">
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                                    {driverName && <span><span className="text-slate-500">User:</span> {driverName}</span>}
                                                                    {vehicle && <span><span className="text-slate-500">Vehicle:</span> {vehicle}</span>}
                                                                    {stationName && <span><span className="text-slate-500">Station:</span> {stationName}</span>}
                                                                </div>
                                                                {details && <div className="mt-1 text-slate-700">{details}</div>}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="text-slate-600 text-sm">No history entries.</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-600">No data.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaultyBatteryPage;
