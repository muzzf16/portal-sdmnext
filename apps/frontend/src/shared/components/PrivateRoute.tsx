import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can render a loading spinner here
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowed roles are specified, check if user's role is included
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or dashboard based on role
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user.role === 'supervisor') return <Navigate to="/dashboard/supervisor" replace />;
    return <Navigate to="/dashboard/employee" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;