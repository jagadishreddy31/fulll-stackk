import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import CommunityFeed from './pages/CommunityFeed';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import './i18n/i18n'; // initialize i18next

function DashboardRouter() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'officer') return <OfficerDashboard />;
  if (user?.role === 'worker') return <WorkerDashboard />;
  return <CitizenDashboard />;
}

function App() {
  const { loading } = useContext(AuthContext);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/citizen" element={<Login expectedRole="citizen" />} />
            <Route path="/login/worker" element={<Login expectedRole="worker" />} />
            <Route path="/login/officer" element={<Login expectedRole="officer" />} />
            <Route path="/login/admin" element={<Login expectedRole="admin" />} />
            <Route path="/login" element={<Navigate to="/login/citizen" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
