import { useState, useEffect } from 'react';
import { Battery, User, CheckCircle, ArrowRight, Clock, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getSwapRequests, confirmSwapRequest } from '../apis/SwapApi';
import type { SwapRequest } from '../apis/SwapApi';
import { Spinner } from '@/components/ui/spinner';

export default function ConfirmExchange() {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
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
      // Auto-select first pending request
      const pendingRequest = data.find(req => req.status === 'pending');
      if (pendingRequest) {
        setSelectedRequest(pendingRequest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch swap requests');
      console.error('Error fetching swap requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExchange = async () => {
    if (!selectedRequest) return;

    try {
      setIsConfirming(true);
      await confirmSwapRequest(selectedRequest._id);
      toast.success('Battery swap confirmed successfully!');
      // Refresh the list
      await fetchSwapRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to confirm battery swap');
    } finally {
      setIsConfirming(false);
    }
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
            <p className="text-text-secondary">Review and confirm battery swap transaction</p>
          </div>
          <button
            onClick={fetchSwapRequests}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Swap Requests List */}
        {swapRequests.length > 1 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Request List ({swapRequests.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {swapRequests.map((request) => (
                <div
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedRequest?._id === request._id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{request.driver.fullName}</span>
                    {selectedRequest?._id === request._id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{request.driver.phoneNumber}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRequest && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Driver Information Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Driver Information</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Name</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.driver.fullName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Phone</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.driver.phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.driver.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedRequest.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    selectedRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Old Battery Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Battery to Remove</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Serial Number</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.oldBattery.serial}</span>
                </div>
                {selectedRequest.oldBattery.model && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Model</span>
                    <span className="text-gray-900 font-medium">{selectedRequest.oldBattery.model}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.oldBattery.status}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Health (SOH)</span>
                  <span className={`font-bold text-lg ${
                    selectedRequest.oldBattery.soh >= 90 ? 'text-green-600' :
                    selectedRequest.oldBattery.soh >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedRequest.oldBattery.soh}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* New Battery Card (if assigned) */}
          {selectedRequest.newBattery && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Replacement Battery</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Serial Number</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.newBattery.serial}</span>
                </div>
                {selectedRequest.newBattery.model && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Model</span>
                    <span className="text-gray-900 font-medium">{selectedRequest.newBattery.model}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className="text-gray-900 font-medium">{selectedRequest.newBattery.status}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Health (SOH)</span>
                  <span className={`font-bold text-lg ${
                    selectedRequest.newBattery.soh >= 90 ? 'text-green-600' :
                    selectedRequest.newBattery.soh >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedRequest.newBattery.soh}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Exchange Summary */}
          {selectedRequest.newBattery && (
            <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-blue-600" />
                Battery Swap Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Remove</p>
                  <p className="text-gray-900 font-bold text-lg">{selectedRequest.oldBattery.serial}</p>
                  <p className="text-red-600 text-sm">SOH: {selectedRequest.oldBattery.soh}%</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Install</p>
                  <p className="text-gray-900 font-bold text-lg">{selectedRequest.newBattery.serial}</p>
                  <p className="text-green-600 text-sm">SOH: {selectedRequest.newBattery.soh}%</p>
                </div>
              </div>
            </div>
          )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmExchange}
                disabled={selectedRequest.status !== 'pending' || isConfirming}
                className="px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
              >
                {isConfirming ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Battery Swap
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}