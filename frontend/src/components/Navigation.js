// src/components/Navigation.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../contexts/RBACContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const { hasPermission } = useRBAC();

    return (
        <nav className="main-navigation">
            <div className="nav-brand">
                <h1>My App</h1>
            </div>

            <ul className="nav-links">
                <li>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                </li>

                {hasPermission('User Management', 'Read') && (
                    <li>
                        <NavLink to="/users">Users</NavLink>
                    </li>
                )}

                {hasPermission('Role Management', 'Read') && (
                    <li>
                        <NavLink to="/rbac">Roles</NavLink>
                    </li>
                )}

                {hasPermission('Task Management', 'Read') && (
                    <li>
                        <NavLink to="/tasks">Tasks</NavLink>
                    </li>
                )}

                {hasPermission('Machine Management', 'Read') && (
                    <li>
                        <NavLink to="/machines">Machines</NavLink>
                    </li>
                )}
            </ul>

            <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
                <button onClick={logout} className="logout-button">Logout</button>
            </div>
        </nav>
    );
};

export default Navigation;