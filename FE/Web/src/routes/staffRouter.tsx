import { Routes, Route, Navigate } from 'react-router-dom';
import { StaffLayout } from '../features/staff/layout/StaffLayout';
import Dashboard from '../features/staff/page/Dashboard';
import BatteryLog from '../features/staff/page/BatteryLog';
import PaymentHistory from '../features/staff/page/PaymentHistory';
import { StaffManagementMainPage } from '../features/admin/pages/StaffManagementMainPage';
import IdleBatteries from '../features/staff/page/IdleBatteries';
import SupportRequests from '../features/staff/page/SupportRequests';

export default function StaffRouter() {
  return (
    <StaffLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="battery/:batteryId" element={<BatteryLog />} />
        <Route path="payment-history" element={<PaymentHistory />} />
        <Route path="idle-batteries" element={<IdleBatteries />} />
        <Route path="support-requests" element={<SupportRequests />} />
        <Route path="management/*" element={<StaffManagementMainPage />} />
      </Routes>
    </StaffLayout>
  );
}

