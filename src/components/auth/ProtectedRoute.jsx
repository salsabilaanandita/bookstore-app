// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../store/useSession';
import { Skeleton } from '../ui/Skeleton';

export function ProtectedRoute({ children }) {
  const { status } = useSession();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg p-6">
        <div className="flex flex-col items-center gap-4 max-w-xs w-full">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleRoute({ allowedRoles = [], children }) {
  const { role, status } = useSession();

  if (status === 'loading') return null;

  if (!allowedRoles.includes(role)) {
    const fallbackPath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
