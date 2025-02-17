
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AuthRoute } from "@/components/ProtectedRoute";
import { PasswordResetRoute } from "@/components/PasswordResetRoute";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BidRequestDashboard from "./pages/BidRequestDashboard";
import CreateBidRequest from "./pages/CreateBidRequest";
import BidResponse from "./pages/BidResponse";
import Buyers from "./pages/Buyers";
import Users from "./pages/Users";
import Dealerships from "./pages/Dealerships";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
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
              element={
                <AuthRoute>
                  <SignUp />
                </AuthRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <AuthRoute>
                  <ForgotPassword />
                </AuthRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PasswordResetRoute>
                  <ResetPassword />
                </PasswordResetRoute>
              } 
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <BidRequestDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-bid-request"
              element={
                <ProtectedRoute>
                  <CreateBidRequest />
                </ProtectedRoute>
              }
            />
            {/* Remove ProtectedRoute wrapper for bid-response */}
            <Route
              path="/bid-response"
              element={<BidResponse />}
            />
            <Route
              path="/buyers"
              element={
                <ProtectedRoute>
                  <Buyers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dealerships"
              element={
                <ProtectedRoute>
                  <Dealerships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
