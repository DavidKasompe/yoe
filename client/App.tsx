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
import { Settings } from "./pages/settings/Settings";
import { ProfileSettings } from "./pages/settings/Profile";
import { SecuritySettings } from "./pages/settings/Security";
import { PreferencesSettings } from "./pages/settings/Preferences";
import { IntegrationsSettings } from "./pages/settings/Integrations";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/coach" element={<CoachDashboard />} />
            <Route path="/coach/*" element={<CoachDashboard />} />
            <Route path="/scout" element={<ScoutingReports />} />
            <Route path="/scout/*" element={<ScoutingReports />} />
            <Route path="/draft" element={<DraftIntelligence />} />
            <Route path="/draft/*" element={<DraftIntelligence />} />
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
