import { Routes, Route, Navigate } from 'react-router-dom';
import { ManagementMainPage } from './features/admin/pages/ManagementMainPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/overview" replace />} />

      {/* Management Routes */}
      <Route path="/overview" element={<ManagementMainPage />} />
      <Route path="/staff/list" element={<ManagementMainPage />} />
      <Route path="/staff/distribution" element={<ManagementMainPage />} />
      <Route path="/staff/activities" element={<ManagementMainPage />} />
      <Route path="/driver/list" element={<ManagementMainPage />} />
      <Route path="/battery-inventory" element={<ManagementMainPage />} />
      <Route path="/battery-return" element={<ManagementMainPage />} />
      <Route path="/vehicles" element={<ManagementMainPage />} />
      <Route path="/subscriptions" element={<ManagementMainPage />} />
      <Route path="/transactions" element={<ManagementMainPage />} />
      <Route path="/settings" element={<ManagementMainPage />} />
    </Routes>
  );
}

export default App
