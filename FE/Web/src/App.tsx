import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/page/login';
import RegisterPage from './features/auth/page/register';
import VerifyOTPPage from './features/auth/page/verify-otp';
import Home from './components/common/home';
import Footer from './components/common/footer';
import { CommonHeader } from './components/common/CommonHeader';
import AdminRouter from './routes/adminRouter';
import StaffRouter from './routes/staffRouter';
import DriverRouter from './routes/driverRouter';
import { ManagementMainPage } from './features/admin/pages/ManagementMainPage';
import ProfileMe from './pages/ProfileMe';

function App() {
  return (
    <AuthProvider>
      <div className="h-screen">
        <Routes>
          {/* Auth Routes - Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Home Route */}
          <Route path="/home" element={
            <>
              <CommonHeader />
              <div className="flex-1 overflow-hidden">
                <Home />
              </div>
              <Footer />
            </>
          } />

          {/* Protected Routes */}

          {/* Profile Route - All authenticated users */}
          <Route path="/profile/me" element={
            <ProtectedRoute>
              <ProfileMe />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminRouter />
            </ProtectedRoute>
          } />

          <Route path="/overview" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/battery-inventory" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/faulty-batteries" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/vehicles" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/subscriptions" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/feedbacks" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/usage-report" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/ai-predictions" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/*" element={
            <ProtectedRoute requiredRole="staff">
              <StaffRouter />
            </ProtectedRoute>
          } />

          <Route path="/staff/list" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/staff/distribution" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/staff/activities" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/staff/station-list" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          <Route path="/staff/settings" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          {/* Driver Routes */}
          <Route path="/driver/*" element={
            <ProtectedRoute requiredRole="driver">
              <DriverRouter />
            </ProtectedRoute>
          } />

          <Route path="/driver/list" element={
            <ProtectedRoute requiredRole="admin">
              <ManagementMainPage />
            </ProtectedRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;





