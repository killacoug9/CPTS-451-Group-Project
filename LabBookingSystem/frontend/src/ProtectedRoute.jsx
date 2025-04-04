import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

// To protect routes that require authentication
const ProtectedRoute = ({ requireAdmin = false }) => {
    const { currentUser, loading, isAdmin } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" replace />;
    }

    // If user is authenticated (and is admin if required) then render child routes
    return <Outlet />;
};

export default ProtectedRoute;