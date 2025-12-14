# Agentix Platform – Progress PRD v2.0

**Version:** 2.0  
**Date:** November 25, 2025  
**Status:** In Progress  
**Last Updated:** November 25, 2025

---

## 1. Executive Summary

This document tracks the progression of the Agentix platform from its initial v1 dashboard concept to the current implementation. It captures all significant architectural changes, feature additions, and integration milestones since the initial Go-to-Market PRD.

### Current State Overview

The platform has evolved from a conceptual agency management dashboard into a functional multi-department business operating system with:

- **21 Mastra agents** defined for automation workflows
- **21 Edge Functions** deployed on Supabase
- **15 database migrations** applied
- **5 core departments** fully routed (Marketing, Sales, Operations, Strategy, Financials)
- **Full Advertising sub-module** with Ad Creator, Ad Optimizer, Ad Spy, and Market Research tools
- **n8n integration layer** for connecting external automation workflows
- **Composio iPaaS integration** for managed OAuth connections (Meta Ads, Google Drive, Google Sheets)

---

## 1.1 Recent Updates (November 25, 2025)

### Enhanced Agent Integration System

The following enhancements were implemented to support the Phase 1 n8n agent webhooks:

**New Database Schema Additions:**
- `input_schema` (JSONB) — Full schema for dynamic UI rendering with support for textarea, select, placeholder, options
- `output_behavior` (ENUM) — Controls result display: `chat_stream`, `modal_display`, `field_populate`
- `execution_mode` (ENUM) — Toggle between `n8n` and `internal` (Mastra) execution
- `is_predefined` (BOOLEAN) — Marks system-level agents that can't be deleted
- `description` and `avatar_url` — Enhanced agent display in tables

**New Components:**
- `AgentChatWindow.tsx` — Full chat interface for agents with `output_behavior: chat_stream`
- `UniversalAgentRunner.tsx` — Smart component that routes to chat or form based on agent config
- Enhanced `RunAgentDynamicModal.tsx` — Now supports textarea, select dropdowns, result display with markdown rendering
- Enhanced `N8nAgentConfigModal.tsx` — Tabbed interface with execution mode toggle, output behavior selector

**Predefined Agent Webhooks (Phase 1):**
| Agent | Department | Webhook ID | Output Behavior |
|-------|------------|------------|-----------------|
| Meeting Agent | Operations | `d1007cb5-...` | chat_stream |
| Personal Assistant | Operations | `e101258b-...` | chat_stream |
| Prompt Engineer | Marketing | `a35caabc-...` | modal_display |
| RAG Agent | Strategy | `7ddce9e5-...` | chat_stream |
| Copywriter | Marketing | `86d7a192-...` | modal_display |

---

## 2. Architecture Evolution

### 2.1 From v1 Concept to v2 Implementation

| Aspect | v1 (Initial PRD) | v2 (Current Implementation) |
|--------|------------------|----------------------------|
| **Agent Directory** | Conceptual n8n agent links | Functional agents table with n8n workflow binding, runtime inputs, and "Run Now" |
| **Agency Pulse** | Static dashboard mockup | Dynamic KPI cards, department health metrics, client switcher |
| **Department Pages** | Not implemented | Generic `Department.tsx` + specialized pages per department with unique agents tables |
| **Integrations** | Planned: Google Sheets, Slack, Trello | Implemented: n8n, Meta Ads, Google Drive, Google Sheets, Gemini AI, Firecrawl, RapidAPI |
| **Agent Execution** | One-way trigger concept | Bidirectional: webhook triggers, runtime input forms, execution status polling |
| **Database** | Not specified | Supabase with 15+ migrations, RLS policies, real-time subscriptions |

### 2.2 Current Route Architecture

```
/auth                                    → Authentication
/client/:clientId                        → Client Dashboard (Index.tsx)
/client/:clientId/settings               → Client Settings + Connections
/client/:clientId/projects               → Projects view
/client/:clientId/knowledge              → Knowledge bases
/client/:clientId/analytics              → Analytics dashboard
/client/:clientId/system                 → System Control (LLM swap)

# Advertising Department (Specialized)
/client/:clientId/advertising            → Advertising Dashboard
/client/:clientId/advertising/agents     → Advertising Agents
/client/:clientId/advertising/market-research → Market Research Tool
/client/:clientId/advertising/ad-optimizer    → Ad Account Optimizer
/client/:clientId/advertising/ad-spy          → Ad Library Scraper
/client/:clientId/advertising/ad-creator      → Ad Creator Dashboard

# Marketing Department
/client/:clientId/marketing              → Marketing Dashboard
/client/:clientId/marketing/agents       → Marketing Agents with n8n binding
/client/:clientId/marketing/ad-spy       → Marketing Ad Spy
/client/:clientId/marketing/market-research  → Marketing Market Research
/client/:clientId/marketing/ad-creator       → Marketing Ad Creator
/client/:clientId/marketing/landing-page-copywriter → Landing Page Copywriter
/client/:clientId/marketing/email-copywriter       → Email Copywriter

# Sales Department
/client/:clientId/sales                  → Sales Dashboard
/client/:clientId/sales/agents           → Sales Agents
/client/:clientId/sales/analytics        → Sales Analytics
/client/:clientId/sales/pipeline         → Pipeline Management
/client/:clientId/sales/call-scripts     → Call Script Grading
/client/:clientId/sales/crm-integration  → CRM Integration

# Operations Department
/client/:clientId/operations             → Operations Dashboard
/client/:clientId/operations/agents      → Operations Agents
/client/:clientId/operations/analytics   → Operations Analytics
/client/:clientId/operations/automation  → Automation Hub
/client/:clientId/operations/resource-optimization → Resource Optimization
/client/:clientId/operations/quality-control      → Quality Control

# Strategy Department
/client/:clientId/strategy               → Strategy Dashboard
/client/:clientId/strategy/agents        → Strategy Agents
/client/:clientId/strategy/market-positioning  → Market Positioning
/client/:clientId/strategy/knowledge-bases     → Knowledge Bases
/client/:clientId/strategy/company-brain       → Company Brain (RAG)

# Financials Department
/client/:clientId/financials             → Financials Dashboard
/client/:clientId/financials/agents      → Financial Agents
/client/:clientId/financials/analytics   → Financial Analytics
/client/:clientId/financials/projects    → Financial Projects
/client/:clientId/financials/reports     → Financial Reports

# Generic Department Fallback
/client/:clientId/:departmentId          → Generic Department Page

# Admin Routes
/admin                                   → Admin Dashboard
/admin/reports                           → Admin Reports
/admin/calendar                          → Admin Calendar
/admin/settings                          → Admin Settings
/admin/notifications                     → Admin Notifications
```

---

## 3. n8n Integration Layer

### 3.1 Architecture

The n8n integration provides a bridge between the Agentix UI and external n8n workflow automation instances.

**Core Components:**
- `src/integrations/n8n/api.ts` — Client-side API wrapper
- `src/integrations/n8n/agents.ts` — Agent configuration management
- `supabase/functions/n8n-*` — Edge functions for secure backend operations

**Database Tables:**
```sql
-- Connection storage (per user, scoped to agency or client)
public.n8n_connections (
  id, user_id, scope, client_id, label,
  base_url, api_key_encrypted, is_active,
  created_at, updated_at
)

-- Agent-to-workflow binding
public.agent_configs (
  id, user_id, scope, client_id, area, agent_key,
  display_name, display_role,
  connection_id, workflow_id, webhook_url,
  input_mapping, output_mapping,
  created_at, updated_at
)
```

### 3.2 Edge Functions

| Function | Purpose |
|----------|---------|
| `n8n-connect` | Store new n8n connection credentials |
| `n8n-connections` | List connections for current user |
| `n8n-list` | List workflows from connected n8n instance |
| `n8n-run` | Execute workflow via webhook or REST API |
| `n8n-execution-status` | Poll execution status |

### 3.3 Runtime Input System

Agents can define runtime input fields that prompt users before execution:

```typescript
type FieldType = "text" | "number" | "boolean" | "textarea" | "select";
type OutputBehavior = "chat_stream" | "modal_display" | "field_populate";
type ExecutionMode = "n8n" | "internal";

interface RuntimeField {
  key: string;        // Payload key
  label: string;      // UI label
  type: FieldType;
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;      // Hint text for input
  options?: string[];        // For select type dropdowns
}

interface InputSchema {
  fields: RuntimeField[];
}

interface AgentConfig {
  // ... existing fields ...
  input_schema?: InputSchema;    // New: Full schema for dynamic UI
  output_behavior?: OutputBehavior;  // New: How results are displayed
  execution_mode?: ExecutionMode;    // New: n8n vs internal toggle
  is_predefined?: boolean;           // New: System-level agents
  description?: string;              // New: Agent description
  avatar_url?: string;               // New: Custom avatar
}
```

UI Components:
- `N8nAgentConfigModal` — Configure agent → workflow binding (enhanced with execution mode toggle)
- `RunAgentDynamicModal` — Collect runtime inputs before execution (enhanced with all field types + result display)
- `AgentChatWindow` — **NEW:** Full chat interface for `chat_stream` agents
- `UniversalAgentRunner` — **NEW:** Smart router that displays chat or form based on `output_behavior`

### 3.4 Webhook Execution Support

For n8n Cloud (which doesn't support REST API execution), agents can store a webhook URL:

```typescript
// In agent_configs table
webhook_url: "https://your-workspace.app.n8n.cloud/webhook/abc123"

// n8n-run function prioritizes webhook if present
if (webhookUrl) {
  fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });
}
```

---

## 4. Composio iPaaS Integration

### 4.1 Managed OAuth Connections

The platform uses Composio for vendor-neutral OAuth management:

**Supported Providers:**
- Meta Ads (Facebook Ads)
- Google Drive
- Google Sheets

**UI Component:** `ConnectionsButtons.tsx`

**Edge Function:** `composio-manage-connection`
- Returns connect/reconnect URL for each provider
- Passes state: `{ uid, toolkit, clientId }`

### 4.2 Direct Connection Helpers

For scenarios where managed auth isn't configured:

- `facebook-connect` — Store long-lived token + ad account
- `google-sheets-connect` — Store spreadsheet ID/URL

**Database Tables:**
```sql
public.facebook_ad_accounts (id, user_id, access_token, account_id, account_name, is_active)
public.google_sheets_connections (id, user_id, spreadsheet_id, spreadsheet_name, is_active)
```

---

## 5. Mastra Agent Framework

### 5.1 Agent Directory (21 Agents)

Located in `agentix/src/mastra/agents/`:

| Agent | Department | Status |
|-------|------------|--------|
| `ad-creator-agent.ts` | Advertising | ✅ Implemented |
| `ad-creative-iterator-agent.ts` | Advertising | 🔧 Scaffolded |
| `asset-creator-agent.ts` | Marketing | 🔧 Scaffolded |
| `calendar-agent.ts` | Operations | 🔧 Scaffolded |
| `case-studies-gpt-agent.ts` | Sales | 🔧 Scaffolded |
| `closer-eod-report-agent.ts` | Sales | 🔧 Scaffolded |
| `deep-research-scraper-agent.ts` | Marketing | 🔧 Scaffolded |
| `email-agent.ts` | Operations | 🔧 Scaffolded |
| `email-copywriter-agent.ts` | Marketing | 🔧 Scaffolded |
| `facebook-ads-scraper-agent.ts` | Marketing | 🔧 Scaffolded |
| `follow-up-agent.ts` | Sales | 🔧 Scaffolded |
| `landing-page-copywriter-agent.ts` | Marketing | 🔧 Scaffolded |
| `llm-swap-agent.ts` | Operations | 🔧 Scaffolded |
| `meeting-notes-bot-agent.ts` | Operations | 🔧 Scaffolded |
| `project-management-agent.ts` | Operations | 🔧 Scaffolded |
| `rag-agent.ts` | Strategy | 🔧 Scaffolded |
| `sales-rep-transcript-grader-agent.ts` | Sales | 🔧 Scaffolded |
| `sales-team-reporting-agent.ts` | Sales | 🔧 Scaffolded |
| `setter-eod-report-agent.ts` | Sales | 🔧 Scaffolded |
| `setter-team-reporting-agent.ts` | Sales | 🔧 Scaffolded |
| `setter-transcript-grader-agent.ts` | Sales | 🔧 Scaffolded |

### 5.2 Workflows

Located in `agentix/src/mastra/workflows/`:

| Workflow | Description |
|----------|-------------|
| `ad-creator-workflow.ts` | Gather inputs → Generate variants → (optional) Publish |

### 5.3 Ad Creator Agent Implementation

```typescript
// agentix/src/mastra/agents/ad-creator-agent.ts
export const adCreatorAgent = new Agent({
  name: 'Ad Creator Agent',
  instructions: `
    You are an Advertising Department agent that creates Meta Ads.
    - Use client assets from Google Drive as supplementary images
    - Use winning ads only to emulate structure/angles
    - Generate multiple copy variants
    - Publish only when explicitly requested
  `,
  model: 'openai/gpt-4o-mini',
  tools: {
    listMetaAccounts: listMetaAccountsTool,
    driveList: driveListTool,
    generateCopy: generateCopyTool,
    publishMetaAd: publishMetaTool,
  },
  memory: new Memory({ storage: new LibSQLStore({ url: 'file:../mastra.db' }) }),
});
```

---

## 6. Advertising Module (Deep Dive)

### 6.1 Ad Creator Dashboard

**Route:** `/client/:clientId/advertising/ad-creator`

**Features:**
- 3-step wizard: Inputs → Review Variants → Publish
- Website scraping for auto-population
- AI-powered audience targeting suggestions
- Google Drive asset integration
- Copy variant generation via Gemini
- Mock publish flow to Meta Ads

**Edge Functions Used:**
- `scrape-website-details` — Extract brand/offer from URL
- `generate-copy` — Gemini-powered copy generation
- `drive-list` — List Google Drive assets
- `metaads-publish` — Publish to Meta (dry-run by default)

### 6.2 Ad Optimizer

**Route:** `/client/:clientId/advertising/ad-optimizer`

**Features:**
- Connect Facebook Ad Account
- Connect Google Sheets for output
- Analyze top-performing creatives
- Generate iterations of winning ads
- Schedule automated optimization runs

**Edge Functions Used:**
- `sentiment-analysis-run` — Trigger optimization analysis

**Database:**
- `ad_spy_runs` — Track analysis runs with real-time subscriptions

### 6.3 Market Research Tool

**Route:** `/client/:clientId/advertising/market-research`

**Status:** ✅ Complete (100%)

**Features:**
- Company lookup via RapidAPI Local Business Data
- Website analysis via Firecrawl
- Competitor identification via Gemini with search grounding
- Ideal client avatar synthesis
- 20-40 page market analysis report generation
- PDF and Markdown export

**Edge Functions:**
- `search-business` — RapidAPI business lookup
- `scrape-website-details` — Firecrawl extraction + Gemini competitor research
- `scrape-competitor-avatar` — Gemini-powered avatar synthesis
- `market-research` — Full report generation

**Database:**
```sql
public.market_research_reports (
  id, user_id, company_name, company_website,
  competitor_links, product_description,
  client_avatar_description, status, report_content,
  created_at, updated_at
)
```

### 6.4 Ad Spy

**Route:** `/client/:clientId/advertising/ad-spy`

**Features:**
- Facebook Ads Library scraping
- Creative analysis and breakdown
- Video script extraction
- Push to Google Sheets

**Edge Functions:**
- `ad-spy-scrape` — Scrape ads library
- `ad-spy-recreate` — Generate new versions of scraped ads

---

## 7. Marketing Module Additions

### 7.1 Marketing Agents Page

**Route:** `/client/:clientId/marketing/agents`

**Features:**
- Custom agents table with health metrics
- n8n workflow binding via modal
- Dynamic agent loading from `agent_configs`
- "Add Agent" workflow
- CSV export

**UI Components:**
- `MarketingAgentsTable` — Specialized table with progress bars
- `N8nAgentConfigModal` — Agent configuration
- `RunAgentDynamicModal` — Runtime input collection

### 7.2 Copywriter Tools

**Landing Page Copywriter:**
- Route: `/client/:clientId/marketing/landing-page-copywriter`
- Ingestion → Production workflow
- High-converting landing page copy generation

**Email Copywriter:**
- Route: `/client/:clientId/marketing/email-copywriter`
- Broadcast and automation email copy
- Template selection and customization

---

## 8. Department System

### 8.1 Generic Department Page

**Component:** `src/pages/Department.tsx`

Provides fallback rendering for any department without a specialized page.

**Features:**
- Route params: `:clientId`, `:departmentId`
- KPI cards from config
- Agents table with search/filter
- Delegates to per-department config

### 8.2 Department Configuration

**File:** `src/components/departments/config.ts`

```typescript
type DepartmentConfig = {
  kpis: DepartmentKpi[];
  rows: DepartmentAgentRow[];
  salesRows?: SalesAgentRow[];
  healthPulse?: number;
  projects?: OptimizationProject[];
};

// Configured departments: strategy, marketing, advertising, sales, operations
```

### 8.3 Reusable Components

- `DepartmentHeader.tsx` — Breadcrumbs, title, actions
- `DepartmentKPIs.tsx` — 3-4 KPI card grid
- `DepartmentAgentsTable.tsx` — Generic agents table

---

## 9. Database Schema Evolution

### 9.1 Core Tables (15 Migrations)

| Migration | Purpose |
|-----------|---------|
| `20251024043417` | Initial user profiles |
| `20251024043445` | Client management |
| `20251024045059` | Project tracking |
| `20251024203412` | Task management |
| `20251024210753` | Agent execution logs |
| `20251116000100` | New core tables (departments, agents) |
| `20251116000200` | Seed demo data function |
| `20251116154232` | Market research reports |
| `20251116154553` | Ad spy runs |
| `20251116180000` | Ad Creator core (projects, candidates, assets, publish runs) |
| `20251118093000` | Connections tables (facebook_ad_accounts, google_sheets_connections) |
| `20251118094500` | n8n integration (n8n_connections, agent_configs) |
| `20251118105500` | Add webhook_url to agent_configs |
| `20251118113000` | Agent configs display fields |
| `20251118170824` | Additional indexes and cleanup |
| `20251125100000` | **NEW:** Enhanced agent schema (input_schema, output_behavior, execution_mode) |
| `20251125100100` | **NEW:** Seed 5 predefined agent webhooks (Meeting, Personal Assistant, Prompt Engineer, RAG, Copywriter) |

### 9.2 Key Schema Highlights

**Ad Creator Tables:**
```sql
public.ad_projects      -- Ad creation projects
public.ad_candidates    -- Generated ad variants
public.ad_candidate_assets  -- Attached media
public.ad_publish_runs  -- Publish attempt tracking
```

**n8n Integration Tables:**
```sql
public.n8n_connections  -- Encrypted API key storage
public.agent_configs    -- Workflow bindings per agent
```

**All tables have:**
- UUID primary keys
- User ownership (`user_id`)
- Row Level Security (RLS) policies
- Timestamp tracking (`created_at`, `updated_at`)

---

## 10. Edge Functions Summary (21 Functions)

| Function | Category | Description |
|----------|----------|-------------|
| `search-business` | Market Research | RapidAPI local business lookup |
| `scrape-website-details` | Market Research | Firecrawl + Gemini extraction |
| `scrape-competitor-avatar` | Market Research | Gemini avatar synthesis |
| `market-research` | Market Research | Full report generation |
| `generate-copy` | Ad Creator | Gemini copy variant generation |
| `metaads-list` | Advertising | List Meta ad accounts/pages |
| `metaads-publish` | Advertising | Publish ads to Meta |
| `drive-list` | Assets | List Google Drive files |
| `sheets-export` | Export | Export to Google Sheets |
| `ad-spy-scrape` | Ad Spy | Scrape Facebook Ads Library |
| `ad-spy-recreate` | Ad Spy | Generate new ad versions |
| `sentiment-analysis-run` | Ad Optimizer | Run optimization analysis |
| `composio-manage-connection` | Connections | Managed OAuth redirect URLs |
| `facebook-connect` | Connections | Direct Facebook token storage |
| `google-sheets-connect` | Connections | Direct Sheets connection |
| `n8n-connect` | n8n | Store n8n credentials |
| `n8n-connections` | n8n | List n8n connections |
| `n8n-list` | n8n | List n8n workflows |
| `n8n-run` | n8n | Execute n8n workflow |
| `n8n-execution-status` | n8n | Poll execution status |
| `gemini-chat` | Chat | General Gemini chat interface |

---

## 11. Environment Variables Required

### Supabase Edge Functions
```bash
SUPABASE_URL              # Auto-provided
SUPABASE_ANON_KEY         # Auto-provided
GEMINI_API_KEY            # Google Gemini API
FIRECRAWL_API_KEY         # Firecrawl extraction
RAPIDAPI_KEY              # Local Business Data
GOOGLE_MAPS_API_KEY       # Places Autocomplete
COMPOSIO_AUTH_BASE        # Managed OAuth base URL
COMPOSIO_PROXY_URL        # Provider API proxy
GOOGLE_SERVICE_ACCOUNT_EMAIL  # Sheets export
```

### Mastra Dev Server
```bash
SUPABASE_EDGE_URL         # Edge functions base URL
SUPABASE_SERVICE_ROLE_KEY # Server-to-server calls
```

---

## 12. Remaining Work (Phase 2 Priorities)

### 12.1 Agent Implementation
- [ ] Complete scaffolded Mastra agents with actual logic
- [ ] Add Composio tool integrations for third-party APIs
- [ ] Implement agent memory and context persistence

### 12.2 n8n Migration Path
- [ ] Document workflow export/import procedures
- [ ] Create migration scripts for moving n8n workflows to native Mastra agents
- [ ] Build testing framework for workflow equivalence

### 12.3 Sales Module
- [ ] Setter/Closer transcript grading automation
- [ ] EOD report generation
- [ ] Case Studies GPT implementation
- [ ] Follow-up email/text agent

### 12.4 Operations Module
- [ ] Meeting Notes Bot integration with Fathom
- [ ] Email Agent with Gmail integration
- [ ] Calendar Agent with Google Calendar
- [ ] Project Management Agent with ClickUp/Asana

### 12.5 Strategy Module
- [ ] RAG Agent with vectorized company knowledge
- [ ] Automatic document ingestion pipeline
- [ ] Company Brain chat interface

### 12.6 Platform Improvements
- [ ] Role-based access control (RBAC)
- [ ] Team member management
- [ ] Client portal access
- [ ] White-labeling support
- [ ] API documentation and external access

---

## 13. Technical Debt & Known Issues

1. **API Key Storage:** Currently stored as plain text in `api_key_encrypted` column. Should migrate to Supabase Vault or external KMS.

2. **n8n Cloud Limitations:** REST API execution not supported; requires webhook configuration per workflow.

3. **Real-time Updates:** Some pages lack real-time subscriptions for status updates.

4. **Error Handling:** Edge functions need more consistent error response formats.

5. **Testing:** No automated test suite yet for edge functions or frontend components.

---

## 14. Success Metrics

| Metric | Current | Target (Phase 2) |
|--------|---------|------------------|
| Deployed Edge Functions | 21 | 30+ |
| Implemented Mastra Agents | 1 | 10+ |
| Connected Integrations | 4 | 8+ |
| Active Department Pages | 5 | 5 (all complete) |
| Database Tables | 15+ | Stable |
| Test Coverage | 0% | 60%+ |

---

## 15. Appendix: Agent-to-Department Mapping

Based on the original Agent Directory document:

### Marketing
- Deep Research Scraping Tool ✅ (as Market Research)
- Facebook Ads Library Scraping ✅ (as Ad Spy)
- Ad Account Creative Iteration ✅ (as Ad Optimizer)
- Landing Page Copywriter → Route exists, needs implementation
- Email Copywriter → Route exists, needs implementation

### Operations
- Meeting Notes Bot → Scaffolded
- Email Agent → Scaffolded
- Calendar Agent → Scaffolded
- RAG Agent → Under Strategy
- LLM Swap → System Control page exists
- Project Management Agent → Scaffolded

### Sales
- Setters transcript creation and grading → Scaffolded
- Setter EOD report generation → Scaffolded
- Sales rep transcript creation and grading → Scaffolded
- Closer EOD report generation → Scaffolded
- Sales team reporting → Route exists
- Setter team reporting → Route exists
- Case Studies GPT → Scaffolded
- Follow up emails and text agent → Scaffolded

---

*Document maintained by the Agentix development team. For questions, see the codebase or contact the maintainers.*

