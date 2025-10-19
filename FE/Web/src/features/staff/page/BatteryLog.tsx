import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Battery as BatteryIcon, 
  TrendingUp, 
  Zap, 
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBatteryDetail, getStationById } from '../apis/BatteryLogApi';
import type { BatteryDetail, Station } from '../apis/BatteryLogApi';

export default function BatteryLog() {
  const { batteryId } = useParams<{ batteryId: string }>();
  const navigate = useNavigate();
  const [batteryData, setBatteryData] = useState<BatteryDetail | null>(null);
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
        
        const data = await getBatteryDetail(batteryId);
      setBatteryData(data);

        // Fetch station name if station is provided
        if (data.station) {
          if (typeof data.station === 'string') {
            // Station is ID, fetch station details
            try {
              const stationData = await getStationById(data.station);
              setStation(stationData);
            } catch (err) {
              console.error('Failed to fetch station details:', err);
              // Create minimal station object with ID as name for fallback
              setStation({
                _id: data.station,
                stationName: data.station,
                address: '',
                city: '',
                district: '',
                capacity: 0,
                sohAvg: 0,
                availableBatteries: 0
              });
            }
          } else {
            // Station is already an object
            setStation(data.station);
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
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button & Title Skeleton */}
          <div className="mb-6 flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded dark:bg-gray-700" />
            <div className="h-10 w-64 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded-full dark:bg-gray-700 mb-4" />
                  <div className="h-8 w-20 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded-full dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Details Card Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="animate-pulse mb-6">
              <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse flex justify-between items-center py-3 border-b border-gray-200">
                  <div className="h-4 w-32 bg-gray-200 rounded-full dark:bg-gray-700" />
                  <div className="h-4 w-48 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
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
          <p className="text-text-primary font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p className="text-text-secondary">{error || 'Không tìm thấy dữ liệu pin'}</p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Quay lại
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
      faulty: { variant: 'destructive', label: 'Faulty' }
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

  return (
    <div className="p-6 min-h-screen bg-slate-50">
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
              <h1 className="text-3xl font-bold text-slate-900">Chi tiết Pin</h1>
              <p className="text-slate-600 mt-1">
                Thông tin chi tiết cho {batteryData.serial}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <BatteryIcon className="h-4 w-4" />
                Trạng thái Pin
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
                Sức khỏe Pin (SOH)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${getHealthColor(batteryData.soh)}`}>
                  {batteryData.soh}%
                </div>
                <div className="text-sm text-green-700">
                  {batteryData.soh >= 90 ? 'Tình trạng tốt' : batteryData.soh >= 70 ? 'Tình trạng trung bình' : 'Cần kiểm tra'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Điện áp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-900">
                  {batteryData.voltage || 'N/A'} V
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
                Thông tin Chi tiết Pin
                  </CardTitle>
                <CardDescription>
                Tất cả thông tin kỹ thuật về pin
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">ID Pin</p>
                  <p className="font-semibold text-lg">{batteryData._id}</p>
                        </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Số Serial</p>
                  <p className="font-semibold text-lg">{batteryData.serial}</p>
                      </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Mẫu Pin</p>
                  <p className="font-semibold text-lg">{batteryData.model || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Trạng thái</p>
                  <div className="mt-2">{getStatusBadge(batteryData.status)}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Sức khỏe Pin (SOH)</p>
                  <p className={`font-semibold text-lg ${getHealthColor(batteryData.soh)}`}>
                    {batteryData.soh}%
                  </p>
                </div>
                {station && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Trạm</p>
                    <p className="font-semibold text-lg">{station.stationName}</p>
                  </div>
                )}
                {batteryData.manufacturer && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Nhà sản xuất</p>
                    <p className="font-semibold text-lg">{batteryData.manufacturer}</p>
                  </div>
                )}
                {batteryData.capacity_kWh && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Dung lượng</p>
                    <p className="font-semibold text-lg">{batteryData.capacity_kWh} kWh</p>
                  </div>
                )}
                {batteryData.voltage && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Điện áp</p>
                    <p className="font-semibold text-lg">{batteryData.voltage} V</p>
                  </div>
                )}
                  </div>
                </CardContent>
              </Card>
            </div>
      </div>
    </div>
  );
}
