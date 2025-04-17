// src/AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import TaskManagement from './pages/TaskManagement';
import MachineManagement from './pages/MachineManagement';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Dashboard - accessible to any authenticated user */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* User Management */}
            <Route element={<ProtectedRoute module="User Management" action="Read" />}>
                <Route path="/users" element={<UserManagement />} />
            </Route>

            {/* Role Management */}
            <Route element={<ProtectedRoute module="Role Management" action="Read" />}>
                <Route path="/rbac" element={<RoleManagement />} />
            </Route>

            {/* Task Management */}
            <Route element={<ProtectedRoute module="Task Management" action="Read" />}>
                <Route path="/tasks" element={<TaskManagement />} />
            </Route>

            {/* Machine Management */}
            <Route element={<ProtectedRoute module="Machine Management" action="Read" />}>
                <Route path="/machines" element={<MachineManagement />} />
            </Route>

            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;