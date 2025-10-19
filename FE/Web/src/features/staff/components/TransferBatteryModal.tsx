import { useState } from 'react';
import { X, MapPin, Battery as BatteryIcon, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { mockStations, type Station } from '../../../mock';
import { BatteryLocationService } from '../../../services/batteryLocationService';
import type { Battery } from '../apis/DashboardApi';

interface TransferBatteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  batteries: Battery[];
  currentStation?: string;
}

export default function TransferBatteryModal({ 
  isOpen, 
  onClose, 
  batteries,
  currentStation = "ST001" 
}: TransferBatteryModalProps) {
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [targetStation, setTargetStation] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  if (!isOpen) return null;

  const availableBatteries = batteries.filter(
    b => b.status === "charging" || b.status === "full" || b.status === "idle"
  );

  const availableStations = mockStations.filter(
    station => station.station_id !== currentStation
  );

  const toggleBatterySelection = (batteryId: string) => {
    setSelectedBatteries(prev => 
      prev.includes(batteryId)
        ? prev.filter(id => id !== batteryId)
        : [...prev, batteryId]
    );
  };

  const handleTransfer = () => {
    if (selectedBatteries.length === 0 || !targetStation) return;
    
    const selectedStation = mockStations.find(s => s.station_id === targetStation);
    if (!selectedStation) return;
    
    setIsTransferring(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save the transfer to localStorage
      BatteryLocationService.transferBatteries(
        selectedBatteries,
        targetStation,
        selectedStation.station_name
      );
      
      setIsTransferring(false);
      setTransferSuccess(true);
      
      // Reset after showing success
      setTimeout(() => {
        setTransferSuccess(false);
        setSelectedBatteries([]);
        setTargetStation("");
        onClose();
      }, 2000);
    }, 1500);
  };

  const selectedStation = mockStations.find(s => s.station_id === targetStation);
  const currentStationData = mockStations.find(s => s.station_id === currentStation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-bg-tertiary">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-button-primary rounded-lg">
              <MapPin className="w-6 h-6 text-text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary"> Chuyển đến Trạm</h2>
              <p className="text-sm text-text-secondary mt-1">
                Trạm hiện tại: {currentStationData?.station_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {transferSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-green-600 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Transfer Successful!</h3>
              <p className="text-text-secondary">
                {selectedBatteries.length} {selectedBatteries.length === 1 ? 'battery' : 'batteries'} transferred to {selectedStation?.station_name}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Battery Selection */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BatteryIcon className="w-5 h-5" />
                  Chọn Pin ({selectedBatteries.length} đã chọn)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {availableBatteries.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Không có pin nào để chuyển
                    </div>
                  ) : (
                    availableBatteries.map((battery) => (
                      <div
                        key={battery._id}
                        onClick={() => toggleBatterySelection(battery._id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedBatteries.includes(battery._id)
                            ? 'border-button-primary bg-button-primary/20'
                            : 'border-border hover:border-border-light bg-bg-tertiary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-text-primary">
                            {battery.serial}
                          </span>
                          {selectedBatteries.includes(battery._id) && (
                            <CheckCircle className="w-5 h-5 text-button-primary" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Mẫu:</span>
                            <span className="text-text-primary">{battery.model || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Dung lượng:</span>
                            <span className="text-text-primary">{battery.capacity_kWh || 0} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Tình trạng:</span>
                            <span className={`font-semibold ${
                              battery.soh >= 90 ? 'text-green-400' :
                              battery.soh >= 70 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {battery.soh}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Trạng thái:</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              battery.status === 'full' ? 'bg-green-600 text-white' :
                              battery.status === 'charging' ? 'bg-blue-600 text-white' :
                              battery.status === 'faulty' ? 'bg-red-600 text-white' :
                              battery.status === 'in-use' ? 'bg-yellow-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {battery.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Station Selection */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Chọn Trạm
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {availableStations.map((station) => (
                    <div
                      key={station.station_id}
                      onClick={() => setTargetStation(station.station_id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        targetStation === station.station_id
                          ? 'border-button-primary bg-button-primary/20'
                          : 'border-border hover:border-border-light bg-bg-tertiary'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-button-primary" />
                          <span className="font-semibold text-text-primary">
                            {station.station_name}
                          </span>
                        </div>
                        {targetStation === station.station_id && (
                          <CheckCircle className="w-5 h-5 text-button-primary" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-text-secondary">Vị trí:</span>
                          <span className="text-text-primary flex-1">{station.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Dung lượng</span>
                          <span className="text-text-primary font-medium">{station.capacity} batteries</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Station ID:</span>
                          <span className="text-text-primary font-mono text-xs">{station.station_id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transfer Summary */}
          {!transferSuccess && selectedBatteries.length > 0 && targetStation && (
            <div className="mt-6 p-4 bg-button-primary/10 border border-button-primary rounded-lg">
              <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-button-primary" />
                Transfer Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div>
                  <p className="text-text-secondary text-sm mb-1"></p>
                  <p className="text-text-primary font-semibold">{currentStationData?.station_name}</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-8 h-8 text-button-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">To</p>
                  <p className="text-text-primary font-semibold">{selectedStation?.station_name}</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-text-secondary text-sm">
                  Transferring <span className="text-button-primary font-semibold">{selectedBatteries.length}</span> {selectedBatteries.length === 1 ? 'battery' : 'batteries'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!transferSuccess && (
          <div className="flex gap-4 justify-end p-6 border-t border-border bg-bg-tertiary">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg border-2 border-border bg-bg-secondary text-text-primary hover:bg-button-secondary-hover transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={selectedBatteries.length === 0 || !targetStation || isTransferring}
              className="px-8 py-3 rounded-lg bg-button-primary text-text-primary hover:bg-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
            >
              {isTransferring ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Confirm Transfer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

