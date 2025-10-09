import React from 'react';
import type { BatteryHistory } from '../types/batteryChanges.types';

interface BatteryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batteryId: string;
  batteryHistory: BatteryHistory | null;
}

const BatteryDetailsModal: React.FC<BatteryDetailsModalProps> = ({
  isOpen,
  onClose,
  batteryId,
  batteryHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                🔋 Battery Details - {batteryId}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {batteryHistory ? (
              <>
                {/* Battery Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium mb-1">Battery Model</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {batteryHistory.battery_model}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-600 font-medium mb-1">Current SOH</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {batteryHistory.currentSOH}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Initial: {batteryHistory.initialSOH}%
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-purple-600 font-medium mb-1">Total Swaps</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {batteryHistory.totalSwaps}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg cycle: {batteryHistory.averageCycleTime.toFixed(1)}h
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Degradation Rate</span>
                      <span className="text-lg font-semibold text-red-600">
                        {(batteryHistory.degradationRate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${batteryHistory.degradationRate * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Per 100 cycles
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Health Status</span>
                      <span className={`text-lg font-semibold ${
                        batteryHistory.currentSOH >= 90 ? 'text-green-600' :
                        batteryHistory.currentSOH >= 80 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {batteryHistory.currentSOH >= 90 ? 'Excellent' :
                         batteryHistory.currentSOH >= 80 ? 'Good' :
                         batteryHistory.currentSOH >= 70 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          batteryHistory.currentSOH >= 90 ? 'bg-green-500' :
                          batteryHistory.currentSOH >= 80 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${batteryHistory.currentSOH}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last swap: {new Date(batteryHistory.lastSwapDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Swap History Timeline */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📜 Recent Swap History
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {batteryHistory.swapHistory.length > 0 ? (
                      batteryHistory.swapHistory.map((swap, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">
                                {swap.station}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Driver: {swap.driver}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(swap.date).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                <span className="text-gray-500">SOH: </span>
                                <span className={`font-semibold ${
                                  swap.sohBefore >= 90 ? 'text-green-600' :
                                  swap.sohBefore >= 80 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {swap.sohBefore}%
                                </span>
                                <span className="text-gray-400 mx-1">→</span>
                                <span className={`font-semibold ${
                                  swap.sohAfter >= 90 ? 'text-green-600' :
                                  swap.sohAfter >= 80 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {swap.sohAfter}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No swap history available
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {batteryHistory.currentSOH < 85 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div>
                        <div className="font-semibold text-yellow-800 mb-1">
                          Maintenance Recommended
                        </div>
                        <div className="text-sm text-yellow-700">
                          This battery has SOH below 85%. Consider scheduling maintenance or replacement.
                          {batteryHistory.currentSOH < 70 && (
                            <span className="block mt-1 font-semibold">
                              ⚠️ Critical: SOH below 70% - Immediate action required!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  Battery Not Found
                </div>
                <div className="text-sm text-gray-500">
                  No detailed history available for battery {batteryId}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            {batteryHistory && (
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Export Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDetailsModal;

