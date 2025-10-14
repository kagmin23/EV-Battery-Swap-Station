import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🔋 Chi tiết pin - {batteryId}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và lịch sử sử dụng của pin
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {batteryHistory ? (
            <>
              {/* Battery Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">Model pin</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {batteryHistory.battery_model}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">Sức khỏe hiện tại</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {batteryHistory.currentSOH}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Ban đầu: {batteryHistory.initialSOH}%
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium mb-1">Tổng lần đổi</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {batteryHistory.totalSwaps}
                  </div>
                  <div className="text-xs text-gray-500">
                    Chu kỳ TB: {batteryHistory.averageCycleTime.toFixed(1)}h
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Tỷ lệ suy giảm</span>
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
                    Mỗi 100 chu kỳ
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Trạng thái sức khỏe</span>
                    <span className={`text-lg font-semibold ${batteryHistory.currentSOH >= 90 ? 'text-green-600' :
                        batteryHistory.currentSOH >= 80 ? 'text-yellow-600' :
                          'text-red-600'
                      }`}>
                      {batteryHistory.currentSOH >= 90 ? 'Tuyệt vời' :
                        batteryHistory.currentSOH >= 80 ? 'Tốt' :
                          batteryHistory.currentSOH >= 70 ? 'Khá' : 'Kém'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${batteryHistory.currentSOH >= 90 ? 'bg-green-500' :
                          batteryHistory.currentSOH >= 80 ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                      style={{ width: `${batteryHistory.currentSOH}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Lần đổi cuối: {new Date(batteryHistory.lastSwapDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Swap History Timeline */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📜 Lịch sử đổi pin gần đây
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
                              Tài xế: {swap.driver}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(swap.date).toLocaleString('vi-VN')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="text-gray-500">SOH: </span>
                              <span className={`font-semibold ${swap.sohBefore >= 90 ? 'text-green-600' :
                                  swap.sohBefore >= 80 ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                {swap.sohBefore}%
                              </span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span className={`font-semibold ${swap.sohAfter >= 90 ? 'text-green-600' :
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
                      Không có lịch sử đổi pin
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
                        Khuyến nghị bảo trì
                      </div>
                      <div className="text-sm text-yellow-700">
                        Pin này có SOH dưới 85%. Hãy cân nhắc lên lịch bảo trì hoặc thay thế.
                        {batteryHistory.currentSOH < 70 && (
                          <span className="block mt-1 font-semibold">
                            ⚠️ Nghiêm trọng: SOH dưới 70% - Cần hành động ngay lập tức!
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
                Không tìm thấy pin
              </div>
              <div className="text-sm text-gray-500">
                Không có lịch sử chi tiết cho pin {batteryId}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {batteryHistory && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              Chỉnh sửa
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatteryDetailsModal;

