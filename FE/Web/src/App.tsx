
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/common/home';
import Footer from './components/common/footer';
import { CommonHeader } from './components/common/CommonHeader';
import AdminRouter from './routes/adminRouter';
import StaffRouter from './routes/staffRouter';
import DriverRouter from './routes/driverRouter';
import { ManagementMainPage } from './features/admin/pages/ManagementMainPage';

function App() {
  return (
    <>
      <CommonHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<AdminRouter />} />
        <Route path="/staff/*" element={<StaffRouter />} />
        <Route path="/driver/*" element={<DriverRouter />} />
        <Route path="/overview" element={<ManagementMainPage />} />
        <Route path="/staff/list" element={<ManagementMainPage />} />
        <Route path="/staff/distribution" element={<ManagementMainPage />} />
        <Route path="/staff/activities" element={<ManagementMainPage />} />
        <Route path="/driver/list" element={<ManagementMainPage />} />
        <Route path="/battery-inventory" element={<ManagementMainPage />} />
        <Route path="/vehicles" element={<ManagementMainPage />} />
        <Route path="/subscriptions" element={<ManagementMainPage />} />
        <Route path="/transactions" element={<ManagementMainPage />} />
        <Route path="/settings" element={<ManagementMainPage />} />
      </Routes>
      <Footer />
    </>
  );
}



export default App;
