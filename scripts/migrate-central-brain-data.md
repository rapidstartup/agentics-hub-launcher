# Central Brain Data Migration Guide

This guide explains how to migrate Central Brain data from the adpilot-ai-command project to the agentics-hub-launcher project.

## Step 1: Deploy the Export Function to Source Project

Copy the export function to the source project (adpilot-ai-command):

```powershell
# Navigate to the source project
cd C:\Users\natha\Downloads\repositories\adpilot-ai-command

# Copy the export function from the target project
Copy-Item -Path "C:\Users\natha\Downloads\repositories\agentics-hub-launcher\supabase\functions\export-central-brain-data" -Destination ".\supabase\functions\" -Recurse
```

Then deploy the function:

```powershell
# Deploy the export function
npx supabase functions deploy export-central-brain-data --project-ref ysjjdpfatfkbvqfkuwjr
```

## Step 2: Run the Export Function

Invoke the export function to get all the data:

```powershell
# Call the export function (replace with your actual service key if different)
$response = Invoke-RestMethod -Uri "https://ysjjdpfatfkbvqfkuwjr.supabase.co/functions/v1/export-central-brain-data" -Method GET -Headers @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzampkcGZhdGZrYnZxZmt1d2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDAwNjYsImV4cCI6MjA3OTcxNjA2Nn0.bfssg4esEcUtBpIfV_W9nwlpStW9qcYHhIJN1OGLgo0"
    "Content-Type" = "application/json"
}

# Save the response to a file
$response | ConvertTo-Json -Depth 100 | Out-File -FilePath "central-brain-export.json" -Encoding UTF8

Write-Host "Export complete! Check central-brain-export.json"
Write-Host "Summary:"
$response.summary | Format-Table
$response.stats | Format-Table
```

Or use curl:

```bash
curl -X GET "https://ysjjdpfatfkbvqfkuwjr.supabase.co/functions/v1/export-central-brain-data" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzampkcGZhdGZrYnZxZmt1d2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDAwNjYsImV4cCI6MjA3OTcxNjA2Nn0.bfssg4esEcUtBpIfV_W9nwlpStW9qcYHhIJN1OGLgo0" \
  -H "Content-Type: application/json" \
  -o central-brain-export.json
```

## Step 3: Deploy the Import Function to Target Project

In the target project (agentics-hub-launcher):

```powershell
# Navigate to the target project
cd C:\Users\natha\Downloads\repositories\agentics-hub-launcher

# Deploy the import function
npx supabase functions deploy import-central-brain-data --project-ref bzldwfwyrivwlyfixmrt
```

## Step 4: Run the Import Function

Send the exported data to the import function:

```powershell
# Read the export file and send to import function
$exportData = Get-Content -Path "central-brain-export.json" -Raw | ConvertFrom-Json

$body = @{
    data = $exportData.data
} | ConvertTo-Json -Depth 100

$response = Invoke-RestMethod -Uri "https://bzldwfwyrivwlyfixmrt.supabase.co/functions/v1/import-central-brain-data" -Method POST -Headers @{
    "Authorization" = "Bearer YOUR_SERVICE_KEY_HERE"
    "Content-Type" = "application/json"
} -Body $body

Write-Host "Import complete!"
$response.summary | Format-Table
$response.results | Format-Table
```

## Tables Migrated

The migration includes:

### Content Management
- `content_groups` - Folder/group organization
- `assets` - Media and file assets
- `swipe_files` - Swipe file library
- `prompt_templates` - Prompt templates
- `ai_roles` - AI persona configurations
- `knowledge_entries` - Knowledge base entries

### Strategy
- `project_strategies` - Strategy documents
- `market_research` - Market research data
- `funnels` - Funnel structures
- `offers` - Product/service offers
- `offer_assets` - Assets linked to offers

### Tools & Integrations
- `project_tools` - Tool configurations
- `integrations` - Platform integrations

### Agent Projects
- `agent_boards` - Project boards
- `project_groups` - Project groupings
- `board_settings` - Board configurations
- `board_tools` - Tools enabled per board

### Creative Cards (Kanban)
- `creative_cards` - Kanban cards

### Canvas
- `canvas_blocks` - Canvas nodes
- `canvas_edges` - Canvas connections
- `canvas_groups` - Canvas groupings

### Chat
- `agent_chat_sessions` - Chat sessions
- `agent_chat_messages` - Chat messages

### Ad Spy
- `ad_spy_competitors` - Competitor tracking
- `ad_spy_ads` - Scraped ads
- `ad_spy_boards` - Ad collection boards
- `ad_spy_board_items` - Board-ad associations
- `ad_spy_search_history` - Search history
- `ad_spy_settings` - User settings
- `ad_spy_research_agents` - Research agents

### App Settings
- `app_settings` - Application settings

## Notes

1. **ID Preservation**: Records keep their original UUIDs, so references between tables remain intact.

2. **Upsert Behavior**: The import uses upsert, so running it multiple times will update existing records rather than creating duplicates.

3. **Storage Files**: This migration only handles database records. If you have files in Supabase Storage (images, videos, documents), you'll need to migrate those separately.

4. **User/Auth References**: Records may reference user IDs from the source database. If users are different between projects, you may need to update `user_id` fields.

