
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import Index from "./pages/Index";
import Meditate from "./pages/Meditate";
import Dashboard from "./pages/Dashboard";
import GlobalDashboard from "./pages/GlobalDashboard";
import AuthCallback from "./pages/auth/callback";
import AuthTest from "./pages/auth/test";
import AuthDebug from "./pages/auth/debug";
import DirectTest from "./pages/auth/direct-test";

const queryClient = new QueryClient();
// Google Analytics Measurement ID
const GOOGLE_ANALYTICS_ID = "G-Y9ZZ4NRJGR";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <GoogleAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
        <AuthProvider>
          <Web3Provider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/test" element={<AuthTest />} />
              <Route path="/auth/debug" element={<AuthDebug />} />
              <Route path="/auth/direct" element={<DirectTest />} />
              <Route path="/global-dashboard" element={<GlobalDashboard />} />
              <Route
                path="/meditate"
                element={
                  <ProtectedRoute>
                    <Meditate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Web3Provider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
