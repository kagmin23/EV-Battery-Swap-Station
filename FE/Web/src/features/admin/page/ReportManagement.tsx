import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ReportsApi, type UsageReportResponse } from '../apis/reportsApi';
import { toast } from 'sonner';

export default function ReportManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const usageResponse = await ReportsApi.getUsageReport();
        setUsageData(usageResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching reports data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Loading reports...</p>
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
          <p className="text-gray-800 font-semibold mb-2">Error Loading Reports</p>
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
          <FileText className="w-8 h-8" />
          Report Management
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Create, view and manage comprehensive reports for EV Battery Swap Station
        </p>
      </div>

      {/* Live Usage Report (from API) */}
      {usageData && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Usage Report Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Frequency Data Points</span>
                  <span className="font-semibold text-slate-900">{usageData.data.frequency.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Peak Hours Data</span>
                  <span className="font-semibold text-slate-900">{usageData.data.peakHours.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                  <Download className="w-4 h-4" />
                  Export Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no usage data */}
      {!usageData && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-10 text-center text-slate-600">
          No usage data available.
        </div>
      )}
    </div>
  );
}
