
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Companies from "./pages/Companies";
import Enterprise from "./pages/Enterprise";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile } = useAuth();
  
  // Add console logs for debugging
  console.log("Full profile data:", profile);
  console.log("Current user role:", profile?.role);
  
  // If there's no session, redirect to auth page
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // If we're still loading the profile, show a loading state
  if (session && !profile) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

// Auth Route component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    <Route
      path="/companies"
      element={
        <ProtectedRoute>
          <Companies />
        </ProtectedRoute>
      }
    />
    <Route
      path="/enterprise"
      element={
        <ProtectedRoute>
          <Enterprise />
        </ProtectedRoute>
      }
    />
    <Route
      path="/products"
      element={
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      }
    />
    <Route
      path="/auth"
      element={
        <AuthRoute>
          <Auth />
        </AuthRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
