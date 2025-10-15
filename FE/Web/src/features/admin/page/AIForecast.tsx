import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  Battery,
  DollarSign,
  Wrench,
  Zap,
  Target,
  AlertCircle,
  Calendar,
  BarChart3,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { ForecastChart } from '../components/ForecastChart';
import { AIInsightCard } from '../components/AIInsightCard';
import {
  demandForecastData,
  revenueForecastData,
  batteryHealthPredictions,
  maintenancePredictions,
  stationCapacityData,
  aiInsights,
  forecastMetrics,
} from '@/mock/ForecastData';

export default function AIForecast() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getFilteredDemandData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    return demandForecastData.slice(0, days);
  };

  const getFilteredRevenueData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    return revenueForecastData.slice(0, days);
  };

  const filteredInsights = selectedCategory === 'all' 
    ? aiInsights 
    : aiInsights.filter(insight => insight.category === selectedCategory);

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

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getCapacityStatusColor = (status: string): string => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'optimal':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        background: 'linear-gradient(to bottom right, var(--color-bg-primary), var(--color-bg-secondary), var(--color-bg-tertiary))',
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
          <Brain className="w-8 h-8 text-purple-600" />
          AI Forecast & Predictions
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          AI-powered predictive analytics and insights for EV Battery Swap Station
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Growth</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.demandGrowth}%</p>
          <p className="text-xs opacity-90">Demand Growth</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Revenue</span>
          </div>
          <p className="text-2xl font-bold">+{forecastMetrics.revenueGrowth}%</p>
          <p className="text-xs opacity-90">Revenue Forecast</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Accuracy</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.avgAccuracy}%</p>
          <p className="text-xs opacity-90">Avg Accuracy</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Alerts</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.criticalAlerts}</p>
          <p className="text-xs opacity-90">Critical Alerts</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Insights</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.actionableInsights}</p>
          <p className="text-xs opacity-90">Actionable</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Total</span>
          </div>
          <p className="text-2xl font-bold">{forecastMetrics.totalPredictions}</p>
          <p className="text-xs opacity-90">Predictions Made</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Forecast Period:</span>
          </div>
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
      </div>

      {/* Main Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ForecastChart
          data={getFilteredDemandData()}
          title="Battery Swap Demand Forecast"
          unit="swaps"
          color="#3b82f6"
          showConfidence={true}
        />
        <ForecastChart
          data={getFilteredRevenueData()}
          title="Revenue Forecast"
          unit="VND"
          color="#10b981"
          showConfidence={true}
        />
      </div>

      {/* Battery Health Predictions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Battery className="w-6 h-6 text-orange-600" />
          Battery Health Predictions
          <span className="text-sm font-normal text-slate-500">({batteryHealthPredictions.length} batteries monitored)</span>
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Battery ID</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">Current SOH</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">30 Days</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">90 Days</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Est. Replacement</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {batteryHealthPredictions.map((battery) => (
                  <tr key={battery.batteryId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{battery.batteryId}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold">
                        {battery.currentSOH}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-slate-700">{battery.predictedSOH30Days}%</td>
                    <td className="py-4 px-6 text-center text-sm text-slate-700">{battery.predictedSOH90Days}%</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{battery.estimatedReplacementDate}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(battery.riskLevel)}`}>
                        {battery.riskLevel.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Maintenance Predictions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-red-600" />
          Predictive Maintenance Schedule
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {maintenancePredictions.map((maintenance) => (
            <div
              key={maintenance.stationId}
              className={`bg-white rounded-lg border-2 ${getPriorityColor(maintenance.priority)} p-5 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{maintenance.stationName}</h4>
                  <p className="text-xs text-slate-500">{maintenance.stationId}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getPriorityColor(maintenance.priority)}`}>
                  {maintenance.priority.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Predicted Date:</span>
                  <span className="font-semibold text-slate-800">{maintenance.predictedMaintenanceDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Confidence:</span>
                  <span className="font-semibold text-slate-800">{maintenance.confidence}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Est. Downtime:</span>
                  <span className="font-semibold text-slate-800">{maintenance.estimatedDowntime}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-slate-700"><span className="font-semibold">Reason:</span> {maintenance.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Station Capacity Optimization */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-600" />
          Station Capacity Forecast
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="space-y-4">
            {stationCapacityData.map((station) => (
              <div key={station.stationId} className="border-b border-slate-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{station.stationName}</h4>
                    <p className="text-xs text-slate-500">{station.stationId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{station.currentUtilization}%</p>
                    <p className="text-xs text-slate-500">Current</p>
                  </div>
                </div>
                
                {/* Utilization Bar */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-600 w-16">Current</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getCapacityStatusColor(station.status)} transition-all`}
                        style={{ width: `${station.currentUtilization}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-12">{station.currentUtilization}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-600 w-16">30 Days</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-slate-400 transition-all"
                        style={{ width: `${station.predictedUtilization30Days}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-12">{station.predictedUtilization30Days}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-16">90 Days</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-slate-500 transition-all"
                        style={{ width: `${station.predictedUtilization90Days}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-12">{station.predictedUtilization90Days}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCapacityStatusColor(station.status)} text-white`}>
                    {station.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <ChevronRight className="w-4 h-4" />
                    {station.recommendedAction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            AI-Generated Insights
            <span className="text-sm font-normal text-slate-500">({filteredInsights.length} insights)</span>
          </h2>
          <div className="flex gap-2">
            {['all', 'demand', 'revenue', 'battery', 'maintenance', 'optimization'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredInsights.map((insight) => (
            <AIInsightCard
              key={insight.id}
              insight={insight}
              onTakeAction={() => alert(`Taking action on: ${insight.title}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
