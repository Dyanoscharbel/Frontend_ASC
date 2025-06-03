import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthenticatedSidebar } from "./components/AuthenticatedSidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Tournaments from "./pages/Tournaments";
import TournamentsInfo from "./pages/TournamentsInfo";
import SponsorshipInfo from "./pages/SponsorshipInfo";
import NotFound from "./pages/NotFound";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";
import TournamentPayment from "./pages/TournamentPayment";
import TournamentRules from "./pages/TournamentRules";
import MatchDetails from "./pages/MatchDetails";
import Statistics from "./pages/Statistics";
import Disputes from "./pages/Disputes";
import Rewards from "./pages/Rewards";
import ValidatorDashboard from "./pages/ValidatorDashboard";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import Sponsorship from "./pages/Sponsorship";
import About from "./pages/About";
import Terms from "./pages/Terms";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Cookies from "./pages/Cookies";
import SupportPage from "./pages/Support";
import Wallet from "./pages/Wallet";
import Notifications from "./pages/Notifications";
import Leaderboard from "./pages/Leaderboard";
import FedaPayCallbackPage from "./pages/FedaPayCallbackPage";
import CinetPayCallbackPage from '@/pages/CinetPayCallbackPage';
import FAQ from "./pages/FAQ";


const queryClient = new QueryClient();

const AuthenticatedLayout = () => {
  return (
    <ProtectedRoute>
      <div className="relative min-h-screen">
        <AuthenticatedSidebar />
        <div className="p-4 lg:ml-64">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

const ValidatorRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="validator">
      {children}
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />

        {/* Pages publiques sans sidebar */}
        <Route path="/tournaments-info" element={<TournamentsInfo />} />
        <Route path="/sponsorship-info" element={<SponsorshipInfo />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/wallet/callback/fedapay" element={<FedaPayCallbackPage />} />
        <Route path="/wallet/callback/cinetpay" element={<CinetPayCallbackPage />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Pages authentifiées avec sidebar */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tournament-payment" element={<TournamentPayment />} />
          <Route path="/tournament-rules" element={<TournamentRules />} />
          <Route path="/match-details/:id" element={<MatchDetails />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/tournament/details/:id" element={<TournamentDetails />} />
          <Route path="/tournament/registration/:id" element={<TournamentRegistration />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/validator-dashboard" element={<ValidatorDashboard />} />
        </Route>

        {/* Route Validateur */}
        <Route path="/validator-dashboard" element={
          <ValidatorRoute>
            <ValidatorDashboard />
          </ValidatorRoute>
        } />

        {/* Routes Admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="tournaments/:id" element={<AdminTournamentDetails />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="communications" element={<AdminCommunications />} />
          <Route path="payments" element={<AdminDashboard />} />
          <Route path="validators" element={<AdminDashboard />} />
          <Route path="sponsorship" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
          <Route path="logs" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

import TournamentDetails from "./pages/TournamentDetails";
import TournamentRegistration from "./pages/TournamentRegistration";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminTournamentDetails from "./pages/admin/AdminTournamentDetails";
import AdminCommunications from "./pages/admin/AdminCommunications";

export default App;