import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { LanguageProvider } from "@/components/language-provider";
import { LanguageProvider as AppLanguageProvider } from "@/contexts/LanguageContext";
import { DemoModalProvider } from "@/components/demo-modal-provider";
import { ContactSalesProvider } from "@/components/contact-sales-provider";
import { AuthModalProvider } from "@/components/auth-modal-provider";
import { ReferenceDataProvider } from "@/contexts/ReferenceDataContext";
import { BuildingProvider } from "@/contexts/BuildingContext";
import { BuildingSelectionProvider } from "@/contexts/BuildingSelectionContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { NotificationBadgesProvider } from "@/contexts/NotificationBadgesContext";
import { ProtectedRoute } from "@/components/Common/ProtectedRoute";
import { queryClient } from "@/lib/queryClient";
import AppLayout from "./components/Layout/AppLayout";
import { SearchProvider } from "./contexts/search-provider";
import UnsubscribePage from "./pages/UnsubscribePage";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPasswordRedirect = lazy(() => import("./pages/ForgotPasswordRedirect"));
const ResetPasswordRedirect = lazy(() => import("./pages/ResetPasswordRedirect"));
const Profile = lazy(() => import("./components/ProfileGroup/Profile"));
const BoardPage = lazy(() => import("./pages/Board"));

const AssetsPage = lazy(() => import("./pages/Assets"));
const DocumentsPage = lazy(() => import("./pages/Documents"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Rooms = lazy(() => import("./pages/Rooms"));
const Spaces = lazy(() => import("./pages/Spaces"));
const QrCodes = lazy(() => import("./pages/QrCodes"));
const Insights = lazy(() => import("./pages/Insights"));
const Organisation = lazy(() => import("./pages/Organisation"));
const Help = lazy(() => import("./pages/Help"));
const Building = lazy(() => import("./pages/Building"));
const BuildingDetails = lazy(
  () => import("./components/Buildings/BuildingDetails")
);
const APITesting = lazy(() => import("./pages/APITesting"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const PublicReport = lazy(() => import("./pages/PublicReport"));
const ReportLocation = lazy(() => import("./pages/ReportLocation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Impressum = lazy(() => import("./pages/impressum"));
const AGB = lazy(() => import("./pages/agb"));
const Datenschutz = lazy(() => import("./pages/datenschutz"));

// Admin Panel Pages
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./pages/AdminCustomerDetail"));

// Main App Routes Component
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const RouteAwareFallback = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  if (isDashboard) {
    return <PageLoadingSkeleton variant="layout" />;
  }
  
  // Landing/public pages: simple centered spinner
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  );
};

const AppContent = () => {
  return (
    <AuthModalProvider>
      <SearchProvider>
        <Suspense fallback={<RouteAwareFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            {/*  <Route path="/login" element={<Login />} /> */}
            <Route path="/signup" element={<Signup />} />
            {/* Redirect old password reset routes to modal */}
            <Route path="/forgot-password" element={<ForgotPasswordRedirect />} />
            <Route path="/reset-password" element={<ResetPasswordRedirect />} />
            <Route path="/report" element={<PublicReport />} />
            <Route path="/report/location" element={<ReportLocation />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />

            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminTickets />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />

            <>
              {/* Dashboard routes with nested children */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    section="issues"
                    fallbackPath="/dashboard/profile"
                  >
                    <AppLayout>
                      <Index />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard/board"
                element={
                  <ProtectedRoute section="board">
                    <AppLayout>
                      <BoardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/board/:taskId"
                element={
                  <ProtectedRoute section="board">
                    <AppLayout>
                      <BoardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/tasks"
                element={
                  <ProtectedRoute section="tasks">
                    <AppLayout>
                      <Tasks />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/assets"
                element={
                  <ProtectedRoute section="assets">
                    <AppLayout>
                      <AssetsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/rooms"
                element={
                  <AppLayout>
                    <Rooms />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard/spaces"
                element={
                  <ProtectedRoute section="spaces">
                    <AppLayout>
                      <Spaces />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/documents"
                element={
                  <ProtectedRoute section="documents">
                    <AppLayout>
                      <DocumentsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/qr-codes"
                element={
                  <ProtectedRoute section="qrCodes">
                    <AppLayout>
                      <QrCodes />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/insights"
                element={
                  <ProtectedRoute section="insights">
                    <AppLayout>
                      <Insights />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/organisation"
                element={
                  <ProtectedRoute section="organisation">
                    <AppLayout>
                      <Organisation />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/help"
                element={
                  <AppLayout>
                    <Help />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard/help/:ticketId"
                element={
                  <AppLayout>
                    <Help />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard/building"
                element={
                  <ProtectedRoute section="buildings">
                    <AppLayout>
                      <Building />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/building/:id"
                element={
                  <ProtectedRoute section="buildings">
                    <AppLayout>
                      <BuildingDetails />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/api-testing"
                element={
                  <AppLayout>
                    <APITesting />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard/getting-started"
                element={
                  <AppLayout>
                    <GettingStarted />
                  </AppLayout>
                }
              />
            </>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </SearchProvider>
    </AuthModalProvider>
  );
};

// <ThemeProvider defaultTheme="system" storageKey="facility-ui-theme">
{
  /* </ThemeProvider> */
}
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppLanguageProvider>
      <LanguageProvider>
        <DemoModalProvider>
          <ContactSalesProvider>
            <BuildingSelectionProvider>
              <ReferenceDataProvider>
                <BuildingProvider>
                  <PermissionsProvider>
                    <NotificationBadgesProvider>
                      <TooltipProvider>
                        <Sonner />
                        <AppRoutes />
                      </TooltipProvider>
                    </NotificationBadgesProvider>
                  </PermissionsProvider>
                </BuildingProvider>
              </ReferenceDataProvider>
            </BuildingSelectionProvider>
          </ContactSalesProvider>
        </DemoModalProvider>
      </LanguageProvider>
    </AppLanguageProvider>
  </QueryClientProvider>
);

export default App;