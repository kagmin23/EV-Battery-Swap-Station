import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Building2,
  Target,
  AlertCircle,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
} from 'lucide-react';
import { ForecastChart } from '../components/ForecastChart';
import {
  stationDemandForecastData,
  stationCapacityUtilizationData as stationCapacityData,
  stationCapacityForecastData,
  aiInfrastructureInsights,
  forecastMetrics,
} from '@/mock/ForecastData';
import { Spinner } from '@/components/ui/spinner';
import { AIApi, type AIPredictionResponse } from '../apis/aiApi';
import { toast } from 'sonner';
import { mockStations } from '@/mock/StationData';

export default function AIForecast() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [aiPrediction, setAiPrediction] = useState<AIPredictionResponse | null>(null);
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch AI data on component mount
  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch AI predictions
        const predictionResponse = await AIApi.getPredictions();
        setAiPrediction(predictionResponse);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching AI data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIData();
  }, []);

  const getFilteredDemandData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    return stationDemandForecastData.slice(0, days);
  };

  const getFilteredCapacityData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    return stationCapacityData.slice(0, days);
  };

  const filteredInsights = selectedInsightCategory === 'all' 
    ? aiInfrastructureInsights 
    : aiInfrastructureInsights.filter(insight => insight.priority === selectedInsightCategory);

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStationStatusColor = (status: string): string => {
    switch (status) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      case 'optimal':
        return 'bg-green-500 text-white';
      case 'underutilized':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading AI forecast...</p>
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
          <p className="text-gray-800 font-semibold mb-2">Error Loading AI Forecast</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
          <Brain className="w-8 h-8 text-purple-600" />
          AI Station Demand Forecast
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Station demand forecasting and infrastructure upgrade recommendations
        </p>
        
        {/* AI Prediction Suggestion */}
        {aiPrediction?.data?.suggest && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-1">AI Recommendation</h3>
                <p className="text-purple-700">{aiPrediction.data.suggest}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Growth</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.demandGrowth}%</p>
          <p className="text-xs opacity-90">Demand Growth</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Stations</span>
          </div>
          <p className="text-2xl font-bold">{mockStations.length}</p>
          <p className="text-xs opacity-90">Total Stations</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Alerts</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.criticalAlerts}</p>
          <p className="text-xs opacity-90">Need Upgrade</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Accuracy</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.avgAccuracy}%</p>
          <p className="text-xs opacity-90">Reliability</p>
        </div>
      </div>

      {/* Time Range and Station Selector */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Forecast Period:</span>
            <div className="flex gap-2">
              {[
                { value: '7d' as const, label: '7 Days' },
                { value: '30d' as const, label: '30 Days' },
                { value: '90d' as const, label: '90 Days' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeRange(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTimeRange === option.value
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Station:</span>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stations</option>
              {mockStations.map((station) => (
                <option key={station.station_id} value={station.station_id}>
                  {station.station_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ForecastChart
          data={getFilteredDemandData()}
          title="Station Usage Demand Forecast"
          unit="swaps"
          color="#3b82f6"
          showConfidence={true}
        />
        <ForecastChart
          data={getFilteredCapacityData()}
          title="Station Capacity Utilization Forecast (%)"
          unit="%"
          color="#10b981"
          showConfidence={true}
        />
      </div>

      {/* Station Demand Details */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Station-Specific Forecast Details
          <span className="text-sm font-normal text-slate-500">({mockStations.length} stations)</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stationCapacityForecastData.map((station) => {
            const stationInfo = mockStations.find(s => s.station_id === station.stationId);
            const isPositiveTrend = station.predictedUtilization30Days > station.currentUtilization;
            
            return (
              <div
                key={station.stationId}
                className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 mb-1">{stationInfo?.station_name || station.stationId}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {stationInfo?.location || 'No location info'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityColor(station.status)}`}>
                    {station.status.toUpperCase()}
                  </span>
                </div>

                {/* Utilization bars */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Current</span>
                      <span className="text-sm font-bold text-slate-800">{station.currentUtilization}%</span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${getStationStatusColor(station.status)} transition-all`}
                        style={{ width: `${station.currentUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">30 Days Forecast</span>
                      <div className="flex items-center gap-1">
                        {isPositiveTrend ? (
                          <ArrowUpRight className="w-3 h-3 text-red-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-green-600" />
                        )}
                        <span className={`text-sm font-bold ${isPositiveTrend ? 'text-red-600' : 'text-green-600'}`}>
                          {station.predictedUtilization30Days}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${station.predictedUtilization30Days}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">90 Days Forecast</span>
                      <span className="text-sm font-bold text-slate-800">{station.predictedUtilization90Days}%</span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${station.predictedUtilization90Days}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {station.recommendedAction}
                  </span>
                  <span className="text-xs text-slate-500">Confidence: {station.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Infrastructure Insights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Infrastructure Upgrade Recommendations
            <span className="text-sm font-normal text-slate-500">({filteredInsights.length} recommendations)</span>
          </h2>
          <div className="flex gap-2">
            {['all', 'critical', 'high', 'medium'].map((priority) => (
              <button
                key={priority}
                onClick={() => setSelectedInsightCategory(priority)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedInsightCategory === priority
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white rounded-xl border-2 ${getPriorityColor(insight.priority)} p-5 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-slate-800">{insight.title}</h4>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getPriorityColor(insight.priority)}`}>
                  {insight.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-700 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Confidence:</span>
                  <span className="font-semibold text-slate-800">{insight.confidence}%</span>
                </div>
                <span className="text-slate-600">
                  Priority: {insight.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

