// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize auth state from localStorage on app load
    useEffect(() => {
        const initializeAuth = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = {
                name: localStorage.getItem('name'),
                role: localStorage.getItem('role'),
                id: localStorage.getItem('userId')
            };

            if (storedToken && storedUser.name && storedUser.role) {
                setToken(storedToken);
                setUser(storedUser);
                setIsAuthenticated(true);

                // Set up axios default headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    // Login function
    const login = (userData) => {
        const { token, user } = userData;

        // Save to state
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('name', user.name);
        localStorage.setItem('role', user.role);
        localStorage.setItem('balagruhaIds', user?.balagruhaIds);
        if (user.id) localStorage.setItem('userId', user.id);

        // Set up axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    // Logout function
    const logout = () => {
        // Clear state
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('balagruhaIds');
        localStorage.removeItem('taskManagementFilters');

        // Clear axios headers
        delete axios.defaults.headers.common['Authorization'];

        // Redirect to login
        navigate('/login');
    };

    // Check if user has a specific role
    const hasRole = (role) => {
        if (!user) return false;
        return user.role.toLowerCase() === role.toLowerCase();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isLoading,
                login,
                logout,
                hasRole
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};