import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, MapPin } from 'lucide-react';
import type { Transaction } from '../types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails: (t: Transaction) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(amount);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);

const getType = (t: Transaction) => {
  if (t.batteryGiven && t.batteryReturned) return <Badge variant="default">Swap</Badge>;
  if (t.batteryGiven) return <Badge variant="success">Pick</Badge>;
  if (t.batteryReturned) return <Badge variant="warning">Return</Badge>;
  return <Badge variant="secondary">Unknown</Badge>;
};

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onViewDetails }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Transaction</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Station</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <CreditCard className="h-4 w-4 text-green-600" /> {t.transactionId}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-700">{t.userName || t.userId}</td>
              <td className="py-3 px-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" /> {t.stationName || t.stationId}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-1 text-purple-600" /> {formatDateTime(t.transactionTime)}
                </div>
              </td>
              <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(t.cost)}</td>
              <td className="py-3 px-4">{getType(t)}</td>
              <td className="py-3 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(t)}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-200 hover:shadow-sm"
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;


