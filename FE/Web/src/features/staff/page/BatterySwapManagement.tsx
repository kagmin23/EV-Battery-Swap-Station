import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Battery as BatteryIcon, Zap, AlertCircle, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { BatterySwapService, type Pillar, type GridSlot, type Battery } from '@/services/api/batterySwapService';
import { BatteryService } from '@/services/api/batteryService';

export default function BatterySwapManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [pillarGrid, setPillarGrid] = useState<GridSlot[][] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<GridSlot | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [slotToRemove, setSlotToRemove] = useState<GridSlot | null>(null);
  const [availableBatteries, setAvailableBatteries] = useState<Battery[]>([]);
  const [stationId, setStationId] = useState<string>('');

  useEffect(() => {
    const loadPillars = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError('User not found. Please login again.');
          return;
        }

        const user = JSON.parse(userStr) as { station?: string };
        if (!user.station) {
          setError('No station assigned to this staff member.');
          return;
        }

        setStationId(user.station);
        const pillarsList = await BatterySwapService.getPillarsByStation(user.station);
        
        // Ensure we have a valid array
        if (!Array.isArray(pillarsList)) {
          console.error('Pillars is not an array:', pillarsList);
          throw new Error('Invalid pillars data received');
        }
        
        setPillars(pillarsList);

        // Auto-select first pillar
        if (pillarsList.length > 0) {
          await loadPillarGrid(pillarsList[0]);
        }
      } catch (err) {
        console.error('Error loading pillars:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load pillars';
        setError(errorMessage);
        setPillars([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPillars();
  }, []);

  const loadPillarGrid = async (pillar: Pillar) => {
    try {
      if (!pillar || !pillar._id) {
        throw new Error('Invalid pillar data');
      }
      
      setSelectedPillar(pillar);
      const gridData = await BatterySwapService.getPillarGrid(pillar._id, 2, 5);
      
      if (!gridData || !gridData.grid) {
        throw new Error('Invalid grid data received');
      }
      
      setPillarGrid(gridData.grid);
    } catch (err) {
      console.error('Error loading pillar grid:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load pillar grid');
    }
  };

  const loadAvailableBatteries = async () => {
    try {
      // Get all batteries from the station with a large limit to avoid pagination issues
      const allBatteries = await BatteryService.getBatteriesByStation(stationId, {
        limit: 1000 // Set a high limit to get all batteries
      });
      
      // Filter batteries that are available for assignment:
      // - Status must NOT be 'in-use' (currently being used by a vehicle)
      // - Must NOT have currentSlot or currentPillar (not already assigned to a slot)
      const availableList = (allBatteries.data as Battery[]).filter(battery => {
        const isNotInUse = battery.status !== 'in-use';
        const isNotAssigned = !battery.currentSlot && !battery.currentPillar;
        return isNotInUse && isNotAssigned;
      });
      
      setAvailableBatteries(availableList);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load available batteries');
    }
  };

  const handleSlotClick = async (slot: GridSlot) => {
    setSelectedSlot(slot);
    
    // Only allow assignment if:
    // 1. Slot has no battery object
    // 2. Slot status is 'empty' or status doesn't match reality
    if (!slot.battery) {
      if (slot.status === 'reserved') {
        toast.error('This slot is reserved and cannot be assigned');
        return;
      }
      
      // Open assign modal for truly empty slots
      await loadAvailableBatteries();
      setShowAssignModal(true);
    }
  };

  const handleAssignBattery = async (batteryId: string) => {
    if (!selectedSlot) return;

    try {
      await BatterySwapService.assignBatteryToSlot({
        batteryId,
        slotId: selectedSlot._id
      });

      toast.success('Battery assigned successfully');
      setShowAssignModal(false);
      setSelectedSlot(null);

      // Reload pillar stats and grid
      if (selectedPillar) {
        const pillarsList = await BatterySwapService.getPillarsByStation(stationId);
        setPillars(pillarsList);
        
        // Find the updated pillar object from the new list
        const updatedPillar = pillarsList.find(p => p._id === selectedPillar._id);
        if (updatedPillar) {
          await loadPillarGrid(updatedPillar);
        }
      }
    } catch (err) {
      console.error('Error assigning battery:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign battery';
      toast.error(errorMessage);
    }
  };

  const handleRemoveBattery = (slot: GridSlot) => {
    if (!slot.battery) {
      toast.error('No battery to remove');
      return;
    }

    setSlotToRemove(slot);
    setShowRemoveModal(true);
  };

  const confirmRemoveBattery = async () => {
    if (!slotToRemove || !slotToRemove.battery) return;

    try {
      await BatterySwapService.removeBatteryFromSlot({
        slotId: slotToRemove._id
      });

      toast.success('Battery removed successfully');
      setShowRemoveModal(false);
      setSlotToRemove(null);

      // Reload pillar stats and grid
      if (selectedPillar) {
        const pillarsList = await BatterySwapService.getPillarsByStation(stationId);
        setPillars(pillarsList);
        
        // Find the updated pillar object from the new list
        const updatedPillar = pillarsList.find(p => p._id === selectedPillar._id);
        if (updatedPillar) {
          await loadPillarGrid(updatedPillar);
        }
      }
    } catch (err) {
      console.error('Error removing battery:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to remove battery');
      // Close modal even on error so user can see the grid state
      setShowRemoveModal(false);
      setSlotToRemove(null);
    }
  };

  const handleUpdateBatteryStatus = async (battery: Battery, newStatus: Battery['status']) => {
    try {
      await BatteryService.updateBatteryStatus(battery._id, newStatus as 'full' | 'charging' | 'faulty' | 'in-use' | 'idle');
      toast.success(`Battery status updated to ${newStatus}`);

      // Reload pillar stats and grid
      if (selectedPillar) {
        const pillarsList = await BatterySwapService.getPillarsByStation(stationId);
        setPillars(pillarsList);
        
        // Find the updated pillar object from the new list
        const updatedPillar = pillarsList.find(p => p._id === selectedPillar._id);
        if (updatedPillar) {
          await loadPillarGrid(updatedPillar);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update battery status');
    }
  };

  const getStatusColor = (slot: GridSlot) => {
    // Check if slot actually has a battery, not just the status
    if (slot.battery) {
      return 'bg-green-100 border-green-400'; // Occupied with battery
    }
    
    if (slot.status === 'reserved') {
      return 'bg-yellow-100 border-yellow-400'; // Reserved
    }
    
    return 'bg-gray-100 border-gray-300'; // Empty
  };

  const getBatteryStatusBadge = (status: Battery['status']) => {
    const config: Record<Battery['status'], { label: string; className: string }> = {
      full: { label: 'Full', className: 'bg-green-100 text-green-800' },
      charging: { label: 'Charging', className: 'bg-blue-100 text-blue-800' },
      idle: { label: 'Idle', className: 'bg-gray-100 text-gray-800' },
      'in-use': { label: 'In Use', className: 'bg-purple-100 text-purple-800' },
      'is-booking': { label: 'Booked', className: 'bg-yellow-100 text-yellow-800' },
      faulty: { label: 'Faulty', className: 'bg-red-100 text-red-800' }
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <TableSkeleton rows={5} columns={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Battery Swap Management</h1>
          <p className="text-text-secondary mt-1">Manage battery slots and assignments</p>
        </div>
        <Button
          onClick={() => selectedPillar && loadPillarGrid(selectedPillar)}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pillar Selection */}
      {pillars.length === 0 ? (
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="py-12">
            <div className="text-center text-slate-500">
              <Zap className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold mb-2">No Pillars Found</h3>
              <p>There are no battery swap pillars at this station yet.</p>
              <p className="text-sm mt-1">Contact your administrator to set up pillars.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pillars.map((pillar) => (
          <Card
            key={pillar._id}
            className={`cursor-pointer transition-all ${
              selectedPillar?._id === pillar._id
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                : 'hover:shadow-md'
            }`}
            onClick={() => loadPillarGrid(pillar)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{pillar.pillarName}</span>
                <Badge variant={pillar.status === 'active' ? 'default' : 'secondary'}>
                  {pillar.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Slots:</span>
                  <span className="font-semibold">{pillar.slotStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Occupied:</span>
                  <span className="font-semibold">{pillar.slotStats.occupied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Empty:</span>
                  <span className="font-semibold">{pillar.slotStats.empty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Reserved:</span>
                  <span className="font-semibold">{pillar.slotStats.reserved}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Pillar Grid View */}
      {selectedPillar && pillarGrid && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedPillar.pillarName} - Slot Grid</span>
              <Badge variant="secondary">
                {selectedPillar.slotStats.occupied}/{selectedPillar.slotStats.total} Occupied
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Grid */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(5, minmax(0, 1fr))` }}>
                {pillarGrid.flat().map((slot) => (
                  <div
                    key={slot._id}
                    className={`relative border-2 rounded-lg p-4 transition-all cursor-pointer ${getStatusColor(
                      slot
                    )} hover:shadow-md`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {/* Slot Number */}
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Slot {slot.slotNumber}
                    </div>

                    {/* Battery Info or Empty */}
                    {slot.battery ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BatteryIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold truncate">
                            {slot.battery.serial}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          SOH: {slot.battery.soh}%
                        </div>
                        <div>{getBatteryStatusBadge(slot.battery.status)}</div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBattery(slot);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>

                        {/* Status Change Dropdown */}
                        {slot.battery.status === 'idle' && (
                          <select
                            className="text-xs border rounded px-2 py-1 w-full"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              if (slot.battery) {
                                handleUpdateBatteryStatus(slot.battery, e.target.value as Battery['status']);
                              }
                            }}
                            value={slot.battery.status}
                          >
                            <option value="idle">Idle</option>
                            <option value="charging">Charging</option>
                            <option value="full">Full</option>
                            <option value="faulty">Faulty</option>
                          </select>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="text-xs">Empty</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {slot.status === 'reserved' && (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Battery Modal */}
      {showAssignModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Assign Battery to Slot {selectedSlot.slotNumber}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedSlot(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-slate-600 flex-1">
                    Only showing batteries that are not in use and not already assigned to any slot.
                  </p>
                  {availableBatteries.length > 0 && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {availableBatteries.length} available
                    </span>
                  )}
                </div>

                {availableBatteries.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <BatteryIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold">No Available Batteries</p>
                    <p className="text-sm mt-1">All batteries are either assigned to slots or currently in use.</p>
                  </div>
                ) : (
                  <div 
                    className="max-h-[500px] overflow-y-auto pr-2 space-y-2"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 #f1f5f9'
                    }}
                  >
                    {availableBatteries.map((battery) => (
                      <div
                        key={battery._id}
                        className="border rounded-lg p-3 hover:bg-slate-50 hover:border-purple-300 cursor-pointer transition-all"
                        onClick={() => handleAssignBattery(battery._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <BatteryIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-sm">{battery.serial}</div>
                              <div className="text-xs text-slate-600">{battery.model}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-semibold">SOH: {battery.soh}%</div>
                            <Badge className="bg-green-100 text-green-800 mt-0.5 text-xs px-2 py-0.5">
                              {battery.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Remove Battery Confirmation Modal */}
      {showRemoveModal && slotToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirm Battery Removal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-slate-700">
                  Are you sure you want to remove this battery?
                </p>
                
                {slotToRemove.battery && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BatteryIcon className="h-5 w-5 text-slate-600" />
                        <span className="font-semibold text-slate-900">
                          {slotToRemove.battery.serial}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <div>Model: {slotToRemove.battery.model}</div>
                        <div>SOH: {slotToRemove.battery.soh}%</div>
                        <div>Slot: {slotToRemove.slotNumber}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowRemoveModal(false);
                      setSlotToRemove(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={confirmRemoveBattery}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Battery
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

