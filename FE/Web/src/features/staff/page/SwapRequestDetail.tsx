import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Battery, User, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getSwapRequests, confirmSwapRequest } from '../apis/SwapApi';
import type { SwapRequest } from '../apis/SwapApi';
import { Spinner } from '@/components/ui/spinner';

export default function SwapRequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [swapRequest, setSwapRequest] = useState<SwapRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSwapRequest();
  }, [requestId]);

  const fetchSwapRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSwapRequests();
      const request = data.find(req => 
        (req.booking_id || req._id) === requestId
      );
      
      if (!request) {
        throw new Error('Swap request not found');
      }
      
      setSwapRequest(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch swap request');
      console.error('Error fetching swap request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExchange = async () => {
    if (!swapRequest) return;

    try {
      setIsConfirming(true);
      const requestId = swapRequest.booking_id || swapRequest._id;
      if (!requestId) {
        throw new Error('Request ID not found');
      }
      await confirmSwapRequest(requestId);
      toast.success('Battery swap confirmed successfully!');
      // Navigate back to the list
      navigate('/staff/confirm-exchange');
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
          <p className="text-gray-600">Loading swap request details...</p>
        </div>
      </div>
    );
  }

  if (error || !swapRequest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-2">Data Loading Error</p>
          <p className="text-gray-600 mb-4">{error || 'Swap request not found'}</p>
          <button
            onClick={() => navigate('/staff/confirm-exchange')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/confirm-exchange')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-2">Swap Request Details</h1>
              <p className="text-text-secondary">Review and confirm battery swap transaction</p>
            </div>
          </div>
        </div>

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
                <span className="text-gray-900 font-medium">{swapRequest.user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Phone</span>
                <span className="text-gray-900 font-medium">{swapRequest.user.phone}</span>
              </div>
              {swapRequest.user.email && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-900 font-medium">{swapRequest.user.email}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  swapRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  swapRequest.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  swapRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {swapRequest.status}
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
                <span className="text-gray-900 font-medium">{swapRequest.battery_info.serial}</span>
              </div>
              {swapRequest.battery_info.model && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Model</span>
                  <span className="text-gray-900 font-medium">{swapRequest.battery_info.model}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Status</span>
                <span className="text-gray-900 font-medium">{swapRequest.battery_info.status}</span>
              </div>
              {swapRequest.battery_info.manufacturer && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Manufacturer</span>
                  <span className="text-gray-900 font-medium">{swapRequest.battery_info.manufacturer}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Health (SOH)</span>
                <span className={`font-bold text-lg ${
                  swapRequest.battery_info.soh >= 90 ? 'text-green-600' :
                  swapRequest.battery_info.soh >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {swapRequest.battery_info.soh}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Station Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Station Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Station Name</span>
              <span className="text-gray-900 font-medium">{swapRequest.station_name}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Scheduled Time</span>
              <span className="text-gray-900 font-medium">
                {new Date(swapRequest.scheduled_time).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Battery Details Summary */}
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Battery className="w-6 h-6 text-blue-600" />
            Battery Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center bg-white p-4 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Battery Serial</p>
              <p className="text-gray-900 font-bold text-lg">{swapRequest.battery_info.serial}</p>
              <p className="text-gray-600 text-xs mt-1">{swapRequest.battery_info.model}</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">State of Health</p>
              <p className={`font-bold text-lg ${
                swapRequest.battery_info.soh >= 90 ? 'text-green-600' :
                swapRequest.battery_info.soh >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {swapRequest.battery_info.soh}%
              </p>
              {swapRequest.battery_info.capacity_kWh && (
                <p className="text-gray-600 text-xs mt-1">
                  Capacity: {swapRequest.battery_info.capacity_kWh} kWh
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate('/staff/confirm-exchange')}
            className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleConfirmExchange}
            disabled={swapRequest.status !== 'pending' || isConfirming}
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
      </div>
    </div>
  );
}
