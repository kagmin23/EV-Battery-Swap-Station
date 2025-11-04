import { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { TransactionService, type Transaction as ApiTransaction } from '@/services/api/transactionService';
import { UserService } from '@/services/api/userService';

// Extended Transaction interface for UI (optional payment fields if backend provides)
interface PaymentTransactionUI extends ApiTransaction {
  user_name?: string;
  station_name?: string;
  payment_method?: 'credit_card' | 'e_wallet' | 'cash' | 'subscription';
  payment_status?: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_reference?: string;
}

export default function PaymentHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransactionUI | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransactionUI[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setTransactions([]);
          setError('User not found. Please login again.');
          return;
        }
        const user = JSON.parse(userStr) as { station?: string };
        if (!user.station) {
          setTransactions([]);
          setError('No station assigned to this staff member.');
          return;
        }

        const response = await TransactionService.getTransactionsByStation(user.station, 200);
        const apiTransactions = response.data || [];

        // Fetch user details for all unique user IDs
        const uniqueUserIds = Array.from(new Set(apiTransactions.map((t: ApiTransaction) => t.user_id)));
        const userDetailsMap = new Map<string, string>();

        // Fetch user details in parallel
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userResponse = await UserService.getUserById(userId);
              if (userResponse.success && userResponse.data) {
                userDetailsMap.set(userId, userResponse.data.fullName || userResponse.data.email);
              }
            } catch (err) {
              console.error(`Failed to fetch user details for ${userId}:`, err);
              // Keep the ID as fallback
            }
          })
        );

        // Enrich transactions with user names
        const converted: PaymentTransactionUI[] = apiTransactions.map((t: ApiTransaction) => ({
          ...t,
          user_name: userDetailsMap.get(t.user_id),
        }));

        setTransactions(converted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      transaction.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate statistics
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.cost || 0), 0);
  const totalTransactions = transactions.length;
  const todayTransactions = transactions.filter(t => 
    new Date(t.transaction_time).toDateString() === new Date().toDateString()
  ).length;
  const todayRevenue = transactions
    .filter(t => new Date(t.transaction_time).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + (t.cost || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    console.log('Exporting payment history...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Payment History</h1>
          <p className="text-text-secondary mt-1">Track and manage all payment transactions</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-100 to-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalRevenue)}
            </div>
              <p className="text-xs text-green-700 mt-1">From all transactions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {totalTransactions}
            </div>
              <p className="text-xs text-blue-700 mt-1">All time transactions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {formatCurrency(todayRevenue)}
            </div>
              <p className="text-xs text-yellow-700 mt-1">Revenue from today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {todayTransactions}
            </div>
              <p className="text-xs text-purple-700 mt-1">Transactions today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by transaction ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <Badge variant="secondary">{filteredTransactions.length} transactions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr 
                      key={transaction.transaction_id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {transaction.transaction_id}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {transaction.user_name || transaction.user_id}
                        </div>
                        {transaction.user_name && (
                          <div className="text-xs text-slate-500">
                            ID: {transaction.user_id}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatDateTime(transaction.transaction_time)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatCurrency(transaction.cost)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Transaction Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Transaction ID</p>
                  <p className="font-semibold">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Time</p>
                  <p className="font-semibold">{formatDateTime(selectedTransaction.transaction_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-semibold">{selectedTransaction.user_name || selectedTransaction.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer ID</p>
                  <p className="font-semibold">{selectedTransaction.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Station ID</p>
                  <p className="font-semibold">{selectedTransaction.station_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedTransaction.cost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Battery Installed</p>
                  <p className="font-semibold">{selectedTransaction.battery_given || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Battery Removed</p>
                  <p className="font-semibold">{selectedTransaction.battery_returned || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
