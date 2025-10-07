import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/admin/page/Dashboard';
import BatteryChanges from '../features/admin/page/BatteryChanges';

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="battery-changes" element={<BatteryChanges />} />
    </Routes>
  );
}

