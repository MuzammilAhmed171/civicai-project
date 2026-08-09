import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import Register from './pages/Register';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminDuplicates from './pages/AdminDuplicates';
import AdminReports from './pages/AdminReports';

function App() {
  useEffect(() => {
    // Automatically enforce home hash routing if landed without hash
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#') {
      window.location.hash = '#/';
    }
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Citizen Portal & Citizen Pages */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <Navbar />
                <div className="flex-1">
                  <Routes>
                    <Route path="" element={<Home />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/submit" element={<SubmitComplaint />} />
                    <Route path="/complaints" element={<MyComplaints />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </div>
              </div>
            }
          />

          {/* Protected Dual Login Route */}
          <Route path="/admin-login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Light Mode Admin Control Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="duplicates" element={<AdminDuplicates />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
