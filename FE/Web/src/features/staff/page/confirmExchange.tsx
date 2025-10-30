import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, RefreshCw, Eye, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getSwapRequests, confirmSwapRequest } from '../apis/SwapApi';
import type { SwapRequest } from '../apis/SwapApi';
import { Spinner } from '@/components/ui/spinner';

export default function ConfirmExchange() {
  const navigate = useNavigate();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  const fetchSwapRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSwapRequests();
      setSwapRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch swap requests');
      console.error('Error fetching swap requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/staff/swap-request/${requestId}`);
  };

  const handleConfirmExchange = async (request: SwapRequest) => {
    try {
      setIsConfirming(request.booking_id || request._id || '');
      const requestId = request.booking_id || request._id;
      if (!requestId) {
        throw new Error('Request ID not found');
      }
      await confirmSwapRequest(requestId);
      toast.success('Battery swap confirmed successfully!');
      // Refresh the list
      await fetchSwapRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to confirm battery swap');
    } finally {
      setIsConfirming(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading battery swap requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-2">Data Loading Error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSwapRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (swapRequests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Battery className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">No Battery Swap Requests</p>
          <p className="text-gray-600">Currently there are no battery swap requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">Confirm Battery Swap</h1>
            <p className="text-text-secondary">Review and confirm battery swap transactions</p>
          </div>
          <button
            onClick={fetchSwapRequests}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Swap Requests Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Battery Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {swapRequests.map((request) => {
                  const requestId = request.booking_id || request._id || '';
                  const isConfirmingThis = isConfirming === requestId;
                  
                  return (
                    <tr key={requestId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.battery_info.serial}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.station_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.scheduled_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(requestId)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmExchange(request)}
                              disabled={isConfirmingThis}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Confirm Swap"
                            >
                              {isConfirmingThis ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600">
          <div>
            Total requests: <span className="font-semibold text-gray-900">{swapRequests.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}