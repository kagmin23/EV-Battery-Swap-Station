import { Routes, Route} from 'react-router-dom';
import Dashboard from '../features/staff/page/Dashboard';
import ConfirmExchange from '../features/staff/page/confirmExchange';

export default function StaffRouter() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="confirm-exchange" element={<ConfirmExchange />} />
    </Routes>
  );
}

