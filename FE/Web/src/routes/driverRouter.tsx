import { Routes, Route, Navigate } from 'react-router-dom';

export default function DriverRouter() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-6">Driver Dashboard - Coming Soon</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

