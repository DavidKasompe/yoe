import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/MainLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

/**
 * Settings Layout
 * /settings/layout
 * 
 * Check authentication
 * If not authenticated:
 *   Redirect to /auth/sign-in
 * 
 * Render SettingsLayout
 *   Render SettingsSidebar
 *   Render active settings page
 */
export function SettingsLayout({ children }: SettingsLayoutProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to /auth/sign-in
      navigate("/auth/sign-in", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="flex min-h-screen">
        {/* Render SettingsSidebar */}
        <SettingsSidebar />
        {/* Render active settings page */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </MainLayout>
  );
}
