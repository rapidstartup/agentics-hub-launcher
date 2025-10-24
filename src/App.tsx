import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import Advertising from "./pages/Advertising";
import MarketResearch from "./pages/MarketResearch";
import AdOptimizer from "./pages/AdOptimizer";
import AdOptimizerRunDetails from "./pages/AdOptimizerRunDetails";
import AdSpy from "./pages/AdSpy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/advertising" element={<Advertising />} />
          <Route path="/advertising/market-research" element={<MarketResearch />} />
          <Route path="/advertising/ad-optimizer" element={<AdOptimizer />} />
          <Route path="/advertising/ad-optimizer/run/:runId" element={<AdOptimizerRunDetails />} />
          <Route path="/advertising/ad-spy" element={<AdSpy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
