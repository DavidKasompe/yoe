import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, isAdmin } from "@shared/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

/**
 * Protected Route Wrapper
 * 
 * Authentication Flow:
 * - Check authentication
 * - Valid token? → YES → Render page
 *                → NO  → Redirect to Sign In
 * 
 * Role-Based Feature Access:
 * - Check role
 * - Allowed (or Admin) → Render module
 * - Denied → Show restricted access message
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission, isAdmin: isUserAdmin } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // Admin has access to everything
  if (isUserAdmin) {
    return <>{children}</>;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Access Restricted</h2>
          <p className="text-neutral-600 mb-4">
            Your role ({user.role}) does not have access to this section.
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Required roles: {allowedRoles.join(", ")}
          </p>
          <a
            href="/coach"
            className="inline-block px-6 py-2 bg-brown text-white rounded-lg font-medium hover:bg-brown-light transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364l-4.243 4.243a8 8 0 11-11.314 0l4.243-4.243"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Permission Required</h2>
          <p className="text-neutral-600 mb-4">
            You don't have the required permission to access this feature.
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Required permission: {requiredPermission}
          </p>
          <a
            href="/coach"
            className="inline-block px-6 py-2 bg-brown text-white rounded-lg font-medium hover:bg-brown-light transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
