import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CreditCard,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    Calendar,
    DollarSign,
    TrendingUp,
    Users
} from 'lucide-react';
import { toast } from 'sonner';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/StatsCard';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { TransactionService, type Transaction as ApiTransaction } from '@/services/api/transactionService';
import { StationService, type Station as ApiStation } from '@/services/api/stationService';
import type { Transaction, TransactionFilters } from '../types/transaction';

export const TransactionPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState<TransactionFilters>({
        search: '',
        stationId: 'all',
        date: '',
        minCost: 0,
        maxCost: 0
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
                user_id: filters.userId && filters.userId !== 'all' ? filters.userId : undefined,
                station_id: filters.stationId && filters.stationId !== 'all' ? filters.stationId : undefined,
                limit: 200
            };

            const response = await TransactionService.getAllTransactions(apiFilters);
            const apiTransactions = response.data;

            // Convert API transactions to UI format
            const convertedTransactions: Transaction[] = apiTransactions.map((apiTransaction: ApiTransaction) => {
                const station = stations.find(s => s.id === apiTransaction.station_id);

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
                    // Additional fields for display
                    userName: `User ${apiTransaction.user_id}`,
                    stationName: station?.name || 'Trạm không xác định',
                    vehicleName: null, // Not available in API
                    batterySerial: null, // Not available in API
                    bookingStatus: null // Not available in API
                };
            });

            // Apply filters
            const filteredTransactions = convertedTransactions.filter(transaction => {
                // Search filter
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    const matchesSearch = (
                        transaction.transactionId.toLowerCase().includes(searchTerm) ||
                        transaction.userName.toLowerCase().includes(searchTerm) ||
                        transaction.stationName.toLowerCase().includes(searchTerm) ||
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
            toast.success('Successfully loaded transaction list');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error loading transaction list';
            setError(errorMessage);
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

    const handleViewTransactionDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleRefresh = () => {
        loadTransactions();
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
            maxCost: 0
        });
    };

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
                    value={new Intl.NumberFormat('vi-VN', {
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
                    title="Chi phí trung bình"
                    value={new Intl.NumberFormat('vi-VN', {
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
                    title="Người dùng"
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
                        <h3 className="text-lg font-semibold text-slate-800">Tìm kiếm & Lọc</h3>
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
                                    <SelectValue placeholder="Chọn trạm" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm z-50 max-h-[300px] overflow-y-auto [&_[data-state=checked]]:bg-blue-100 [&_[data-state=checked]]:text-blue-700 [&_[data-state=checked]]:rounded-lg [&_[data-state=checked]_svg]:hidden [&_[data-radix-collection-item]]:justify-start [&_[data-radix-collection-item]]:px-3">
                                    <SelectItem
                                        value="all"
                                        className="rounded-lg hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
                                    >
                                        Tất cả trạm
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
                            <Input
                                type="date"
                                placeholder="Chọn ngày"
                                value={filters.date}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                className="w-full sm:w-[200px] h-12 bg-white/90 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-xl text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200"
                            />

                            {/* Filter Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleClearFilters}
                                className="h-12 w-12 bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
                            >
                                <Filter className="h-5 w-5" />
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
                                {filters.search || filters.userId || filters.stationId
                                    ? 'No transactions found matching the current filters.'
                                    : 'No transactions in the system yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {transactions.map((transaction) => (
                                <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    onViewDetails={handleViewTransactionDetails}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                transaction={selectedTransaction}
            />
        </div>
    );
};
