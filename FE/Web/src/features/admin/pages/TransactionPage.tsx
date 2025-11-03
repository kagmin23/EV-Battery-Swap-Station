import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CreditCard,
    Search,
    AlertCircle,
    DollarSign,
    TrendingUp,
    Users,
    RotateCcw,
    Grid,
    List,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import axios from 'axios';
import { TransactionService, type Transaction as ApiTransaction } from '@/services/api/transactionService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import { UserService, type User } from '@/services/api/userService';
import { BatteryService, type Battery } from '@/services/api/batteryService';
import type { Transaction, TransactionFilters } from '../types/transaction';

const API_BASE_URL = 'http://localhost:8001/api';

// Helper function to create authenticated axios instance
const createApiRequest = () => {
    const token = localStorage.getItem('accessToken');
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
};

export const TransactionPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filters, setFilters] = useState<TransactionFilters>({
        search: '',
        stationId: 'all',
        date: '',
        minCost: 0,
        maxCost: 0,
        limit: '20'
    });

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


    // Load transactions data
    const loadTransactions = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const apiFilters = {
                station_id: filters.stationId && filters.stationId !== 'all' ? filters.stationId : undefined,
                limit: filters.limit ? Number(filters.limit) : 20
            };

            const response = await TransactionService.getAllTransactions(apiFilters);
            const apiTransactions = response.data;

            // Get unique IDs to fetch details
            const uniqueUserIds = [...new Set(apiTransactions.map((t: ApiTransaction) => t.user_id).filter(Boolean))];
            const uniqueBatteryIds = [...new Set(apiTransactions.map((t: ApiTransaction) => t.battery_id).filter(Boolean))];
            const uniqueVehicleIds = [...new Set(apiTransactions.map((t: ApiTransaction) => t.vehicle_id).filter(Boolean))];
            const uniqueBookingIds = [...new Set(apiTransactions.map((t: ApiTransaction) => t.booking_id).filter(Boolean))];
            
            const api = createApiRequest();
            
            // Fetch all details in parallel
            const [userMap, batteryMap, vehicleMap, bookingMap] = await Promise.all([
                // Fetch user details
                (async () => {
                    const map = new Map<string, User>();
                    await Promise.all(
                        uniqueUserIds.map(async (userId) => {
                            try {
                                const userResponse = await UserService.getUserById(userId);
                                if (userResponse.success && userResponse.data) {
                                    map.set(userId, userResponse.data);
                                }
                            } catch (err) {
                                console.error(`Error fetching user ${userId}:`, err);
                            }
                        })
                    );
                    return map;
                })(),
                // Fetch battery details
                (async () => {
                    const map = new Map<string, Battery>();
                    await Promise.all(
                        uniqueBatteryIds.map(async (batteryId) => {
                            try {
                                const battery = await BatteryService.getBatteryById(batteryId);
                                map.set(batteryId, battery);
                            } catch (err) {
                                console.error(`Error fetching battery ${batteryId}:`, err);
                            }
                        })
                    );
                    return map;
                })(),
                // Fetch vehicle details
                (async () => {
                    const map = new Map<string, any>();
                    await Promise.all(
                        uniqueVehicleIds.map(async (vehicleId) => {
                            try {
                                const response = await api.get(`/vehicles/${vehicleId}`);
                                if (response.data.success && response.data.data) {
                                    map.set(vehicleId, response.data.data);
                                }
                            } catch (err) {
                                console.error(`Error fetching vehicle ${vehicleId}:`, err);
                            }
                        })
                    );
                    return map;
                })(),
                // Fetch booking details
                (async () => {
                    const map = new Map<string, any>();
                    await Promise.all(
                        uniqueBookingIds.map(async (bookingId) => {
                            try {
                                const response = await api.get(`/booking/${bookingId}`);
                                if (response.data.success && response.data.data) {
                                    map.set(bookingId, response.data.data);
                                }
                            } catch (err) {
                                console.error(`Error fetching booking ${bookingId}:`, err);
                            }
                        })
                    );
                    return map;
                })(),
            ]);

            // Convert API transactions to UI format
            const convertedTransactions: Transaction[] = apiTransactions.map((apiTransaction: ApiTransaction) => {
                const station = stations.find(s => s.id === apiTransaction.station_id);
                const user = userMap.get(apiTransaction.user_id);
                const battery = apiTransaction.battery_id ? batteryMap.get(apiTransaction.battery_id) : null;
                const vehicle = apiTransaction.vehicle_id ? vehicleMap.get(apiTransaction.vehicle_id) : null;
                const booking = apiTransaction.booking_id ? bookingMap.get(apiTransaction.booking_id) : null;

                // Build vehicle name
                let vehicleName: string | undefined = undefined;
                if (vehicle) {
                    const parts: string[] = [];
                    if (vehicle.car_name) parts.push(vehicle.car_name);
                    if (vehicle.brand) parts.push(vehicle.brand);
                    if (vehicle.license_plate) parts.push(`(${vehicle.license_plate})`);
                    vehicleName = parts.length > 0 ? parts.join(' ') : vehicle.license_plate || undefined;
                }

                // Build booking description
                let bookingDescription: string | undefined = undefined;
                if (booking) {
                    const parts: string[] = [];
                    if (booking.station_name) parts.push(`Station: ${booking.station_name}`);
                    if (booking.scheduled_time) {
                        const scheduledDate = new Date(booking.scheduled_time);
                        parts.push(`Scheduled: ${scheduledDate.toLocaleString()}`);
                    }
                    if (booking.status) parts.push(`Status: ${booking.status}`);
                    bookingDescription = parts.join(' | ') || undefined;
                }

                return {
                    id: apiTransaction.transaction_id,
                    transactionId: apiTransaction.transaction_id,
                    userId: apiTransaction.user_id,
                    stationId: apiTransaction.station_id,
                    batteryGiven: apiTransaction.battery_given,
                    batteryReturned: apiTransaction.battery_returned,
                    vehicleId: apiTransaction.vehicle_id,
                    batteryId: apiTransaction.battery_id,
                    bookingId: apiTransaction.booking_id,
                    transactionTime: new Date(apiTransaction.transaction_time),
                    cost: apiTransaction.cost,
                    status: 'completed' as const, // Transactions are completed when they exist
                    // Additional fields for display
                    userName: user?.fullName || user?.email || 'User',
                    stationName: station?.name || 'Station',
                    vehicleName: vehicleName,
                    batterySerial: battery?.serial || undefined,
                    batteryModel: battery?.model || undefined,
                    bookingStatus: booking?.status || undefined,
                    bookingDescription: bookingDescription
                };
            });

            // Apply filters
            const filteredTransactions = convertedTransactions.filter(transaction => {
                // Search filter
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    const matchesSearch = (
                        transaction.transactionId.toLowerCase().includes(searchTerm) ||
                        (transaction.userName && transaction.userName.toLowerCase().includes(searchTerm)) ||
                        (transaction.stationName && transaction.stationName.toLowerCase().includes(searchTerm)) ||
                        (transaction.batteryGiven && transaction.batteryGiven.toLowerCase().includes(searchTerm)) ||
                        (transaction.batteryReturned && transaction.batteryReturned.toLowerCase().includes(searchTerm))
                    );
                    if (!matchesSearch) return false;
                }

                // Date filter
                if (filters.date) {
                    const transactionDate = new Date(transaction.transactionTime);
                    const filterDate = new Date(filters.date);
                    const isSameDate = transactionDate.toDateString() === filterDate.toDateString();
                    if (!isSameDate) return false;
                }


                // Station filter
                if (filters.stationId && filters.stationId !== 'all') {
                    if (transaction.stationId !== filters.stationId) return false;
                }

                return true;
            });

            setTransactions(filteredTransactions);
            // Success message removed to avoid notification spam
            // Note: Filtering is done client-side, pagination will be handled in render
        } catch (err) {
            setTransactions([]);
            setError('Unable to load transactions. Please try again later.');
            console.error('Error loading transactions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            await loadStations();
        };
        loadData();
    }, []);

    // Load transactions when filters change
    useEffect(() => {
        if (stations.length > 0) {
            loadTransactions();
        }
    }, [filters, stations]);

    const handleViewTransactionDetails = async (transaction: Transaction) => {
        try {
            // Clear previous transaction and open modal to show loading state
            setSelectedTransaction(null);
            setIsDetailModalOpen(true);
            
            // Fetch full transaction details from API
            const response = await TransactionService.getTransactionById(transaction.transactionId);
            const apiTransaction = response.data;
            
            const api = createApiRequest();
            
            // Fetch all related details in parallel
            const [station, userResponse, batteryResponse, vehicleResponse, bookingResponse] = await Promise.all([
                // Station
                Promise.resolve(stations.find(s => s.id === apiTransaction.station_id)),
                // User
                UserService.getUserById(apiTransaction.user_id).catch(() => null),
                // Battery
                apiTransaction.battery_id 
                    ? BatteryService.getBatteryById(apiTransaction.battery_id).catch(() => null)
                    : Promise.resolve(null),
                // Vehicle
                apiTransaction.vehicle_id
                    ? api.get(`/vehicles/${apiTransaction.vehicle_id}`).catch(() => null)
                    : Promise.resolve(null),
                // Booking
                apiTransaction.booking_id
                    ? api.get(`/booking/${apiTransaction.booking_id}`).catch(() => null)
                    : Promise.resolve(null),
            ]);
            
            const user = userResponse?.success ? userResponse.data : null;
            const battery = batteryResponse || null;
            const vehicle = vehicleResponse?.data?.success ? vehicleResponse.data.data : null;
            const booking = bookingResponse?.data?.success ? bookingResponse.data.data : null;

            // Build vehicle name
            let vehicleName: string | undefined = undefined;
            if (vehicle) {
                const parts: string[] = [];
                if (vehicle.car_name) parts.push(vehicle.car_name);
                if (vehicle.brand) parts.push(vehicle.brand);
                if (vehicle.license_plate) parts.push(`(${vehicle.license_plate})`);
                vehicleName = parts.length > 0 ? parts.join(' ') : vehicle.license_plate || undefined;
            }

            // Build booking description
            let bookingDescription: string | undefined = undefined;
            if (booking) {
                const parts: string[] = [];
                if (booking.station_name) parts.push(`Station: ${booking.station_name}`);
                if (booking.scheduled_time) {
                    const scheduledDate = new Date(booking.scheduled_time);
                    parts.push(`Scheduled: ${scheduledDate.toLocaleString()}`);
                }
                if (booking.status) parts.push(`Status: ${booking.status}`);
                bookingDescription = parts.join(' | ') || undefined;
            }
            
            // Convert API transaction to UI format
            const detailedTransaction: Transaction = {
                id: apiTransaction.transaction_id,
                transactionId: apiTransaction.transaction_id,
                userId: apiTransaction.user_id,
                stationId: apiTransaction.station_id,
                batteryGiven: apiTransaction.battery_given || null,
                batteryReturned: apiTransaction.battery_returned || null,
                vehicleId: apiTransaction.vehicle_id,
                batteryId: apiTransaction.battery_id,
                bookingId: apiTransaction.booking_id,
                transactionTime: new Date(apiTransaction.transaction_time),
                cost: apiTransaction.cost,
                status: 'completed' as const,
                // Additional fields for display
                userName: user?.fullName || user?.email || 'User',
                stationName: station?.name || 'Station',
                vehicleName: vehicleName,
                batterySerial: battery?.serial || undefined,
                batteryModel: battery?.model || undefined,
                bookingStatus: booking?.status || undefined,
                bookingDescription: bookingDescription
            };
            
            setSelectedTransaction(detailedTransaction);
        } catch (err) {
            console.error('Error fetching transaction details:', err);
            // Fallback to using the transaction from the list if API call fails
            setSelectedTransaction(transaction);
            // Optionally show error message
            setError('Failed to load transaction details. Showing available information.');
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleFilterChange = (key: keyof TransactionFilters, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            stationId: 'all',
            date: '',
            minCost: 0,
            maxCost: 0,
            limit: '20'
        });
        setCurrentPage(1);
    };

    // Calculate pagination
    const limitNum = Number(filters.limit) || 20;
    const totalPages = Math.ceil(transactions.length / limitNum);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * limitNum,
        currentPage * limitNum
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.stationId, filters.date, filters.limit]);

    // Calculate stats
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.cost, 0);
    const averageCost = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const uniqueUsers = new Set(transactions.map(t => t.userId)).size;

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <PageHeader
                title="Transaction Management"
                description="Track and manage all battery swap transactions"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Transactions"
                    value={totalTransactions}
                    icon={CreditCard}
                    gradientFrom="from-blue-50"
                    gradientTo="to-blue-100/50"
                    textColor="text-blue-900"
                    iconBg="bg-blue-500"
                />
                <StatsCard
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'VND',
                        notation: 'compact'
                    }).format(totalRevenue)}
                    icon={DollarSign}
                    gradientFrom="from-green-50"
                    gradientTo="to-green-100/50"
                    textColor="text-green-900"
                    iconBg="bg-green-500"
                />
                <StatsCard
                    title="Average Cost"
                    value={new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'VND',
                        notation: 'compact'
                    }).format(averageCost)}
                    icon={TrendingUp}
                    gradientFrom="from-purple-50"
                    gradientTo="to-purple-100/50"
                    textColor="text-purple-900"
                    iconBg="bg-purple-500"
                />
                <StatsCard
                    title="Users"
                    value={uniqueUsers}
                    icon={Users}
                    gradientFrom="from-orange-50"
                    gradientTo="to-orange-100/50"
                    textColor="text-orange-900"
                    iconBg="bg-orange-500"
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

                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <Input
                                placeholder="Search by transaction ID, user, station, battery..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-12 h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Station Filter */}
                            <Select
                                value={filters.stationId}
                                onValueChange={(value) => handleFilterChange('stationId', value)}
                            >
                                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200">
                                    <SelectValue placeholder="Select Station" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="all"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        All Stations
                                    </SelectItem>
                                    {stations.map((station) => (
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

                            {/* Date Filter */}
                            <div className="relative w-full sm:w-[200px]">
                                <Input
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    className="w-full h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                />
                            </div>

                            {/* Limit Filter */}
                            <Select
                                value={filters.limit}
                                onValueChange={(value) => handleFilterChange('limit', value)}
                            >
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
                                onClick={handleClearFilters}
                                className="h-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-slate-700 px-4 whitespace-nowrap"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50/50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                            <div className="p-2 bg-green-100 rounded-xl mr-3">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            Transaction List
                            <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                {transactions.length}
                            </span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`h-9 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white'} rounded-lg`}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={`h-9 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white'} rounded-lg`}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="m-0 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <PageLoadingSpinner text="Loading transaction list..." />
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <CreditCard className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions found</h3>
                            <p className="text-slate-600 text-center mb-6">
                                {filters.search || filters.stationId !== 'all'
                                    ? 'No transactions found matching the current filters.'
                                    : 'No transactions in the system yet.'}
                            </p>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedTransactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        onViewDetails={handleViewTransactionDetails}
                                    />
                                ))}
                            </div>
                        ) : (
                            <TransactionTable transactions={paginatedTransactions} onViewDetails={handleViewTransactionDetails} />
                        )
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && transactions.length > 0 && totalPages > 1 && (
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
                        <span className="font-semibold text-slate-900">{Math.min(currentPage * limitNum, transactions.length)}</span> of{" "}
                        <span className="font-semibold text-slate-900">{transactions.length}</span> results
                    </div>
                </div>
            )}

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                transaction={selectedTransaction}
            />
        </div>
    );
};
