import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Devices from './pages/Devices/Devices';
import DeviceDetail from './pages/Devices/DeviceDetail';
import Configurations from './pages/Configurations/Configurations';
import ConfigurationDetail from './pages/Configurations/ConfigurationDetail';
import ConfigurationUpload from './pages/Configurations/ConfigurationUpload';
import ConfigurationApply from './pages/Configurations/ConfigurationApply';
import AuditLogs from './pages/Audit/AuditLogs';
import UserManagement from './pages/Admin/UserManagement';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Devices */}
                <Route path="devices" element={<Devices />} />
                <Route path="devices/:id" element={<DeviceDetail />} />
                
                {/* Configurations */}
                <Route path="configurations" element={<Configurations />} />
                <Route path="configurations/upload" element={<ConfigurationUpload />} />
                <Route path="configurations/:id" element={<ConfigurationDetail />} />
                <Route path="configurations/:id/apply" element={<ConfigurationApply />} />
                
                {/* Audit Logs */}
                <Route path="audit" element={<AuditLogs />} />
                
                {/* Admin Routes */}
                <Route path="admin/users" element={
                  <ProtectedRoute requiredRole="Admin">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                
                {/* Settings */}
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
