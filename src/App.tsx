import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import Advertising from "./pages/Advertising";
import MarketResearch from "./pages/MarketResearch";
import SentimentAnalyzer from "./pages/SentimentAnalyzer";
import SentimentAnalysisRunDetails from "./pages/SentimentAnalysisRunDetails";
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
          <Route path="/advertising/sentiment-analyzer" element={<SentimentAnalyzer />} />
          <Route path="/advertising/sentiment-analyzer/run/:runId" element={<SentimentAnalysisRunDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
