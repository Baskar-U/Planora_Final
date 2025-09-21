import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { UserTypeProvider } from "@/contexts/UserTypeContext";
import { OrderTrackingProvider } from "@/contexts/OrderTrackingContext";
import { RedirectProvider } from "@/contexts/RedirectContext";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";
import { ToastContainer, useToast } from "@/components/FeedbackToast";
import ProtectedRoute from "@/components/ProtectedRoute";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Orders from "@/pages/Orders";
import PostOrder from "@/pages/PostOrder";
import OrderForm from "@/pages/OrderForm";
import OrderTracking from "@/pages/OrderTracking";
import VendorRequests from "@/pages/VendorRequests";

import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Cart from "@/pages/Cart";
import VendorProfile from "@/pages/VendorProfile";
import Vendors from "@/pages/Vendors";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";
import VendorDashboard from "@/pages/VendorDashboard";
import VendorProfileManagement from "@/pages/VendorProfileManagement";
import AddService from "@/pages/AddService";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";


function Router() {
  useNavigationLoading();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Protected Routes - Require Authentication */}
      <Route path="/orders" component={() => (
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      )} />
      <Route path="/post-order" component={() => (
        <ProtectedRoute>
          <PostOrder />
        </ProtectedRoute>
      )} />
      <Route path="/order/:eventType" component={() => (
        <ProtectedRoute>
          <OrderForm />
        </ProtectedRoute>
      )} />
      <Route path="/order-tracking" component={() => (
        <ProtectedRoute>
          <OrderTracking />
        </ProtectedRoute>
      )} />
      <Route path="/vendor-requests" component={() => (
        <ProtectedRoute>
          <VendorRequests />
        </ProtectedRoute>
      )} />
      <Route path="/messages" component={() => (
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      )} />
      <Route path="/profile" component={() => (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )} />
      <Route path="/cart" component={() => (
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      )} />
      <Route path="/my-orders" component={() => (
        <ProtectedRoute>
          <CustomerOrdersPage />
        </ProtectedRoute>
      )} />
      <Route path="/vendor-dashboard" component={() => (
        <ProtectedRoute>
          <VendorDashboard />
        </ProtectedRoute>
      )} />
      <Route path="/vendor-profile" component={() => (
        <ProtectedRoute>
          <VendorProfileManagement />
        </ProtectedRoute>
      )} />
      <Route path="/add-service" component={() => (
        <ProtectedRoute>
          <AddService />
        </ProtectedRoute>
      )} />
      
                    {/* Public Routes - No Authentication Required */}
              <Route path="/vendors" component={Vendors} />
              <Route path="/vendor/:id" component={VendorProfile} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toasts, dismissToast } = useToast();

  return (
    <QueryClientProvider client={queryClient}>
      <UserTypeProvider>
        <RedirectProvider>
          <OrderTrackingProvider>
            <LoadingProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
              </TooltipProvider>
            </LoadingProvider>
          </OrderTrackingProvider>
        </RedirectProvider>
      </UserTypeProvider>
    </QueryClientProvider>
  );
}

export default App;
