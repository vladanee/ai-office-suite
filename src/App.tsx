import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Personas from "./pages/Personas";
import Departments from "./pages/Departments";
import Chat from "./pages/Chat";
import Workflows from "./pages/Workflows";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import Runs from "./pages/Runs";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/personas" element={<Personas />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id" element={<WorkflowBuilder />} />
              <Route path="/runs" element={<Runs />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
