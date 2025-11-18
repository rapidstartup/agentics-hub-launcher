### Ad Creator – Step 3 Modal UI (Reference)

This captures the current look-and-feel for the Step 3 “Publish into ad account” modal in `src/pages/advertising/AdCreatorDashboard.tsx`. Use this as a reference when we implement the real publishing flow (non-n8n).

- Header text toggles based on phase: “form” → “sending” → “done”
- Form phase:
  - Select ad account (select component with placeholder)
  - Campaign name input with confirm button (then switches to read-only with Edit)
  - Ad set name input with confirm button (then switches to read-only with Edit)
  - Once both are confirmed, a right-aligned “Send To Ad Account” button appears
- Sending phase:
  - Spinner with small status text
- Done phase:
  - Confirmation copy and “Open Ad AI CMO” / “View in Campaign Manager” links
  - “Check progress” (mock) and “Next” actions

Keep layout, spacing, and typography consistent with current implementation when wiring up the final publishing logic. No n8n integration will be used for this flow. 

