interface Transaction {
  transaction_id: string;
  user_name: string;
  station_name: string;
  transaction_time: string;
  cost: number;
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

export default function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Empty state UI
  if (transactions.length === 0) {
    return (
      <div 
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            Recent Transactions
          </h3>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md"
          >
            View All
          </button>
        </div>
        
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            No Transactions Yet
          </h4>
          <p className="text-sm text-gray-500 text-center max-w-md">
            There are no recent transactions to display. Transactions will appear here once customers start using the battery swap service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-gray-900">
          Recent Transactions
        </h3>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md"
        >
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 bg-gray-50 border-gray-200">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-900">
                Transaction ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-900">
                Customer
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-900">
                Station
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-900">
                Time
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase text-gray-900">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr 
                key={transaction.transaction_id} 
                className={`border-b transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              >
                <td className="px-3 py-3 text-sm font-medium text-gray-900">
                  {transaction.transaction_id}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600">
                  {transaction.user_name}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600">
                  {transaction.station_name}
                </td>
                <td className="px-3 py-3 text-sm text-gray-600">
                  {formatDateTime(transaction.transaction_time)}
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-right text-green-600">
                  {formatCurrency(transaction.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

