// src/components/RoleBasedNavigation.js
import React from "react";
import { NavLink } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { useAuth } from "../contexts/AuthContext";

const RoleBasedNavigation = () => {
  const { user, logout } = useAuth();
  const { canRead, getAccessibleModules } = usePermission();

  // Get modules the user has access to
  const accessibleModules = getAccessibleModules();

  // Map module names to routes and icons
  const moduleRoutes = {
    "User Management": { path: "/users", icon: "👥" },
    "Role Management": { path: "/rbac", icon: "🔑" },
    "Task Management": { path: "/tasks", icon: "📋" },
    "Machine Management": { path: "/machines", icon: "🖥️" },
  };

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <h1>Balagruha App</h1>
      </div>

      <ul className="nav-links">
        {/* Dashboard is accessible to all authenticated users */}
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>
        </li>

        {/* Dynamically generate navigation based on permissions */}
        {accessibleModules.map(
          (module) =>
            // Only show if user has Read permission
            canRead(module) &&
            moduleRoutes[module] && (
              <li key={module}>
                <NavLink
                  to={moduleRoutes[module].path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <span className="nav-icon">{moduleRoutes[module].icon}</span>
                  <span className="nav-text">{module}</span>
                </NavLink>
              </li>
            )
        )}
      </ul>

      <div className="user-menu">
        <div className="user-info" style={{ flexDirection: "row" }}>
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
