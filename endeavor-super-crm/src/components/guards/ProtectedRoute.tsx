// ProtectedRoute Component
// Enforces authentication and authorization at route level
// Returns proper HTTP status codes behavior (401 Unauthorized, 403 Forbidden)

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Permission, UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  // Module this route belongs to (for module-level access control)
  module?: string;
  
  // Specific permissions required (any of these)
  requiredPermissions?: Permission[];
  
  // Specific permissions required (all of these)
  requiredAllPermissions?: Permission[];
  
  // Allowed roles (if specified, only these roles can access)
  allowedRoles?: UserRole[];
  
  // Denied roles (explicitly block these roles)
  deniedRoles?: UserRole[];
  
  // Custom authorization check
  customCheck?: () => boolean;
  
  // Where to redirect when not authenticated
  redirectTo?: string;
  
  // Where to redirect when authenticated but not authorized (403)
  forbiddenRedirectTo?: string;
  
  // Show loading state while checking auth
  loadingComponent?: React.ReactNode;
  
  // Children to render when authorized
  children?: React.ReactNode;
}

// Access denied component
function AccessDenied({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="max-w-md w-full mx-4 p-8 card text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--error-light)] flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Access Denied
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          {reason}
        </p>
        <a 
          href="/dashboard" 
          className="btn btn-primary inline-flex items-center"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

// Authentication required component
function AuthenticationRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="max-w-md w-full mx-4 p-8 card text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--warning-light)] flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Authentication Required
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Please sign in to access this page.
        </p>
        <a 
          href="/login" 
          className="btn btn-primary inline-flex items-center"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  module,
  requiredPermissions = [],
  requiredAllPermissions = [],
  allowedRoles,
  deniedRoles,
  customCheck,
  redirectTo = '/login',
  forbiddenRedirectTo = '/access-denied',
  loadingComponent,
  children,
}: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    canAccessModule, 
    hasAnyPermission, 
    hasAllPermissions,
    isAdmin,
  } = useAuth();
  
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
          </div>
        )}
      </>
    );
  }

  // 1. CHECK AUTHENTICATION (401 behavior)
  if (!isAuthenticated || !user) {
    // Redirect to login, but save the current location for post-login redirect
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 2. CHECK ROLE RESTRICTIONS (403 behavior)
  
  // Check denied roles first (explicit block)
  if (deniedRoles && deniedRoles.length > 0) {
    if (deniedRoles.includes(user.role)) {
      // Log denied access attempt
      console.warn(`[AUTH] Role ${user.role} denied access to ${location.pathname}`);
      return (
        <Navigate to={forbiddenRedirectTo} replace />
      );
    }
  }

  // Check allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.warn(`[AUTH] Role ${user.role} not in allowed list for ${location.pathname}`);
      return (
        <AccessDenied reason="Your account type does not have permission to access this page." />
      );
    }
  }

  // 3. CHECK MODULE ACCESS
  if (module) {
    if (!canAccessModule(module)) {
      console.warn(`[AUTH] Module ${module} access denied for role ${user.role}`);
      return (
        <AccessDenied reason="You do not have permission to access this module." />
      );
    }
  }

  // 4. CHECK PERMISSIONS (any)
  if (requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      console.warn(`[AUTH] Missing required permissions for ${location.pathname}`);
      return (
        <AccessDenied reason="You are missing required permissions to access this page." />
      );
    }
  }

  // 5. CHECK PERMISSIONS (all)
  if (requiredAllPermissions.length > 0) {
    if (!hasAllPermissions(requiredAllPermissions)) {
      console.warn(`[AUTH] Missing some required permissions for ${location.pathname}`);
      return (
        <AccessDenied reason="You are missing some required permissions to access this page." />
      );
    }
  }

  // 6. CUSTOM CHECK
  if (customCheck) {
    if (!customCheck()) {
      console.warn(`[AUTH] Custom check failed for ${location.pathname}`);
      return (
        <AccessDenied reason="Access requirements not met." />
      );
    }
  }

  // All checks passed - render children
  return <>{children || <Outlet />}</>;
}

// Convenience wrappers for common use cases

// Admin-only route
export function AdminRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      allowedRoles={['admin']}
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}

// Internal team only (admin + ops)
export function InternalRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      allowedRoles={['admin', 'endeavor_ops']}
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}

// External users only (clients, freelancers, etc.)
export function ExternalRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      allowedRoles={['client', 'freelancer', 'contractor', 'vendor']}
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}

// Finance access (admin + ops + external for their own invoices)
export function FinanceRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      module="finance"
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}

// People module access
export function PeopleRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      module="people"
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}

// Work/Delivery module access
export function WorkDeliveryRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      module="work_delivery"
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}

// Audit log access (admin only)
export function AuditRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredPermissions={['action:view:audit_logs']}
      forbiddenRedirectTo="/access-denied"
    >
      {children}
    </ProtectedRoute>
  );
}
