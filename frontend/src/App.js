// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TaskManagement from './components/TaskManagement/taskmanagement';
import AccessDenied from './components/AccessDenied';
import NotFound from './components/NotFound';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import LoginCard from './components/login/logincard';
import UserManagement from './components/usermanagement/usermanagement';
import RBACManagement from './components/RBAC/RBACManagement';
import MachineManagement from './components/machineManagement/machineManagement';
import Dashboard from './components/dashboard/dashboard';
import PermissionDebugger from './PermissionDebugger';
import BalagruhaDashboard from './components/dashboard/balagruha';
import AttendanceComponent from './components/Attendance/attendance';
import BalagruhaManagement from './components/balagruhaManagement/balagruhamanagement';

const App = () => {
  return (
    <>
      <Router>
        <AuthProvider>
          <RBACProvider>
            <PermissionDebugger />
            <Toaster position="top-right" />
            <Routes>
              {/* Public route for login */}
              <Route path="/login" element={<LoginCard />} />

              {/* Routes inside the layout */}
              <Route element={<Layout />}>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard - accessible to all authenticated users */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes with specific permissions */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute module="User Management" action="Read">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rbac"
                  element={
                    <ProtectedRoute module="Role Management" action="Read">
                      <RBACManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/task"
                  element={
                    <ProtectedRoute module="Task Management" action="Read">
                      <TaskManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/machines"
                  element={
                    <ProtectedRoute module="Machine Management" action="Read">
                      <MachineManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/balagruha"
                  element={
                    // <ProtectedRoute module="Machine Management" action="Read">
                    // <BalagruhaDashboard />
                    <BalagruhaManagement />
                    // </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    // <ProtectedRoute module="Machine Management" action="Read">
                    <AttendanceComponent />
                    // </ProtectedRoute>
                  }
                />

                {/* Error pages */}
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </RBACProvider>
        </AuthProvider>
      </Router>
    </>
  );
};

export default App;