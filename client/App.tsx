import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Index } from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CoachDashboard } from "./pages/CoachDashboard";
import { ScoutingReports } from "./pages/ScoutingReports";
import { DraftIntelligence } from "./pages/DraftIntelligence";
import { SignIn } from "./pages/auth/SignIn";
import { SignUp } from "./pages/auth/SignUp";
import { OAuthCallback } from "./pages/auth/OAuthCallback";
import { Settings } from "./pages/settings/Settings";
import { ProfileSettings } from "./pages/settings/Profile";
import { SecuritySettings } from "./pages/settings/Security";
import { PreferencesSettings } from "./pages/settings/Preferences";
import { IntegrationsSettings } from "./pages/settings/Integrations";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/auth/oauth/callback" element={<OAuthCallback />} />
            
            {/* Protected routes - Coach/Analyst only */}
            <Route
              path="/coach"
              element={
                <ProtectedRoute allowedRoles={["Coach", "Analyst", "Admin"]}>
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/*"
              element={
                <ProtectedRoute allowedRoles={["Coach", "Analyst", "Admin"]}>
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scout"
              element={
                <ProtectedRoute allowedRoles={["Coach", "Analyst", "Admin"]}>
                  <ScoutingReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scout/*"
              element={
                <ProtectedRoute allowedRoles={["Coach", "Analyst", "Admin"]}>
                  <ScoutingReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/draft"
              element={
                <ProtectedRoute allowedRoles={["Coach", "Analyst", "Admin"]}>
                  <DraftIntelligence />
                </ProtectedRoute>
              }
            />
            <Route
              path="/draft/*"
              element={
                <ProtectedRoute allowedRoles={["Coach", "Analyst", "Admin"]}>
                  <DraftIntelligence />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Settings routes - All authenticated users */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/preferences" element={<PreferencesSettings />} />
            <Route path="/settings/integrations" element={<IntegrationsSettings />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
