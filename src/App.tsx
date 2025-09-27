
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicAppWrapper } from "@/components/PublicAppWrapper";
import { ProtectedRoute, AuthRoute } from "@/components/ProtectedRoute";
import { PasswordResetRoute } from "@/components/PasswordResetRoute";
import { RecoveryRedirector } from "@/components/RecoveryRedirector";
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
import SmsTest from "./pages/SmsTest";
import MFAChallenge from "./pages/MFAChallenge";
import { StrictMode } from "react";

const App = () => (
  <StrictMode>
    <TooltipProvider>
      <BrowserRouter>
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
              path="/password-reset" 
              element={<Navigate to="/reset-password" replace />} 
            />
            <Route 
              path="/auth/mfa-challenge" 
              element={<MFAChallenge />} 
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
            <Route
              path="/bid-response/:id"
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
            <Route
              path="/sms-test"
              element={
                <ProtectedRoute>
                  <SmsTest />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PublicAppWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </StrictMode>
);

export default App;
