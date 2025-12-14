## n8n Integration (Stage 1)

This document outlines the initial implementation to integrate existing agents (workflows) from n8n into AgentixOS. The goal for Stage 1 is to connect to n8n via API, discover workflows, trigger them, and retrieve results—supporting both agency-wide and client-level scopes.

### What’s Implemented

- Agency and client level connection storage (Supabase)
  - Tables
    - `public.n8n_connections`: stores per-user n8n API connections, scoped to `agency` or `client` (with optional `client_id`).
    - `public.agent_configs`: stores agent-to-n8n workflow mapping (initially for example wiring; can be expanded).
  - RLS: Ownership-based (row-level) policies by `user_id`.
  - Migration file: `supabase/migrations/20251118094500_n8n_integration.sql`

- Supabase Edge Functions
  - `n8n-connect`: Tests a base URL and API key, then saves the connection.
  - `n8n-connections`: Lists existing connections for the current user, optionally filtered by scope/client.
  - `n8n-list`: Lists workflows (and attempts to list projects) for a specific connection.
  - `n8n-run`: Executes a given workflow with an optional JSON payload. Tries multiple endpoints to maximize compatibility.
  - `n8n-execution-status`: Retrieves an execution by ID from the n8n API.

- Frontend wrappers
  - `src/integrations/n8n/api.ts`: Thin wrappers to call the above functions using `supabase.functions.invoke`.

- UI integration
  - Agency-level connection UI: `AdminSettings.tsx` now contains an n8n card to add connections.
  - Client-level connection UI: `ClientSettings.tsx` shows the n8n connect card for the selected client.
  - Example agent wiring: `AdCreatorDashboard.tsx` includes an “n8n Runner (Example)” card to:
    - Select a connection (agency or client scope)
    - Select a workflow (fetched via API)
    - Provide a JSON payload
    - Run the workflow and view the result

- Branding
  - Uses `public/n8n.svg` in connection UI and the example runner.

### How to Use (Stage 1)

1. Agency-level: go to `Agency Settings` → Connect n8n
   - Enter hosted URL (default to n8n Cloud, change if self-hosted) and API key
   - Press “Test & Save”
2. Client-level: go to `Client Settings` for a client → Connect n8n (client scope)
3. Advertising → Ad Creator (example)
   - In the “n8n Runner (Example)” card, pick the connection and workflow, optionally set a payload, and run.

### Security & Notes

- API keys are currently stored in `api_key_encrypted` as plain text for early testing. For production, use Supabase Vault/KMS-backed encryption.
- All API calls to n8n are performed from Edge Functions to avoid exposing keys to the browser.
- Policy note: agency-level connection creation should be limited to admins/agency owners. For now, any user can create them; a role claim should be added in the future to enforce this.

### Next Steps (Stage 2+)

- Formalize agent-to-workflow mapping per agent (e.g., advertising agents), storing inputs/outputs in `agent_configs` and adding UI to persist.
- Add output routing (e.g., save to our platform entities/tables) and standardized execution logs.
- Enforce role-based access for agency-level connections.
- Improve workflow “input discovery” by inspecting workflow JSON to suggest input fields.
- Add execution polling and surface status/history in the UI.

### Testing

- Use an n8n Cloud workspace or your self-hosted instance.
  - Header: `X-N8N-API-KEY: <your_api_key>`
  - Base URL: `https://<your-workspace>.n8n.cloud` (no trailing slash) or your self-hosted domain.

### Deployment

- Do not deploy or reset production DB automatically. Run the migration manually.
- After migration, deploy the Edge Functions:
  - `n8n-connect`
  - `n8n-connections`
  - `n8n-list`
  - `n8n-run`
  - `n8n-execution-status`

This is the foundation for Stage 1. We can now discover and run existing n8n agents and start wiring outputs back into the platform. Stage 2 will iteratively replace pieces with in-house workflows and richer UX. 

