'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children
}) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      openAuthModal();
    }
  }, [isAuthenticated, isLoading, openAuthModal]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-ocean-deep flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white font-medium">Loading...</p>
      </div>
    </div>;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;
