'use client';

import React from 'react';
import AuthGuard from './AuthGuard';

/**
 * Higher-order component that wraps a component with authentication protection
 * @param WrappedComponent - The component to protect
 * @param fallback - Optional fallback component to show when not authenticated
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ComponentType
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard fallback={fallback ? React.createElement(fallback) : undefined}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

export default withAuth;
