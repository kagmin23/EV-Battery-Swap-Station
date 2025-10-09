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

  return (
    <div 
      className="backdrop-blur-md p-6 rounded-xl shadow-lg"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: '1px',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Recent Transactions
        </h3>
        <button 
          className="px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-md"
          style={{ 
            backgroundColor: 'var(--color-button-primary)',
            color: 'var(--color-text-primary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
        >
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr 
              className="border-b-2"
              style={{ 
                backgroundColor: 'var(--color-table-header)',
                borderBottomColor: 'var(--color-border-light)'
              }}
            >
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                Transaction ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                Customer
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                Station
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                Time
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr 
                key={transaction.transaction_id} 
                className="border-b transition-colors"
                style={{ 
                  backgroundColor: index % 2 === 0 ? 'var(--color-table-row)' : 'transparent',
                  borderBottomColor: 'var(--color-border)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-table-row-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--color-table-row)' : 'transparent'}
              >
                <td className="px-3 py-3 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {transaction.transaction_id}
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {transaction.user_name}
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {transaction.station_name}
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDateTime(transaction.transaction_time)}
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-right" style={{ color: 'var(--color-accent-pink)' }}>
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

