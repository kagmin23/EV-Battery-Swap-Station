import { Routes, Route } from 'react-router-dom';
import { StaffLayout } from '../features/staff/layout/StaffLayout';
import Dashboard from '../features/staff/page/Dashboard';
import ConfirmExchange from '../features/staff/page/confirmExchange';

export default function StaffRouter() {
  return (
    <StaffLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="confirm-exchange" element={<ConfirmExchange />} />
      </Routes>
    </StaffLayout>
  );
}

