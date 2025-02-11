
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BidRequestDashboard from "./pages/BidRequestDashboard";
import CreateBidRequest from "./pages/CreateBidRequest";
import BidResponse from "./pages/BidResponse";
import Buyers from "./pages/Buyers";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<BidRequestDashboard />} />
          <Route path="/create-bid-request" element={<CreateBidRequest />} />
          <Route path="/bid-response" element={<BidResponse />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/users" element={<Users />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
