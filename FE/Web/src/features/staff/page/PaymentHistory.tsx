import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableSkeleton, CardSkeleton } from '@/components/ui/table-skeleton';

// Extended Transaction interface with payment details
interface PaymentTransaction {
  transaction_id: string;
  user_id: string;
  user_name: string;
  station_id: string;
  station_name: string;
  battery_given: string;
  battery_returned: string;
  transaction_time: string;
  cost: number;
  payment_method: 'credit_card' | 'e_wallet' | 'cash' | 'subscription';
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_reference?: string;
}

// Mock payment data
const mockPaymentTransactions: PaymentTransaction[] = [
  {
    transaction_id: "TXN001",
    user_id: "USR001",
    user_name: "Nguyen Van A",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT015",
    battery_returned: "BAT008",
    transaction_time: "2025-10-15T08:30:00",
    cost: 150000,
    payment_method: 'e_wallet',
    payment_status: 'completed',
    payment_reference: 'EW-001-2025'
  },
  {
    transaction_id: "TXN002",
    user_id: "USR002",
    user_name: "Tran Thi B",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT021",
    battery_returned: "BAT002",
    transaction_time: "2025-10-15T09:15:00",
    cost: 180000,
    payment_method: 'credit_card',
    payment_status: 'completed',
    payment_reference: 'CC-002-2025'
  },
  {
    transaction_id: "TXN003",
    user_id: "USR003",
    user_name: "Le Van C",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT012",
    battery_returned: "BAT018",
    transaction_time: "2025-10-15T10:00:00",
    cost: 160000,
    payment_method: 'subscription',
    payment_status: 'completed',
    payment_reference: 'SUB-003-2025'
  },
  {
    transaction_id: "TXN004",
    user_id: "USR004",
    user_name: "Pham Thi D",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT017",
    battery_returned: "BAT001",
    transaction_time: "2025-10-15T11:20:00",
    cost: 170000,
    payment_method: 'cash',
    payment_status: 'completed',
    payment_reference: 'CASH-004-2025'
  },
  {
    transaction_id: "TXN005",
    user_id: "USR005",
    user_name: "Hoang Van E",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT022",
    battery_returned: "BAT014",
    transaction_time: "2025-10-15T12:45:00",
    cost: 165000,
    payment_method: 'e_wallet',
    payment_status: 'pending',
    payment_reference: 'EW-005-2025'
  },
  {
    transaction_id: "TXN006",
    user_id: "USR006",
    user_name: "Vo Thi F",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT009",
    battery_returned: "BAT013",
    transaction_time: "2025-10-15T13:10:00",
    cost: 155000,
    payment_method: 'credit_card',
    payment_status: 'failed',
    payment_reference: 'CC-006-2025'
  },
  {
    transaction_id: "TXN007",
    user_id: "USR007",
    user_name: "Nguyen Van G",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT019",
    battery_returned: "BAT007",
    transaction_time: "2025-10-15T14:30:00",
    cost: 175000,
    payment_method: 'subscription',
    payment_status: 'completed',
    payment_reference: 'SUB-007-2025'
  },
  {
    transaction_id: "TXN008",
    user_id: "USR001",
    user_name: "Nguyen Van A",
    station_id: "ST001",
    station_name: "Downtown Swap Station",
    battery_given: "BAT011",
    battery_returned: "BAT016",
    transaction_time: "2025-10-14T16:45:00",
    cost: 145000,
    payment_method: 'e_wallet',
    payment_status: 'refunded',
    payment_reference: 'EW-008-2025'
  },
];

export default function PaymentHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [isLoading] = useState(false); // Set to true when integrating real API

  // Filter transactions
  const filteredTransactions = mockPaymentTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.payment_status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.payment_method === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  // Calculate statistics
  const totalRevenue = mockPaymentTransactions
    .filter(t => t.payment_status === 'completed')
    .reduce((sum, t) => sum + t.cost, 0);
  
  const pendingAmount = mockPaymentTransactions
    .filter(t => t.payment_status === 'pending')
    .reduce((sum, t) => sum + t.cost, 0);

  const completedCount = mockPaymentTransactions.filter(t => t.payment_status === 'completed').length;
  const todayTransactions = mockPaymentTransactions.filter(t => 
    new Date(t.transaction_time).toDateString() === new Date().toDateString()
  ).length;

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

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed', color: 'text-green-600' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending', color: 'text-yellow-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed', color: 'text-red-600' },
      refunded: { variant: 'outline' as const, icon: TrendingUp, label: 'Refunded', color: 'text-blue-600' }
    };
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Credit Card',
      e_wallet: 'E-Wallet',
      cash: 'Cash',
      subscription: 'Subscription'
    };
    return labels[method] || method;
  };

  const handleExport = () => {
    console.log('Exporting payment history...');
    // Implement export functionality
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        
        {/* Stats Cards Skeleton */}
        <CardSkeleton count={4} />
        
        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
          <TableSkeleton rows={10} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Lịch sử Thanh toán</h1>
          <p className="text-text-secondary mt-1">Theo dõi và quản lý tất cả giao dịch thanh toán</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-100 to-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">Từ giao dịch hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {completedCount}
            </div>
            <p className="text-xs text-blue-700 mt-1">Thanh toán thành công</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Đang chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-yellow-700 mt-1">Chờ xác nhận</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Giao dịch hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {todayTransactions}
            </div>
            <p className="text-xs text-purple-700 mt-1">Giao dịch hôm nay</p>
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
                placeholder="Tìm theo mã giao dịch, tên khách hàng hoặc mã tham chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="refunded">Đã hoàn trả</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full md:w-48">
                <CreditCard className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="subscription">Đăng ký</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lịch sử giao dịch</span>
            <Badge variant="secondary">{filteredTransactions.length} giao dịch</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Mã giao dịch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Ngày & Giờ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Không tìm thấy giao dịch
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
                        <div className="text-xs text-slate-500">
                          {transaction.payment_reference}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {transaction.user_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {transaction.user_id}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatDateTime(transaction.transaction_time)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatCurrency(transaction.cost)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">
                          {getPaymentMethodLabel(transaction.payment_method)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.payment_status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
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
                <CardTitle>Chi tiết Giao dịch</CardTitle>
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
                  <p className="text-sm text-slate-600">Mã giao dịch</p>
                  <p className="font-semibold">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Trạng thái</p>
                  {getStatusBadge(selectedTransaction.payment_status)}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Khách hàng</p>
                  <p className="font-semibold">{selectedTransaction.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Mã khách hàng</p>
                  <p className="font-semibold">{selectedTransaction.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Trạm</p>
                  <p className="font-semibold">{selectedTransaction.station_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Thời gian</p>
                  <p className="font-semibold">{formatDateTime(selectedTransaction.transaction_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pin đã lắp</p>
                  <p className="font-semibold">{selectedTransaction.battery_given}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pin đã tháo</p>
                  <p className="font-semibold">{selectedTransaction.battery_returned}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phương thức thanh toán</p>
                  <p className="font-semibold">{getPaymentMethodLabel(selectedTransaction.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Mã tham chiếu</p>
                  <p className="font-semibold">{selectedTransaction.payment_reference}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Số tiền</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedTransaction.cost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
