import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const location = useLocation();

    if (!isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
