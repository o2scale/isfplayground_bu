// src/pages/Dashboard.js - Enhanced with interactive elements
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import AdminDashboard from './admin';
import StudentDashboard from './student';
import CoachDashboard from './coach';
import BalagruhaDashboard from './balagruha';
import MedicInchargeDashboard from './medicalIncharge';
import PurchaseDashboard from './purchaseDashboard';
import SportCoachDashboard from './Sportscoach';
import MusicCoachDashboard from './MusicCoach';
// const Dashboard = () => {
//     const { user } = useAuth();
//     const { canRead } = usePermission();

//     // Define modules and their routes
//     const modules = [
//         {
//             name: 'User Management',
//             icon: '👥',
//             path: '/users',
//             hasAccess: canRead('User Management')
//         },
//         {
//             name: 'Role Management',
//             icon: '🔑',
//             path: '/rbac',
//             hasAccess: canRead('Role Management')
//         },
//         {
//             name: 'Task Management',
//             icon: '📋',
//             path: '/task',
//             hasAccess: canRead('Task Management')
//         },
//         {
//             name: 'Machine Management',
//             icon: '🖥️',
//             path: '/machines',
//             hasAccess: canRead('Machine Management')
//         }
//     ];

//     // Filter modules to only show those the user has access to
//     const accessibleModules = modules.filter(module => module.hasAccess);

//     return (
//         <div className="dashboard">
//             <div className="page-header">
//                 <h1>Dashboard</h1>
//             </div>

//             <div className="welcome-card">
//                 <h2>Welcome, {user?.name}!</h2>
//                 <p>Role: <span className="role-badge">{user?.role}</span></p>
//                 <p>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//             </div>

//             {accessibleModules.length > 0 ? (
//                 <div className="modules-section">
//                     <h2>Your Accessible Modules</h2>

//                     <div className="modules-grid">
//                         {accessibleModules.map(module => (
//                             <div key={module.name} className="module-card">
//                                 <div className="module-icon">{module.icon}</div>
//                                 <h3>{module.name}</h3>
//                                 <Link to={module.path} className="module-link">
//                                     Go to {module.name}
//                                 </Link>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             ) : (
//                 <div className="no-modules">
//                     <p>You don't have access to any modules yet.</p>
//                     <p>Please contact an administrator if you need access.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

const Dashboard = () => {
    return (
        <>

            {/* ['admin', 'coach', 'balagruha in-charge', 'student', 'purchase-manager',
    'medical-incharge', 'sports-coach', 'music-coach', 'amma'] */}
            {
                localStorage.getItem('role') === 'admin' ? <AdminDashboard /> : localStorage.getItem('role') === 'student' ? <StudentDashboard /> : localStorage.getItem('role') === 'coach' ? <CoachDashboard /> : localStorage?.getItem('role') === 'balagruha-incharge' ? < PurchaseDashboard /> : localStorage?.getItem('role') === 'medical-incharge' ? <MedicInchargeDashboard /> : localStorage.getItem('role') === 'purchase-manager' ? <PurchaseDashboard /> : localStorage.getItem('role') === 'sports-coach' ? <MusicCoachDashboard /> : <MusicCoachDashboard />
            }
        </>
    )
}
export default Dashboard;