// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from './hooks/usePermission';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../contexts/RBACContext';

const ProtectedRoute = ({ children, module, action }) => {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const { isLoading: rbacLoading, permissions } = useRBAC();
    const { can } = usePermission();

    // If either auth or RBAC is loading, show loading
    if (authLoading || rbacLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading permissions...</p>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // If module and action are specified, check permissions
    if (module && action) {
        const hasPermission = can(action, module);

        console.log(`Permission check for ${user?.role} - ${module}:${action} = ${hasPermission}`);
        console.log('Available permissions:', permissions);

        // if (!hasPermission) {
        //     console.log(`Access denied for ${user?.role} to ${action} on ${module}`);
        //     return <Navigate to="/access-denied" replace />;
        // }
    }

    // If authenticated and has permission (or no permission check needed), render the children
    return children;
};

export default ProtectedRoute;