import React, { useState } from 'react';
import type { BatterySwapTransaction } from '../types/batteryChanges.types';

interface BatterySwapTableProps {
  transactions: BatterySwapTransaction[];
  onViewDetails: (batteryId: string) => void;
}

const BatterySwapTable: React.FC<BatterySwapTableProps> = ({ 
  transactions, 
  onViewDetails 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const statusStyles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getSOHColor = (soh: number): string => {
    if (soh >= 90) return 'text-green-600 font-semibold';
    if (soh >= 80) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // Empty state UI
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Battery Swap Transactions (0)
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-4">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            No Battery Swap Transactions Yet
          </h4>
          <p className="text-sm text-gray-500 text-center max-w-md">
            There are no battery swap transactions to display. Transactions will appear here once drivers start swapping batteries at the stations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Battery Swap Transactions ({transactions.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver & Vehicle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Battery Returned
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Battery Given
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTransactions.map((transaction) => (
              <tr key={transaction.transaction_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.transaction_id}
                  </div>
                  <div className="text-xs text-gray-500">
                    by {transaction.processedBy}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDateTime(transaction.timestamp)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.driver.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.driver.vehicle}
                  </div>
                  <div className="text-xs text-gray-400">
                    {transaction.driver.phone}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.station.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.station.location}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <button
                      onClick={() => onViewDetails(transaction.batteryReturned.id)}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {transaction.batteryReturned.id}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.batteryReturned.model}
                  </div>
                  <div className={`text-xs ${getSOHColor(transaction.batteryReturned.sohBefore)}`}>
                    SOH: {transaction.batteryReturned.sohBefore}% | {transaction.batteryReturned.chargeLevel}%
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <button
                      onClick={() => onViewDetails(transaction.batteryGiven.id)}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {transaction.batteryGiven.id}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.batteryGiven.model}
                  </div>
                  <div className={`text-xs ${getSOHColor(transaction.batteryGiven.sohAfter)}`}>
                    SOH: {transaction.batteryGiven.sohAfter}% | {transaction.batteryGiven.chargeLevel}%
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDuration(transaction.duration)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.cost)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    Export
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatterySwapTable;

