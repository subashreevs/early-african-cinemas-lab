import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  authLoaded: boolean;
  userRole: string | null;
  children: React.ReactNode;
  allowedRoles: string[];
  unauthorizedPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isLoggedIn,
  authLoaded,
  userRole,
  children,
  allowedRoles,
  unauthorizedPath = '/unauthorized'
}) => {
  if (!authLoaded) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
