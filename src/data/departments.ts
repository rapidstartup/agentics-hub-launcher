import { 
  Target, 
  Megaphone, 
  TrendingUp, 
  Users, 
  Settings, 
  DollarSign 
} from "lucide-react";

export interface Agent {
  name: string;
  status: "Active" | "Inactive" | "Paused";
  schedule?: "daily" | "weekly" | "monthly";
  canRunNow?: boolean;
}

export interface Department {
  id: string;
  title: string;
  description: string;
  icon: any;
  agentCount: number;
  agents: Agent[];
}

export const departmentsData: Department[] = [
  {
    id: "strategy",
    title: "Strategy",
    description: "Strategic planning & analysis",
    icon: Target,
    agentCount: 4,
    agents: [
      { name: "Market Positioning Plan", status: "Active", schedule: "weekly", canRunNow: true },
      { name: "Knowledge Bases (FAQ, Offers)", status: "Paused", canRunNow: true },
      { name: "Company Brain (RAG)", status: "Active", canRunNow: true },
    ],
  },
  {
    id: "advertising",
    title: "Advertising",
    description: "Campaign management & optimization",
    icon: Megaphone,
    agentCount: 7,
    agents: [
      { name: "Deep Research Market Assessment", status: "Active", canRunNow: true },
      { name: "Facebook Ads Library Scraper", status: "Active", schedule: "daily", canRunNow: true },
      { name: "Ad Creative Strategist", status: "Inactive", canRunNow: true },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Content & campaign creation",
    icon: TrendingUp,
    agentCount: 5,
    agents: [
      { name: "VSL Generator", status: "Active", canRunNow: true },
      { name: "Perfect Webinar Script", status: "Active", canRunNow: true },
      { name: "Perfect Webinar Creator", status: "Paused", canRunNow: true },
      { name: "Asset Creator", status: "Active", canRunNow: true },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    description: "Performance tracking & optimization",
    icon: Users,
    agentCount: 5,
    agents: [
      { name: "Setter Performance Closer", status: "Active", schedule: "daily" },
      { name: "Sales/Finance Data Entry", status: "Active", schedule: "daily", canRunNow: true },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    description: "Workflow automation & efficiency",
    icon: Settings,
    agentCount: 6,
    agents: [
      { name: "Process Automation Agent", status: "Active", schedule: "daily" },
      { name: "Resource Optimization Agent", status: "Paused", schedule: "weekly" },
      { name: "Quality Control Monitor", status: "Active", schedule: "daily" },
    ],
  },
  {
    id: "financials",
    title: "Financials",
    description: "Financial planning & analysis",
    icon: DollarSign,
    agentCount: 4,
    agents: [
      { name: "Budget Forecasting Agent", status: "Active", schedule: "monthly", canRunNow: true },
      { name: "Expense Tracker", status: "Inactive", schedule: "daily" },
      { name: "Revenue Analytics Agent", status: "Active", schedule: "weekly", canRunNow: true },
    ],
  },
];
