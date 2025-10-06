import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/admin/page/Dashboard';

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
    </Routes>
  );
}

