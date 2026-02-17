import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const DashboardIndex: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'admin':
            return <Navigate to="/dashboard/admin" replace />;
        case 'supervisor':
            return <Navigate to="/dashboard/supervisor" replace />;
        case 'employee':
        default:
            return <Navigate to="/dashboard/employee" replace />;
    }
};

export default DashboardIndex;
