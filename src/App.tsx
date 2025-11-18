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
import AdCreatorDashboard from "./pages/advertising/AdCreatorDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Department from "./pages/Department";
import OperationsAgents from "./pages/OperationsAgents";
import MarketingAgents from "./pages/MarketingAgents";
import AdvertisingAgents from "./pages/AdvertisingAgents";
import Marketing from "./pages/Marketing";
import Operations from "./pages/Operations";
import OperationsAnalytics from "./pages/OperationsAnalytics";
import OperationsProjects from "./pages/OperationsProjects";
import OperationsAutomation from "./pages/OperationsAutomation";
import OperationsResourceOptimization from "./pages/OperationsResourceOptimization";
import OperationsQualityControl from "./pages/OperationsQualityControl";
import Financials from "./pages/Financials";
import FinancialAgents from "./pages/FinancialAgents";
import FinancialsAnalytics from "./pages/FinancialsAnalytics";
import FinancialsProjects from "./pages/FinancialsProjects";
import FinancialsReports from "./pages/FinancialsReports";
import Sales from "./pages/Sales";
import SalesAgents from "./pages/SalesAgents";
import SalesAnalytics from "./pages/SalesAnalytics";
import SalesProjects from "./pages/SalesProjects";
import SalesPipeline from "./pages/SalesPipeline";
import SalesCallScripts from "./pages/SalesCallScripts";
import SalesCrmIntegration from "./pages/SalesCrmIntegration";
import Strategy from "./pages/Strategy";
import StrategyAgents from "./pages/StrategyAgents";
import StrategyMarketPositioning from "./pages/StrategyMarketPositioning";
import StrategyKnowledgeBases from "./pages/StrategyKnowledgeBases";
import StrategyCompanyBrain from "./pages/StrategyCompanyBrain";
import ClientSettings from "./pages/ClientSettings";
import ClientProjects from "./pages/ClientProjects";
import ClientKnowledge from "./pages/ClientKnowledge";
import ClientAnalytics from "./pages/ClientAnalytics";
import SystemControl from "./pages/SystemControl";
import AdminReports from "./pages/AdminReports";
import AdminCalendar from "./pages/AdminCalendar";
import AdminSettings from "./pages/AdminSettings";
import AdminNotifications from "./pages/AdminNotifications";

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
          {/* Client-level quick access routes (must be above department catch-all) */}
          <Route path="/client/:clientId/settings" element={<ClientSettings />} />
          <Route path="/client/:clientId/projects" element={<ClientProjects />} />
          <Route path="/client/:clientId/knowledge" element={<ClientKnowledge />} />
          <Route path="/client/:clientId/analytics" element={<ClientAnalytics />} />
          <Route path="/client/:clientId/system" element={<SystemControl />} />
          <Route path="/client/:clientId/advertising" element={<Advertising />} />
          <Route path="/client/:clientId/advertising/market-research" element={<MarketResearch />} />
          <Route path="/client/:clientId/advertising/ad-optimizer" element={<AdOptimizer />} />
          <Route path="/client/:clientId/advertising/ad-optimizer/run/:runId" element={<AdOptimizerRunDetails />} />
          <Route path="/client/:clientId/advertising/ad-spy" element={<AdSpy />} />
          <Route path="/client/:clientId/advertising/ad-creator" element={<AdCreatorDashboard />} />
          <Route path="/client/:clientId/advertising/agents" element={<AdvertisingAgents />} />
          {/* Strategy dedicated area */}
          <Route path="/client/:clientId/strategy" element={<Strategy />} />
          <Route path="/client/:clientId/strategy/agents" element={<StrategyAgents />} />
          <Route path="/client/:clientId/strategy/market-positioning" element={<StrategyMarketPositioning />} />
          <Route path="/client/:clientId/strategy/knowledge-bases" element={<StrategyKnowledgeBases />} />
          <Route path="/client/:clientId/strategy/company-brain" element={<StrategyCompanyBrain />} />
          {/* Sales dedicated area */}
          <Route path="/client/:clientId/sales" element={<Sales />} />
          <Route path="/client/:clientId/sales/analytics" element={<SalesAnalytics />} />
          <Route path="/client/:clientId/sales/projects" element={<SalesProjects />} />
          <Route path="/client/:clientId/sales/agents" element={<SalesAgents />} />
          <Route path="/client/:clientId/sales/pipeline" element={<SalesPipeline />} />
          <Route path="/client/:clientId/sales/call-scripts" element={<SalesCallScripts />} />
          <Route path="/client/:clientId/sales/crm-integration" element={<SalesCrmIntegration />} />
          {/* Operations dedicated area */}
          <Route path="/client/:clientId/operations" element={<Operations />} />
          <Route path="/client/:clientId/operations/analytics" element={<OperationsAnalytics />} />
          <Route path="/client/:clientId/operations/projects" element={<OperationsProjects />} />
          <Route path="/client/:clientId/operations/agents" element={<OperationsAgents />} />
          <Route path="/client/:clientId/operations/automation" element={<OperationsAutomation />} />
          <Route path="/client/:clientId/operations/resource-optimization" element={<OperationsResourceOptimization />} />
          <Route path="/client/:clientId/operations/quality-control" element={<OperationsQualityControl />} />
          {/* Back-compat alias */}
          <Route path="/client/:clientId/operations-agents" element={<Navigate to="/client/:clientId/operations/agents" replace />} />
          {/* Marketing dedicated area */}
          <Route path="/client/:clientId/marketing" element={<Marketing />} />
          <Route path="/client/:clientId/marketing/agents" element={<MarketingAgents />} />
          {/* Back-compat alias */}
          <Route path="/client/:clientId/marketing-agents" element={<Navigate to="/client/:clientId/marketing/agents" replace />} />
          {/* Financials dedicated area */}
          <Route path="/client/:clientId/financials" element={<Financials />} />
          <Route path="/client/:clientId/financials/agents" element={<FinancialAgents />} />
          <Route path="/client/:clientId/financials/analytics" element={<FinancialsAnalytics />} />
          <Route path="/client/:clientId/financials/projects" element={<FinancialsProjects />} />
          <Route path="/client/:clientId/financials/reports" element={<FinancialsReports />} />
          {/* Operations-style alias for Agents direct link */}
          <Route path="/client/:clientId/financial-agents" element={<FinancialAgents />} />
          {/* Generic department route (after specific advertising/marketing routes) */}
          <Route path="/client/:clientId/:departmentId" element={<Department />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
