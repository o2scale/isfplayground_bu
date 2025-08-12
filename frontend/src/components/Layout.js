// src/components/Layout.js
import React, { useEffect, useState, createContext, useContext } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import "./Layout.css";
import { useAuth } from "../contexts/AuthContext";
import { useRBAC } from "../contexts/RBACContext";
import { usePermission } from "./hooks/usePermission";

// Create Sidebar Context
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isSidebarCollapsed: false, toggleSidebar: () => {} };
  }
  return context;
};

const Layout = () => {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: rbacLoading } = useRBAC();
  const { canRead } = usePermission();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [visibleMenus, setVisibleMenus] = useState([]);
  const [role, setRole] = useState("");
  const [notifications, setNotifications] = useState(1);
  const [showChatWindow, setShowChatWindow] = useState(null); // null, "coach", or "admin"
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check if current route is WTF
  const isWTFRoute = location.pathname === "/wtf";

  const topMenus = [
    {
      id: 1,
      name: "Dashboard",
      link: "/dashboard",
      roles: [
        "admin",
        "coach",
        "balagruha-incharge",
        "student",
        "purchase-manager",
        "medical-incharge",
        "sports-coach",
        "music-coach",
        "amma",
      ],
    },
    { id: 2, name: "Users", link: "/users", roles: ["admin"] },
    { id: 3, name: "Machines", link: "/machines", roles: ["admin"] },
    { id: 4, name: "Tasks", link: "/task", roles: ["admin", "coach"] },
    {
      id: 5,
      name: "Attendance",
      link: "/attendance",
      roles: ["admin", "coach"],
    },
    { id: 6, name: "Balagruhas", link: "/balagruha", roles: ["admin"] },
    { id: 7, name: "Access", link: "/rbac", roles: ["admin"] },
    {
      id: 8,
      name: "WTF",
      link: "/wtf",
      roles: [
        "admin",
        "coach",
        "balagruha-incharge",
        "student",
        "purchase-manager",
        "medical-incharge",
        "sports-coach",
        "music-coach",
        "amma",
      ],
    },
  ];

  const sportCoachMenu = [
    { id: 1, name: "Dashboard", activeTab: "dashboard" },
    { id: 2, name: "Students", activeTab: "students" },
    { id: 3, name: "Training", activeTab: "training" },
    { id: 4, name: "Sports Tasks", activeTab: "tasks" },
    { id: 5, name: "Performance", activeTab: "performance" },
    { id: 6, name: "Reports", activeTab: "reports" },
  ];

  const notificationsList = [
    {
      id: 1,
      title: "New Lesson Available",
      message: "Check out the new English lesson!",
      time: "1 hour ago",
    },
    {
      id: 2,
      title: "Homework Reminder",
      message: "Don't forget to complete your homework",
      time: "3 hours ago",
    },
    {
      id: 3,
      title: "Achievement Unlocked",
      message: "You've earned the 'Fast Learner' badge!",
      time: "Yesterday",
    },
    {
      id: 4,
      title: "Coach Message",
      message: "Your coach sent you a new message",
      time: "Yesterday",
    },
    {
      id: 5,
      title: "ISF Shop Update",
      message: "New items available in the ISF shop",
      time: "2 days ago",
    },
  ];

  console.log(sportCoachMenu);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const NotificationsPanel = () => {
    return (
      <div className="notifications-panel">
        <div className="notifications-header">
          <h3>Notifications</h3>
          <button onClick={() => setShowNotifications(false)}>✖</button>
        </div>
        <div className="notifications-list">
          {notificationsList.map((notification) => (
            <div key={notification.id} className="notification-item">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">{notification.time}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Check if we're on the dashboard
  const isDashboard =
    location.pathname === "/dashboard" || location.pathname === "/";

  useEffect(() => {
    // Example: Get role from localStorage or API
    const userRole = localStorage.getItem("role") || "guest";
    setRole(userRole);

    // Filter menus based on user role
    const filteredMenus = topMenus.filter((menu) =>
      menu.roles.includes(userRole)
    );

    setVisibleMenus(filteredMenus);
  }, []);

  // Removed duplicate declaration of sportCoachMenu

  // If either auth or RBAC is loading, show loading screen
  if (authLoading || rbacLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // If not authenticated, just render the outlet (which should be login)
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="app-layout">
      {(localStorage.getItem("role") === "admin" ||
        localStorage.getItem("role") === "coach" ||
        localStorage.getItem("role") === "student") && (
        <div className="header">
          {/* Hamburger Menu Icon - Only show on WTF route */}
          {isWTFRoute && (
            <div
              className="hamburger-row"
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "5px",
              }}
            >
              <button
                className="hamburger-menu"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                ☰
              </button>
            </div>
          )}

          <div className="user-info" style={{ flexDirection: "row" }}>
            <h2>Hi {localStorage?.getItem("name")}</h2>
            {/* <div className="avatar">
                            {localStorage?.getItem('name').charAt(0)}
                        </div> */}
          </div>

          {/* Top Menu */}
          <div className="top-menu scrollable-menu">
            {visibleMenus.map((menu) => (
              <div
                key={menu.id}
                className="menu-item"
                onClick={() => navigate(menu?.link)}
              >
                {menu.name}
              </div>
            ))}
          </div>

          {localStorage.getItem("role") === "student" && (
            <>
              <div className="coins">
                <span className="coins-label">
                  ISF COINS
                  <br />
                  EARNED
                </span>
                <div className="coins-circle">50</div>
              </div>
              <div className="notifications-container">
                <div
                  className="notification-bell"
                  onClick={handleNotificationClick}
                >
                  🔔
                  {notifications > 0 && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </div>
                {showNotifications && <NotificationsPanel />}
              </div>
            </>
          )}

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}

      <div className="app-container">
        <main className="main-content">
          <SidebarContext.Provider
            value={{
              isSidebarCollapsed,
              toggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),
            }}
          >
            <Outlet />
          </SidebarContext.Provider>
        </main>
      </div>
    </div>
  );
};

export default Layout;
