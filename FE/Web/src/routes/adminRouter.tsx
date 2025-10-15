import { Routes, Route } from 'react-router-dom';
import { ManagementLayout } from '../features/admin/layout/ManagementLayout';
import { useState } from 'react';
import Dashboard from '../features/admin/page/Dashboard';
import BatteryChanges from '../features/admin/page/BatteryChanges';
import RevenueReport from '../features/admin/page/RevenueReport';
import ReportManagement from '../features/admin/page/ReportManagement';
import AIForecast from '@/features/admin/page/AIForecast';

export default function AdminRouter() {
  const [activeTab, setActiveTab] = useState('overview');

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

