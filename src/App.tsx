import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicAppWrapper } from "@/components/PublicAppWrapper";
import { ProtectedRoute, AuthRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

import { RecoveryRedirector } from "@/components/RecoveryRedirector";
import { StrictMode, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eager load landing and auth pages for faster initial load
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Lazy load dashboard and other authenticated pages
const BidRequestDashboard = lazy(() => import("./pages/BidRequestDashboard"));
const CreateBidRequest = lazy(() => import("./pages/CreateBidRequest"));
const BidResponse = lazy(() => import("./pages/BidResponse"));
const Buyers = lazy(() => import("./pages/Buyers"));
const Users = lazy(() => import("./pages/Users"));
const Dealerships = lazy(() => import("./pages/Dealerships"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const AccountEnterprise = lazy(() => import("./pages/AccountEnterprise"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MFAChallenge = lazy(() => import("./pages/auth/MFAChallenge"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  return (
    <StrictMode>
      <ErrorBoundary>
        <TooltipProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <PublicAppWrapper>
              <RecoveryRedirector />
              <Toaster />
              <Sonner position="top-center" />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/signin" 
                  element={
                    <AuthRoute>
                      <SignIn />
                    </AuthRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={<SignUp />} 
                />
                <Route 
                  path="/forgot-password" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AuthRoute>
                        <ForgotPassword />
                      </AuthRoute>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ResetPassword />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/password-reset" 
                  element={<Navigate to="/reset-password" replace />} 
                />
                <Route
                  path="/auth/mfa-challenge"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <MFAChallenge />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <BidRequestDashboard />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="/create-bid-request"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <CreateBidRequest />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="/bid-response/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <BidResponse />
                    </Suspense>
                  }
                />
                <Route
                  path="/buyers"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <Buyers />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="/dealerships"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <Dealerships />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <Users />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <AccountEnterprise />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route
                  path="/marketplace"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProtectedRoute>
                        <Marketplace />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />
                <Route path="*" element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
              </PublicAppWrapper>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

export default App;