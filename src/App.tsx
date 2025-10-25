import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import Advertising from "./pages/Advertising";
import MarketResearch from "./pages/MarketResearch";
import AdOptimizer from "./pages/AdOptimizer";
import AdOptimizerRunDetails from "./pages/AdOptimizerRunDetails";
import AdSpy from "./pages/AdSpy";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/client/techstart-solutions" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/client/:clientId" element={<Index />} />
          <Route path="/client/:clientId/advertising" element={<Advertising />} />
          <Route path="/client/:clientId/advertising/market-research" element={<MarketResearch />} />
          <Route path="/client/:clientId/advertising/ad-optimizer" element={<AdOptimizer />} />
          <Route path="/client/:clientId/advertising/ad-optimizer/run/:runId" element={<AdOptimizerRunDetails />} />
          <Route path="/client/:clientId/advertising/ad-spy" element={<AdSpy />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
