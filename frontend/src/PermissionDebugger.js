// src/components/PermissionDebugger.js
import React from 'react';
import { useRBAC } from './contexts/RBACContext';
import { useAuth } from './contexts/AuthContext';

const PermissionDebugger = () => {
    const { permissions, hasPermission } = useRBAC();
    const { user } = useAuth();

    // Log permissions to console
    // console.log('Current permissions:', permissions);
    // console.log('User role:', user?.role);

    const modules = ['User Management', 'Role Management', 'Task Management', 'Machine Management'];
    const actions = ['Create', 'Read', 'Update', 'Delete'];

    modules.forEach(module => {
        actions.forEach(action => {
            const result = hasPermission(module, action);
            console.log(`Permission check: ${module}:${action} = ${result}`);
        });
    });

    return null;
};

export default PermissionDebugger;