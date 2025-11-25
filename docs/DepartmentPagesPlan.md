## Department Pages – Reusable Implementation Plan (Strategy first)

Goal: Add missing department pages to match the left navigation. Start with Strategy and reuse the same structure for Marketing, Sales, Operations, and Financials.

### Scope
- Build a department page with:
  - Breadcrumbs and page header
  - Health Pulse KPIs
  - Agents table with search/filter
  - Consistent theme using existing UI primitives (Shadcn, Tailwind tokens)
- Add routing so clicking a department in the sidebar opens the new page.
- Keep the layout and visual hierarchy aligned with the mock provided.

## Architecture

- Page: one generic renderer that supports all departments, plus department‑specific data hooks/config.
  - `src/pages/Department.tsx` – generic department page using route params `:clientId` and `:departmentId`.
  - Optional per‑department wrappers (if/when needed): `src/pages/Strategy.tsx` etc. These can delegate to `Department.tsx` for shared UI.
- Components (reusable across departments):
  - `src/components/departments/DepartmentHeader.tsx` – breadcrumbs, title, subtitle, actions.
  - `src/components/departments/DepartmentKPIs.tsx` – 3 KPI cards responsive grid.
  - `src/components/departments/DepartmentAgentsTable.tsx` – search, status filter, table.
- Data/config:
  - Reuse `src/data/departments.ts` for basic metadata (title, id, agents).
  - Add a light config map per department for KPIs and initial table rows (mockable now, API later).
  - Future: move to Supabase queries per department.

## Routing

Add a catch‑all department route ranked below specific pages (Advertising and its sub‑routes stay higher priority):

```tsx
// src/App.tsx (add before the "*" NotFound route, after specific advertising routes)
<Route path="/client/:clientId/:departmentId" element={<Department />} />
```

This works with existing links generated in `ChatSidebar` (`/client/${clientId}/${dept.id}`).

## Visual System and Theme
- Use design tokens already in the app:
  - Backgrounds: `bg-background`, cards: `bg-card border-border`, text: `text-foreground`, accents: `text-muted-foreground`.
  - Buttons: `Button` from `@/components/ui/button` with `className="bg-primary text-primary-foreground"`.
- Use `Card`, `Table`, `Input`, `Select`, `Badge`, `Avatar`, `ScrollArea` from `@/components/ui/*`.
- Icons: `lucide-react` to match the platform (not Material Symbols).
- Layout parity with the mock:
  - Header section (title, subtitle, Add Agent button)
  - “Health Pulse Overview” with three cards
  - Agents table with search and status filter
  - Keep paddings/margins consistent with `Index` page

## Data Shapes

```ts
// UI-only for table rows; can map from Supabase later
export type DepartmentAgentRow = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  status: "online" | "busy" | "offline";
  ongoingProjects: string[];
  lastActive: string; // humanized string for now
};

export type DepartmentKpi = {
  label: string;
  value: string;
  trend?: { direction: "up" | "down"; value: string };
};
```

## Implementation Steps (Strategy first)

1) Create generic page and components
- `src/pages/Department.tsx`
  - Read `clientId`/`departmentId` from router.
  - Resolve department metadata from `departmentsData`.
  - Load config for KPIs and table rows (mocked locally for now).
  - Compose `ChatSidebar` + Header + KPIs + Agents table.
- `src/components/departments/DepartmentHeader.tsx`
  - Props: `title`, `subtitle`, optional right‑side actions.
  - Show breadcrumbs: Dashboard / Departments / {DepartmentTitle}.
- `src/components/departments/DepartmentKPIs.tsx`
  - Props: `kpis: DepartmentKpi[]` (render 3 cards).
- `src/components/departments/DepartmentAgentsTable.tsx`
  - Props: `rows: DepartmentAgentRow[]`.
  - Client‑side search by name/role/project; status filter: All / Online / Busy / Offline.

2) Wire routing
- Update `src/App.tsx` to include the generic route (see snippet above).

3) Provide Strategy config
- `src/components/departments/config/strategy.ts` (or inline in `Department.tsx` initially)
  - KPIs: Total Agents, Active Projects, Department Capacity (values per mock: 12, 5, 85% with trends).
  - Table rows: 3–6 sample agents matching the mock.

4) Validate the theme
- Compare paddings, typography, and colors with `src/pages/Index.tsx` and existing cards.
- Ensure dark theme reads correctly.

5) Smoke tests
- Navigate to `/client/techstart-solutions/strategy` from the sidebar.
- Verify: header renders, 3 KPI cards show, table loads, search/filter works.
- Confirm Advertising routes still work (ranked above the generic department route).

## Example Skeleton (Strategy via the generic page)

```tsx
// src/pages/Department.tsx (skeleton outline)
import { useParams } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";
import { DepartmentHeader } from "@/components/departments/DepartmentHeader";
import { DepartmentKPIs } from "@/components/departments/DepartmentKPIs";
import { DepartmentAgentsTable } from "@/components/departments/DepartmentAgentsTable";
import { departmentsData } from "@/data/departments";

export default function Department() {
  const { clientId, departmentId } = useParams();
  const meta = departmentsData.find(d => d.id === departmentId);
  // Fallback/404 handling omitted in skeleton

  // TODO: swap with per-department config or Supabase query
  const kpis = [{ label: "Total Agents", value: "12" }, /* ... */];
  const rows = [/* DepartmentAgentRow[] */];

  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-background">
          <div className="p-6">
            <DepartmentHeader
              title={`${meta?.title} Department`}
              subtitle="Manage agents and view department-wide analytics."
              onAddAgent={() => {}}
            />
          </div>
        </div>
        <div className="p-10 space-y-8">
          <section>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Health Pulse Overview</h3>
            <DepartmentKPIs kpis={kpis} />
          </section>
          <section className="bg-card border border-border rounded-xl">
            <DepartmentAgentsTable rows={rows} />
          </section>
        </div>
      </main>
    </div>
  );
}
```

## Reuse for Other Departments
- Add entries to a `config` map keyed by department id (`strategy`, `marketing`, `sales`, `operations`, `financials`) supplying KPIs and table rows.
- No additional routing changes required; the generic route covers them.
- If a department grows specialized (like Advertising), promote it to its own page and keep it ranked above the generic route.

## API Integration (Phase 2)
- Read KPIs and agent states from Supabase. Create minimal views or RPCs as needed.
- Keep a small adapter that maps database rows to `DepartmentKpi` and `DepartmentAgentRow` for consistent rendering.
- Follow user rules: create migration files for any schema/policy changes; do not run DB changes automatically.

## Acceptance Criteria
- Strategy page available at `/client/:clientId/strategy` and matches the mock’s structure and tone.
- UI uses existing tokens/components; dark mode looks correct.
- Table supports search and status filter client‑side.
- Navigation from the sidebar works for all departments.
- Advertising routes remain unaffected.

## Out of Scope (now)
- Real‑time status, server‑side filtering, and pagination (defer to Phase 2).
- Role‑based gating for “Add Agent” actions.

---

Use this plan verbatim to add Marketing, Sales, Operations, and Financials by providing department‑specific KPI and agent config (or queries) while reusing the same page and components.


