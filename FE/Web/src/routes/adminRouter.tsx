import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/admin/page/Dashboard';
import BatteryChanges from '../features/admin/page/BatteryChanges';
import RevenueReport from '../features/admin/page/RevenueReport';
import ReportManagement from '../features/admin/page/ReportManagement';

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="battery-changes" element={<BatteryChanges />} />
      <Route path="revenue-report" element={<RevenueReport />} />
      <Route path="report-management" element={<ReportManagement />} />
    </Routes>
  );
}

