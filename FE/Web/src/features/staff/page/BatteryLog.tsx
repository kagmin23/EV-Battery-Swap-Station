import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Battery as BatteryIcon, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Calendar,
  Clock,
  Thermometer,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateBatteryLogData } from '@/mock/BatteryLogData';
import type { BatteryDetailInfo } from '@/mock/BatteryLogData';

export default function BatteryLog() {
  const { batteryId } = useParams<{ batteryId: string }>();
  const navigate = useNavigate();
  const [batteryData, setBatteryData] = useState<BatteryDetailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch battery data
    const fetchBatteryData = async () => {
      setIsLoading(true);
      // In real app, this would be an API call
      const data = generateBatteryLogData(batteryId || 'BAT001');
      setBatteryData(data);
      setIsLoading(false);
    };

    fetchBatteryData();
  }, [batteryId]);

  if (isLoading || !batteryData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading battery data...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning', label: string }> = {
      available: { variant: 'success', label: 'Available' },
      in_use: { variant: 'default', label: 'In Use' },
      charging: { variant: 'warning', label: 'Charging' },
      maintenance: { variant: 'secondary', label: 'Maintenance' },
      retired: { variant: 'destructive', label: 'Retired' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getHealthColor = (soh: number) => {
    if (soh >= 90) return 'text-green-600';
    if (soh >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'swap': return <RefreshCw className="h-4 w-4" />;
      case 'charge': return <Zap className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'transfer': return <MapPin className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours: number | undefined) => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <div className="p-6">
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
              <h1 className="text-3xl font-bold text-slate-900">Battery Log</h1>
              <p className="text-slate-600 mt-1">
                Detailed information for {batteryData.battery_id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <BatteryIcon className="h-4 w-4" />
                Battery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900">
                  {batteryData.current_charge_percent}%
                </div>
                <div>{getStatusBadge(batteryData.status)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                State of Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${getHealthColor(batteryData.soh_percent)}`}>
                  {batteryData.soh_percent}%
                </div>
                <div className="text-sm text-green-700">Excellent condition</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-900">
                  {batteryData.current_temperature}°C
                </div>
                <div className="text-sm text-orange-700">Normal range</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Charge Cycles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-900">
                  {batteryData.total_charge_cycles}
                </div>
                <div className="text-sm text-purple-700">
                  of {batteryData.max_charge_cycles} max
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-lg border-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="location">Location History</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Battery Information */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BatteryIcon className="h-5 w-5" />
                    Battery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Battery ID</p>
                      <p className="font-semibold">{batteryData.battery_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Serial Number</p>
                      <p className="font-semibold">{batteryData.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Model</p>
                      <p className="font-semibold">{batteryData.battery_model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Manufacturer</p>
                      <p className="font-semibold">{batteryData.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Capacity</p>
                      <p className="font-semibold">{batteryData.capacity_kWh} kWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Voltage</p>
                      <p className="font-semibold">{batteryData.current_voltage}V</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Location */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <MapPin className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-lg">
                          {batteryData.current_location.location_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {batteryData.current_location.type.charAt(0).toUpperCase() + 
                           batteryData.current_location.type.slice(1)}
                        </p>
                        {batteryData.current_location.slot_number && (
                          <p className="text-sm text-slate-600">
                            Slot: {batteryData.current_location.slot_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Schedule */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Last Maintenance</span>
                    <span className="font-semibold">
                      {formatDate(batteryData.last_maintenance_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-slate-600">Next Maintenance</span>
                    <span className="font-semibold text-green-700">
                      {formatDate(batteryData.next_maintenance_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Warranty Expires</span>
                    <span className="font-semibold">
                      {formatDate(batteryData.warranty_expiry)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Manufactured Date</span>
                    <span className="font-semibold">
                      {formatDate(batteryData.manufactured_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">First Use Date</span>
                    <span className="font-semibold">
                      {formatDate(batteryData.first_use_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-slate-600">Total Cycles</span>
                    <span className="font-semibold text-purple-700">
                      {batteryData.total_charge_cycles} / {batteryData.max_charge_cycles}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(batteryData.total_charge_cycles / batteryData.max_charge_cycles) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Location History Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Location History</CardTitle>
                <CardDescription>
                  Track where this battery has been over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batteryData.location_history.map((location) => (
                    <div 
                      key={location.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          location.to_date === null ? 'bg-blue-500' : 'bg-slate-300'
                        }`}>
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{location.location_name}</h4>
                          {location.to_date === null && (
                            <Badge variant="success">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {location.location_type.charAt(0).toUpperCase() + 
                           location.location_type.slice(1)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>From: {formatDate(location.from_date)}</span>
                          </div>
                          {location.to_date && (
                            <>
                              <span>•</span>
                              <span>To: {formatDate(location.to_date)}</span>
                              <span>•</span>
                              <span>Duration: {formatDuration(location.duration_hours)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Complete history of all battery events and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batteryData.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border-l-4 ${getActivityLevelColor(activity.level)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          <h4 className="font-semibold">{activity.title}</h4>
                        </div>
                        <Badge variant={
                          activity.level === 'error' ? 'destructive' :
                          activity.level === 'warning' ? 'warning' :
                          activity.level === 'success' ? 'success' : 'default'
                        }>
                          {activity.level.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">{activity.type}</span>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-slate-500">{key.replace(/_/g, ' ')}:</span>
                                <span className="ml-1 font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Historical performance data over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Performance chart placeholder */}
                  <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Performance chart would be displayed here</p>
                      <p className="text-sm text-slate-500">Showing SOH, Temperature, and Charge trends</p>
                    </div>
                  </div>

                  {/* Recent metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {batteryData.performance_history.slice(-7).reverse().map((metric, index) => (
                      <Card key={index} className="bg-slate-50">
                        <CardContent className="p-4">
                          <p className="text-xs text-slate-600 mb-2">
                            {formatDate(metric.timestamp)}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>SOH:</span>
                              <span className="font-semibold">{metric.soh_percent.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Charge:</span>
                              <span className="font-semibold">{metric.charge_percent.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Temp:</span>
                              <span className="font-semibold">{metric.temperature_celsius.toFixed(1)}°C</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Details Tab */}
          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Electrical Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Voltage</span>
                    <span className="font-semibold">{batteryData.current_voltage} V</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Amperage</span>
                    <span className="font-semibold">{batteryData.current_amperage} A</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Capacity</span>
                    <span className="font-semibold">{batteryData.capacity_kWh} kWh</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Current Charge</span>
                    <span className="font-semibold">{batteryData.current_charge_percent}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Health & Diagnostics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">State of Health</span>
                    <span className={`font-semibold ${getHealthColor(batteryData.soh_percent)}`}>
                      {batteryData.soh_percent}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Temperature</span>
                    <span className="font-semibold">{batteryData.current_temperature}°C</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Total Cycles</span>
                    <span className="font-semibold">
                      {batteryData.total_charge_cycles} / {batteryData.max_charge_cycles}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Cycle Progress</span>
                    <span className="font-semibold">
                      {((batteryData.total_charge_cycles / batteryData.max_charge_cycles) * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}