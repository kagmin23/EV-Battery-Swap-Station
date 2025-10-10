import { useState } from 'react';
import { Battery, User, Car, CheckCircle, ArrowRight, Clock, Zap } from 'lucide-react';

interface BatteryInfo {
  id: string;
  model: string;
  capacity: number;
  soh: number;
  status: string;
}

export default function ConfirmExchange() {
  const [selectedBattery, setSelectedBattery] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Mock data - replace with actual API calls
  const driverInfo = {
    name: "John Doe",
    phone: "+84 912 345 678",
    vehicle: "Tesla Model S",
    licensePlate: "29A-12345"
  };

  const oldBattery: BatteryInfo = {
    id: "BAT-001",
    model: "Tesla Model S 100kWh",
    capacity: 100,
    soh: 85,
    status: "in_use"
  };

  const availableBatteries: BatteryInfo[] = [
    { id: "BAT-101", model: "Tesla Model S 100kWh", capacity: 100, soh: 98, status: "available" },
    { id: "BAT-102", model: "Tesla Model S 100kWh", capacity: 100, soh: 95, status: "available" },
    { id: "BAT-103", model: "Tesla Model S 100kWh", capacity: 100, soh: 92, status: "available" },
  ];

  const handleConfirmExchange = () => {
    setIsConfirming(true);
    // Simulate API call
    setTimeout(() => {
      alert('Battery exchange confirmed successfully!');
      setIsConfirming(false);
      // Reset or redirect
    }, 2000);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Confirm Battery Exchange</h1>
          <p className="text-text-secondary">Review and confirm the battery swap transaction</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Driver Information Card */}
          <div className="bg-bg-tertiary border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-button-primary rounded-lg">
                <User className="w-6 h-6 text-text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Driver Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Name</span>
                <span className="text-text-primary font-medium">{driverInfo.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Phone</span>
                <span className="text-text-primary font-medium">{driverInfo.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle
                </span>
                <span className="text-text-primary font-medium">{driverInfo.vehicle}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">License Plate</span>
                <span className="text-text-primary font-medium text-lg">{driverInfo.licensePlate}</span>
              </div>
            </div>
          </div>

          {/* Old Battery Card */}
          <div className="bg-bg-tertiary border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600 rounded-lg">
                <Battery className="w-6 h-6 text-text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Battery to Remove</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Battery ID</span>
                <span className="text-text-primary font-medium">{oldBattery.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Model</span>
                <span className="text-text-primary font-medium">{oldBattery.model}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Capacity</span>
                <span className="text-text-primary font-medium">{oldBattery.capacity} kWh</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">State of Health</span>
                <span className={`font-bold text-lg ${oldBattery.soh >= 90 ? 'text-green-400' :
                  oldBattery.soh >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                  {oldBattery.soh}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Batteries Section */}
        <div className="bg-bg-tertiary border border-border rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-button-primary rounded-lg">
              <Zap className="w-6 h-6 text-text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Select Replacement Battery</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableBatteries.map((battery) => (
              <div
                key={battery.id}
                onClick={() => setSelectedBattery(battery.id)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedBattery === battery.id
                  ? 'border-button-primary bg-button-primary/20'
                  : 'border-border hover:border-border-light'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-text-primary font-semibold">{battery.id}</span>
                  {selectedBattery === battery.id && (
                    <CheckCircle className="w-5 h-5 text-button-primary" />
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Model:</span>
                    <span className="text-text-primary">{battery.model.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Capacity:</span>
                    <span className="text-text-primary font-medium">{battery.capacity} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SOH:</span>
                    <span className={`font-bold ${battery.soh >= 95 ? 'text-green-400' :
                      battery.soh >= 90 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                      {battery.soh}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Summary */}
        {selectedBattery && (
          <div className="bg-bg-secondary border border-button-primary rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <ArrowRight className="w-6 h-6 text-button-primary" />
              Exchange Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-text-secondary text-sm mb-1">Removing</p>
                <p className="text-text-primary font-bold text-lg">{oldBattery.id}</p>
                <p className="text-red-400 text-sm">SOH: {oldBattery.soh}%</p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-8 h-8 text-button-primary" />
              </div>
              <div className="text-center">
                <p className="text-text-secondary text-sm mb-1">Installing</p>
                <p className="text-text-primary font-bold text-lg">{selectedBattery}</p>
                <p className="text-green-400 text-sm">
                  SOH: {availableBatteries.find(b => b.id === selectedBattery)?.soh}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-lg border-2 border-border text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmExchange}
            disabled={!selectedBattery || isConfirming}
            className="px-8 py-3 rounded-lg bg-button-primary text-text-primary hover:bg-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            {isConfirming ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm Exchange
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}