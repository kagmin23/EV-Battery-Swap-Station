import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Battery as BatteryIcon, 
  TrendingUp, 
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBatteryLogs, getStationById } from '../apis/BatteryLogApi';
import type { BatteryDetail, Station, BatteryLogEntry } from '../apis/BatteryLogApi';
import { Spinner } from '@/components/ui/spinner';

export default function BatteryLog() {
  const { batteryId } = useParams<{ batteryId: string }>();
  const navigate = useNavigate();
  const [batteryData, setBatteryData] = useState<BatteryDetail | null>(null);
  const [logs, setLogs] = useState<BatteryLogEntry[]>([]);
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatteryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!batteryId) {
          throw new Error('Battery ID not provided');
        }
        
        const data = await getBatteryLogs(batteryId);
        setBatteryData(data.battery);
        setLogs(data.history || []);

        // Fetch station name if station is provided
        if (data.battery.station) {
          const st = data.battery.station;
          if (typeof st === 'string') {
            try {
              const stationData = await getStationById(st);
              setStation(stationData);
            } catch (err) {
              console.error('Failed to fetch station details:', err);
              setStation({
                _id: st,
                stationName: st,
                address: '',
                city: '',
                district: '',
                capacity: 0,
                sohAvg: 0,
                availableBatteries: 0
              });
            }
          } else {
            setStation(st);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch battery data');
        console.error('Error fetching battery data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatteryData();
  }, [batteryId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading battery data...</p>
        </div>
      </div>
    );
  }

  if (error || !batteryData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="inline-block w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-primary font-semibold mb-2">Data Loading Error</p>
          <p className="text-text-secondary">{error || 'Battery data not found'}</p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning', label: string }> = {
      full: { variant: 'success', label: 'Full' },
      'in-use': { variant: 'default', label: 'In Use' },
      charging: { variant: 'warning', label: 'Charging' },
      idle: { variant: 'secondary', label: 'Idle' },
      faulty: { variant: 'destructive', label: 'Faulty' },
      'is-booking': { variant: 'outline', label: 'Is Booking' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getHealthColor = (soh: number) => {
    if (soh >= 90) return 'text-green-600';
    if (soh >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const refreshData = () => {
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatAction = (action: string) => {
    // Convert action to more readable format
    return action
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDriverDisplay = (driverName?: string | null) => {
    if (!driverName) return 'N/A';
    return driverName;
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Battery Details</h1>
              <p className="text-slate-600 mt-1">
                Detailed information for {batteryData.serial}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <BatteryIcon className="h-4 w-4" />
                Battery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>{getStatusBadge(batteryData.status)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-100 to-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Battery Health (SOH)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${getHealthColor(batteryData.soh)}`}>
                  {batteryData.soh}%
                </div>
                <div className="text-sm text-green-700">
                  {batteryData.soh >= 90 ? 'Good condition' : batteryData.soh >= 70 ? 'Fair condition' : 'Needs inspection'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Battery Details */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BatteryIcon className="h-5 w-5" />
                Detailed Battery Information
              </CardTitle>
              <CardDescription>
                All technical information about the battery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Battery ID</p>
                  <p className="font-semibold text-lg">{batteryData.id}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Serial Number</p>
                  <p className="font-semibold text-lg">{batteryData.serial}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Battery Model</p>
                  <p className="font-semibold text-lg">{batteryData.model || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <div className="mt-2">{getStatusBadge(batteryData.status)}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Battery Health (SOH)</p>
                  <p className={`font-semibold text-lg ${getHealthColor(batteryData.soh)}`}>{batteryData.soh}%</p>
                </div>
                {station && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Station</p>
                    <p className="font-semibold text-lg">{station.stationName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs table */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle>Battery Logs</CardTitle>
              <CardDescription>History of actions related to this battery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Driver</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="font-medium">No history records found</p>
                            <p className="text-xs text-slate-400">This battery has no recorded actions yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, index) => (
                        <tr key={log._id || index} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-sm text-slate-700 font-medium">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {formatAction(log.action)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <span>{getDriverDisplay(log.driverName)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {log.details || <span className="text-slate-400">—</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
