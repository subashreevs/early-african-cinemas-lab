import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  authLoaded: boolean;
  userRole: string | null;
  children: React.ReactNode;
  unauthorizedPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isLoggedIn,
  authLoaded,
  userRole,
  children,
  unauthorizedPath = '/unauthorized'
}) => {
  // Wait until authentication has been loaded.
  if (!authLoaded) {
    return <div>Loading...</div>;
  }

  // Redirect user if not logged in or if userRole is not admin.
  if (!isLoggedIn || userRole !== 'admin') {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
