import { Routes, Route, useLocation } from 'react-router-dom';
import { ManagementLayout } from '../features/admin/layout/ManagementLayout';
import { useState, useEffect } from 'react';
import Dashboard from '../features/admin/page/Dashboard';
import BatteryChanges from '../features/admin/page/BatteryChanges';
import RevenueReport from '../features/admin/page/RevenueReport';
import ReportManagement from '../features/admin/page/ReportManagement';
import AIForecast from '@/features/admin/page/AIForecast';

export default function AdminRouter() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync activeTab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) setActiveTab('dashboard');
    else if (path.includes('/admin/battery-changes')) setActiveTab('battery-changes');
    else if (path.includes('/admin/ai-forecast')) setActiveTab('ai-forecast');
    else if (path.includes('/admin/report-management')) setActiveTab('report-management');
    else if (path.includes('/admin/revenue-report')) setActiveTab('revenue-report');
  }, [location.pathname]);

  return (
    <ManagementLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="battery-changes" element={<BatteryChanges />} />
        <Route path="revenue-report" element={<RevenueReport />} />
        <Route path="report-management" element={<ReportManagement />} />
        <Route path="ai-forecast" element={<AIForecast />} /> 
      </Routes>
    </ManagementLayout>
  );
}

