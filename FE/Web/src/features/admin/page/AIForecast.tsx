import { useEffect, useMemo, useRef, useState } from 'react';
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
  Loader2,
  RefreshCw,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { ForecastChart, type ForecastChartPoint } from '../components/ForecastChart';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
  AIService,
  type AllRecommendationsSummary,
  type CapacityRecommendation,
  type DemandForecastResponse,
  type ModelStatus
} from '@/services/api/aiService';
import { StationService, type Station } from '@/services/api/stationService';
import { Button } from '@/components/ui/button';

type TimeRangeOption = '7d' | '30d' | '90d';
type RecommendationFilter = 'all' | 'high' | 'medium' | 'low';

const timeRangeToHours = (range: TimeRangeOption): number => {
  switch (range) {
    case '7d':
      return 7 * 24;
    case '30d':
      return 30 * 24;
    case '90d':
      return 90 * 24;
    default:
      return 7 * 24;
  }
};

const formatNumber = (value: number | string, fractionDigits = 1): string => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '-';
  return numeric.toLocaleString('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  });
};

const formatDateLabel = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit'
  });
};

export default function AIForecast() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>('30d');
  const [bufferRate, setBufferRate] = useState<number>(0.2);
  const [forecast, setForecast] = useState<DemandForecastResponse | null>(null);
  const [capacityRecommendation, setCapacityRecommendation] = useState<CapacityRecommendation | null>(null);
  const [recommendationsSummary, setRecommendationsSummary] = useState<AllRecommendationsSummary | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<RecommendationFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [isCapacityLoading, setIsCapacityLoading] = useState<boolean>(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainDaysBack, setTrainDaysBack] = useState<number>(90);
  const [forceRetrain, setForceRetrain] = useState<boolean>(false);
  const hasLoadedRef = useRef(false);

  const selectedStation = useMemo(
    () => stations.find((station) => station._id === selectedStationId) || null,
    [stations, selectedStationId]
  );

  const demandChartData: ForecastChartPoint[] = useMemo(() => {
    if (!forecast) return [];
    return forecast.forecast.map((point) => ({
      date: formatDateLabel(point.timestamp),
      predicted: Number(point.predicted_demand.toFixed(2))
    }));
  }, [forecast]);

  const capacityChartData: ForecastChartPoint[] = useMemo(() => {
    if (!forecast || !capacityRecommendation) return [];
    const currentCapacity = capacityRecommendation.analysis.current_capacity;
    if (!currentCapacity || currentCapacity <= 0) return [];

    return forecast.forecast.map((point) => ({
      date: formatDateLabel(point.timestamp),
      predicted: Math.min(100, (point.predicted_demand / currentCapacity) * 100)
    }));
  }, [forecast, capacityRecommendation]);

  const demandInsight = useMemo(() => {
    if (!forecast || forecast.forecast.length === 0) return null;
    const points = forecast.forecast;
    const totalHours = points.length;
    const totalDays = totalHours / 24;
    const start = points[0].predicted_demand;
    const end = points[points.length - 1].predicted_demand;
    return {
      start,
      end,
      totalDays,
      dailyChange: totalDays > 0 ? (end - start) / totalDays : 0
    };
  }, [forecast]);

  const capacityInsight = useMemo(() => {
    if (!forecast || !capacityRecommendation || forecast.forecast.length === 0) return null;
    const currentCapacity = capacityRecommendation.analysis.current_capacity;
    if (!currentCapacity || currentCapacity <= 0) return null;
    const points = forecast.forecast;
    const totalHours = points.length;
    const totalDays = totalHours / 24;
    const start = (points[0].predicted_demand / currentCapacity) * 100;
    const end = (points[points.length - 1].predicted_demand / currentCapacity) * 100;
    return {
      start,
      end,
      totalDays,
      dailyChange: totalDays > 0 ? (end - start) / totalDays : 0
    };
  }, [forecast, capacityRecommendation]);

  const filteredRecommendations = useMemo(() => {
    if (!recommendationsSummary) return [];
    if (selectedInsightCategory === 'all') return recommendationsSummary.recommendations;
    return recommendationsSummary.recommendations.filter(
      (item) => item.recommendation.urgency === selectedInsightCategory
    );
  }, [recommendationsSummary, selectedInsightCategory]);

  const loadModelStatus = async () => {
    try {
      const status = await AIService.getModelStatus();
      setModelStatus(status);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Unable to load model status');
    }
  };

  const loadRecommendationsSummary = async () => {
    try {
      setIsSummaryLoading(true);
      const summary = await AIService.getAllRecommendations();
      setRecommendationsSummary(summary);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Unable to load recommendations');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const runAnalysis = async (stationId: string, periods: number, currentBufferRate: number) => {
    setIsForecastLoading(true);
    setIsCapacityLoading(true);
    try {
      const [forecastRes, capacityRes] = await Promise.all([
        AIService.forecastDemand(stationId, periods),
        AIService.getCapacityRecommendation(stationId, currentBufferRate)
      ]);
      setForecast(forecastRes);
      setCapacityRecommendation(capacityRes);
      toast.success('AI analysis data refreshed');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to load AI data';
      toast.error(message);
    } finally {
      setIsForecastLoading(false);
      setIsCapacityLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);

      const [stationsResult, statusResult, recommendationsResult] = await Promise.allSettled([
        StationService.getAllStations(),
        AIService.getModelStatus(),
        AIService.getAllRecommendations()
      ]);

      if (stationsResult.status === 'fulfilled') {
        setStations(stationsResult.value);
        if (!selectedStationId && stationsResult.value.length > 0) {
          const defaultStation = stationsResult.value[0];
          setSelectedStationId(defaultStation._id);
          await runAnalysis(defaultStation._id, timeRangeToHours(selectedTimeRange), bufferRate);
        } else if (selectedStationId) {
          await runAnalysis(selectedStationId, timeRangeToHours(selectedTimeRange), bufferRate);
        }
      } else {
        throw stationsResult.reason;
      }

      if (statusResult.status === 'fulfilled') {
        setModelStatus(statusResult.value);
      }

      if (recommendationsResult.status === 'fulfilled') {
        setRecommendationsSummary(recommendationsResult.value);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to load AI data';
      setError(message);
      toast.error(message);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadInitialData().catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunAnalysis = async () => {
    if (!selectedStationId) {
      toast.error('Please select a station to analyze');
      return;
    }
    await runAnalysis(selectedStationId, timeRangeToHours(selectedTimeRange), bufferRate);
  };

  const handleReloadRecommendations = async () => {
    await loadRecommendationsSummary();
  };

  const handleReloadModelStatus = async () => {
    await loadModelStatus();
  };

  const handleTrainModel = async () => {
    try {
      setIsTraining(true);
      const payload = {
        stationId: selectedStationId || null,
        daysBack: trainDaysBack,
        forceRetrain
      };
      const response = await AIService.trainModel(payload);
      toast.success(response.message || 'Model training completed');
      await Promise.all([loadModelStatus(), loadRecommendationsSummary()]);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Unable to train the model');
    } finally {
      setIsTraining(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading AI data...</p>
        </div>
    </div>
  );
}



  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="inline-block w-16 h-16" />
          </div>
          <p className="text-gray-800 font-semibold mb-2">Unable to load AI data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadInitialData} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const avgDemand = forecast?.summary.avg_demand ?? 0;
  const peakDemand = forecast?.summary.peak_demand ?? 0;
  const stationsNeedingUpgrade = recommendationsSummary?.needs_upgrade ?? 0;
  const totalStations = stations.length;
  const forecastMaturity = capacityRecommendation
    ? Number(capacityRecommendation.utilization.forecast_avg)
    : 0;
  const accuracy =
    modelStatus?.evaluation?.mape !== undefined
      ? Math.max(0, 100 - modelStatus.evaluation.mape)
      : null;

  return (
    <div className="p-6 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Station Demand Forecast
          </h1>
          <p className="text-slate-600 mt-2">
            Analyze station demand and receive upgrade recommendations powered by historical data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleReloadModelStatus} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh model status
          </Button>
          <Button onClick={handleReloadRecommendations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh recommendations
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Avg Demand</span>
          </div>
          <p className="text-3xl font-bold">{formatNumber(avgDemand, 1)}</p>
          <p className="text-xs opacity-80">Average hourly swaps</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Peak</span>
          </div>
          <p className="text-3xl font-bold">{formatNumber(peakDemand, 0)}</p>
          <p className="text-xs opacity-80">Forecast peak demand</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Upgrade</span>
          </div>
          <p className="text-3xl font-bold">{stationsNeedingUpgrade}</p>
          <p className="text-xs opacity-80">Stations needing upgrade (/{totalStations})</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Accuracy</span>
          </div>
          <p className="text-3xl font-bold">
            {accuracy !== null ? `${formatNumber(accuracy, 1)}%` : modelStatus?.status === 'ready' ? 'N/A' : 'Not trained'}
          </p>
          <p className="text-xs opacity-80">Estimated model accuracy</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Station
            </label>
            <select
              value={selectedStationId}
              onChange={(event) => setSelectedStationId(event.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationName}
                </option>
              ))}
            </select>
            {selectedStation?.address && (
              <p className="text-xs text-slate-500 mt-1">{selectedStation.address}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              Forecast window
            </label>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as TimeRangeOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedTimeRange(option)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTimeRange === option
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  {option === '7d' ? '7 days' : option === '30d' ? '30 days' : '90 days'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Buffer rate ({Math.round(bufferRate * 100)}%)
            </label>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.05}
              value={bufferRate}
              onChange={(event) => setBufferRate(Number(event.target.value))}
              className="w-full accent-purple-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Add a {Math.round(bufferRate * 100)}% safety buffer above peak demand
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleRunAnalysis} className="bg-purple-600 hover:bg-purple-700">
              {(isForecastLoading || isCapacityLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Analyze
            </Button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <ForecastChart
            data={demandChartData}
            title="Station Usage Demand Forecast"
            unit="swaps"
            color="#3b82f6"
            showConfidence={false}
          />
          {demandInsight && (
            <p className="text-xs text-slate-200 bg-white/10 rounded-xl px-4 py-2">
              Start: {formatNumber(demandInsight.start, 2)} swaps/hour • Daily change: {formatNumber(demandInsight.dailyChange, 2)} swaps/hour • After {Math.round(demandInsight.totalDays)} days: {formatNumber(demandInsight.end, 2)} swaps/hour
            </p>
          )}
        </div>
        <div className="space-y-2">
          <ForecastChart
            data={capacityChartData}
            title="Capacity Utilization Forecast (%)"
            unit="%"
            color="#10b981"
            showConfidence={false}
          />
          {capacityInsight && (
            <p className="text-xs text-slate-200 bg-white/10 rounded-xl px-4 py-2">
              Start: {formatNumber(capacityInsight.start, 1)}% • Daily change: {formatNumber(capacityInsight.dailyChange, 1)}% • After {Math.round(capacityInsight.totalDays)} days: {formatNumber(capacityInsight.end, 1)}%
            </p>
          )}
        </div>
      </div>

      {/* Capacity Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-purple-100 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Capacity upgrade recommendation</h2>
              <p className="text-sm text-slate-500">
                Based on forecast data for station {selectedStation?.stationName || ''}
              </p>
            </div>
            {isCapacityLoading && <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />}
          </div>

          {capacityRecommendation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Current capacity</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {capacityRecommendation.analysis.current_capacity}
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Recommended capacity</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {capacityRecommendation.analysis.recommended_capacity}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-1">Forecast utilization</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatNumber(forecastMaturity, 1)}%
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed">
                {capacityRecommendation.recommendation.reasoning}
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  Urgency: {capacityRecommendation.recommendation.urgency.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  Priority: {capacityRecommendation.recommendation.priority}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  Capacity gap: {capacityRecommendation.analysis.capacity_gap}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <Brain className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p>No recommendation yet. Run the analysis to populate this section.</p>
            </div>
          )}
        </div>

        {/* Model status & training */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Model status</h2>
            {modelStatus?.status === 'ready' ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <ShieldCheck className="w-5 h-5" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <AlertCircle className="w-5 h-5" /> Not trained
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">Last trained at</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {modelStatus?.trained_at
                  ? new Date(modelStatus.trained_at).toLocaleString('en-US')
                  : 'No data'}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">MAE</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {modelStatus?.evaluation?.mae !== undefined
                  ? formatNumber(modelStatus.evaluation.mae, 2)
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">RMSE</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {modelStatus?.evaluation?.rmse !== undefined
                  ? formatNumber(modelStatus.evaluation.rmse, 2)
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Training lookback (days)
                </label>
                <input
                  type="number"
                  min={30}
                  max={365}
                  value={trainDaysBack}
                  onChange={(event) => setTrainDaysBack(Number(event.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="forceRetrain"
                  type="checkbox"
                  checked={forceRetrain}
                  onChange={(event) => setForceRetrain(event.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="forceRetrain" className="text-sm text-slate-600">
                  Force retrain
                </label>
              </div>
              <div className="flex items-center justify-end">
                <Button onClick={handleTrainModel} disabled={isTraining}>
                  {isTraining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Train model
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * Model uses hourly transaction data to tune Holt-Winters parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              Infrastructure Upgrade Recommendations
            </h2>
            <p className="text-sm text-slate-500">
              {recommendationsSummary?.recommendations.length ?? 0} AI recommendations across the network
            </p>
          </div>
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as RecommendationFilter[]).map((priority) => (
              <button
                key={priority}
                onClick={() => setSelectedInsightCategory(priority)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedInsightCategory === priority
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {priority === 'all'
                  ? 'All'
                  : priority === 'high'
                  ? 'High priority'
                  : priority === 'medium'
                  ? 'Medium priority'
                  : 'Low priority'}
              </button>
            ))}
          </div>
        </div>

        {isSummaryLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRecommendations.map((item) => {
              const utilizationCurrent = item.utilization.current;
              const utilizationPeak = Number(item.utilization.forecast_peak);
              const isPositiveTrend = utilizationPeak > utilizationCurrent;
              return (
                <div
                  key={item.station_id}
                  className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 mb-1">{item.station_name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.analysis.capacity_gap > 0
                          ? `Shortage of ${item.analysis.capacity_gap} slots`
                          : 'Capacity is sufficient'}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.recommendation.urgency === 'high'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : item.recommendation.urgency === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}
                    >
                      {item.recommendation.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Current capacity</span>
                        <span className="text-sm font-bold text-slate-800">
                          {item.analysis.current_capacity}
                        </span>
                      </div>
                      <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.recommendation.urgency === 'high'
                              ? 'bg-red-500'
                              : item.recommendation.urgency === 'medium'
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          } transition-all`}
                          style={{ width: `${utilizationCurrent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Recommended capacity</span>
                        <div className="flex items-center gap-1">
                          {isPositiveTrend ? (
                            <ArrowUpRight className="w-3 h-3 text-red-600" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-green-600" />
                          )}
                          <span
                            className={`text-sm font-bold ${
                              isPositiveTrend ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {item.analysis.recommended_capacity}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${utilizationPeak}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Peak demand:</strong> {formatNumber(item.demand_analysis.peak_demand, 0)} swaps/h
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-700 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {item.recommendation.needs_upgrade
                        ? 'Upgrade required'
                        : 'Capacity sufficient'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Priority #{item.recommendation.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Brain className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p>No recommendation for the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
