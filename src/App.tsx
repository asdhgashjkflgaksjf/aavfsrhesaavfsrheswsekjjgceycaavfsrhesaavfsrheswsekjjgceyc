import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityProvider } from "@/components/security";
import Index from "./pages/Index";
import OrderStatus from "./pages/OrderStatus";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Obfuscated admin path for security
const ADMIN_PATH = "/774a4656a61940c59a0f5df32b7784d6";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SecurityProvider
        enableGeoBlock={true}
        enableBotDetection={true}
        enableDevToolsProtection={true}
        enableRightClickProtection={true}
        enableKeyboardProtection={true}
        enableFrameProtection={true}
      >
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order-status" element={<OrderStatus />} />
            <Route path={ADMIN_PATH} element={<AdminLogin />} />
            <Route path={`${ADMIN_PATH}/setup`} element={<AdminSetup />} />
            <Route path={`${ADMIN_PATH}/dashboard`} element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            {/* Redirect old admin URLs to 404 */}
            <Route path="/admin" element={<NotFound />} />
            <Route path="/admin/*" element={<NotFound />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SecurityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
