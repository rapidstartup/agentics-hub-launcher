# Knowledge Base Setup Guide

This guide will help you set up and configure the enhanced agentic RAG knowledge base system.

## Quick Start

### 1. Run Database Migrations

```bash
# Navigate to your project
cd agentics-hub-launcher

# Run migrations in order
supabase migration run 20251127000001_rag_indexing.sql
supabase migration run 20251127000002_rag_webhook.sql
supabase migration run 20251128000001_enhanced_kb_indexing.sql
```

### 2. Enable Required Extensions

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 3. Configure Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add:

```bash
# Existing (should already be set)
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# New for Google Search integration
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### 4. Deploy Edge Functions

```bash
# Deploy Google Search indexing function
supabase functions deploy google-search-indexing

# Verify existing RAG function is deployed
supabase functions deploy rag-indexing
supabase functions deploy gemini-chat
```

### 5. Access the New Features

**Client-Level Features:**
- Knowledge Browser: `/client/:clientId/knowledge-browser`
- Client Knowledge (updated): `/client/:clientId/knowledge`
- Company Brain: `/client/:clientId/strategy/company-brain`

**Agency-Level Features (Admin):**
- Agency Central Brain: `/admin/central-brain`

## Features Overview

### 1. Knowledge Base Browser

**URL**: `/client/:clientId/knowledge-browser`

A comprehensive library-style interface with:
- Quick access cards for all categories
- Company Brain status dashboard
- Advanced search and filtering
- Category tabs (Overview, Knowledge Bases, Strategy, Assets, Tools, Swipe Files, Integrations)

**Usage**:
- Click on any category card to filter items
- Use the search bar for full-text search
- Click "Ask AI" to open the chat widget
- Click "Upload" to add new documents

### 2. Ask AI Widget

**Component**: `<AskAIWidget />`

An intelligent chat interface for querying documents:
- Select specific documents to query
- Natural language questions
- Source attribution with links
- Pre-built query suggestions

**Example Queries**:
```
"What are the key points in these documents?"
"What is our brand voice?"
"Find all mentions of our target audience"
"Compare these documents and highlight differences"
```

**Integration**:
```tsx
import { AskAIWidget } from '@/components/knowledge-base/AskAIWidget';

function MyComponent() {
  const [askAIOpen, setAskAIOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setAskAIOpen(true)}>Ask AI</Button>
      <AskAIWidget open={askAIOpen} onOpenChange={setAskAIOpen} />
    </>
  );
}
```

### 3. Agency Central Brain

**URL**: `/admin/central-brain`

Admin-level dashboard with:
- Global statistics across all clients
- Per-client breakdown
- Agency vs Client document counts
- Recent activity feed
- Bulk reindexing

**Access**: Restricted to agency admins only

### 4. Enhanced Client Knowledge Page

**URL**: `/client/:clientId/knowledge`

Updated with:
- "Ask AI" button in header
- Live indexing statistics
- Dynamic RAG status indicator
- One-click reindexing
- Enhanced metrics display

## Configuration Details

### Google Search API Setup

1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Custom Search API"
   - Create credentials (API Key)

2. **Create Search Engine**:
   - Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Click "Add" to create new search engine
   - Configure search settings
   - Get your Search Engine ID

3. **Add to Supabase**:
   - Settings > Edge Functions > Secrets
   - Add `GOOGLE_SEARCH_API_KEY`
   - Add `GOOGLE_SEARCH_ENGINE_ID`

### Gemini File Search (Already Configured)

This should already be working from the previous setup:
- `GEMINI_API_KEY` in Supabase secrets
- `rag-indexing` edge function deployed
- Database webhooks active

## How It Works

### Document Upload Flow

```
User uploads document
    ↓
Saved to Supabase Storage
    ↓
Metadata saved to knowledge_base_items
    ↓
Database webhook triggers
    ↓
┌─────────────────────┬─────────────────────┐
│                     │                     │
rag-indexing         google-search-indexing
(Gemini File Search)  (Google Search API)
│                     │                     │
└─────────────────────┴─────────────────────┘
    ↓
indexing_status = "indexed"
    ↓
Document queryable via Ask AI
```

### Query Flow

```
User asks question in Ask AI
    ↓
Selected documents sent as context
    ↓
gemini-chat edge function called
    ↓
Gemini searches File Search store
    ↓
Results combined with LLM knowledge
    ↓
Response with source attribution
    ↓
Query statistics updated
    ↓
Response displayed to user
```

## API Reference

### Edge Functions

#### 1. `gemini-chat`
```typescript
// Query with RAG
const { data } = await supabase.functions.invoke('gemini-chat', {
  body: {
    prompt: "What is our brand voice?",
    clientId: "client-uuid",
    userId: "user-uuid",
    kbItemIds: ["doc1-uuid", "doc2-uuid"],
    enableRag: true,
    temperature: 0.7
  }
});
```

#### 2. `google-search-indexing`
```typescript
// Reindex all documents
const { data } = await supabase.functions.invoke('google-search-indexing', {
  body: {
    action: 'reindex',
    scope: 'client' // or 'agency'
  }
});

// Search documents
const { data } = await supabase.functions.invoke('google-search-indexing', {
  body: {
    action: 'search',
    query: 'brand guidelines',
    filters: { category: 'document' },
    limit: 10
  }
});
```

#### 3. `rag-indexing`
```typescript
// Trigger manual reindex
const { data } = await supabase.functions.invoke('rag-indexing', {
  body: {
    action: 'reindex',
    scope: 'client',
    clientId: 'client-uuid'
  }
});
```

### Database Functions

#### 1. `search_knowledge_base`
```sql
SELECT * FROM search_knowledge_base(
  'search query',
  'client',        -- filter_scope
  'client-uuid',   -- filter_client_id
  'document',      -- filter_category
  20               -- max_results
);
```

#### 2. `get_related_kb_items`
```sql
SELECT * FROM get_related_kb_items('doc-uuid', 5);
```

#### 3. `update_kb_query_stats`
```sql
SELECT update_kb_query_stats('item-uuid', 0.95);
```

### Database Views

#### `knowledge_base_analytics`
```sql
-- Get statistics by client and category
SELECT
  client_id,
  category,
  total_items,
  indexed_items,
  google_indexed_items,
  total_queries,
  avg_relevance
FROM knowledge_base_analytics
WHERE scope = 'client'
ORDER BY total_queries DESC;
```

## Testing

### 1. Test Document Upload

1. Go to `/client/:clientId/knowledge`
2. Click "Upload"
3. Upload a test PDF or document
4. Wait for indexing (status should change to "indexed")
5. Check in database:
```sql
SELECT id, title, indexing_status, google_search_indexed
FROM knowledge_base_items
ORDER BY created_at DESC
LIMIT 1;
```

### 2. Test Ask AI

1. Go to `/client/:clientId/knowledge`
2. Click "Ask AI"
3. Click "Add Documents to Context"
4. Select the uploaded document
5. Ask: "What is this document about?"
6. Verify response with source attribution

### 3. Test Agency Dashboard

1. Go to `/admin/central-brain`
2. Verify statistics display correctly
3. Check client breakdown
4. Test client filtering
5. Click "Reindex All"

### 4. Test Search

1. Go to `/client/:clientId/knowledge-browser`
2. Use search bar to find documents
3. Test category filtering
4. Verify results are accurate

## Troubleshooting

### Documents Not Indexing

**Check indexing status**:
```sql
SELECT id, title, indexing_status, google_error
FROM knowledge_base_items
WHERE indexing_status != 'indexed'
ORDER BY created_at DESC;
```

**Manually trigger reindex**:
```sql
UPDATE knowledge_base_items
SET indexing_status = 'pending'
WHERE id = 'doc-uuid';
```

**Check edge function logs**:
- Supabase Dashboard > Edge Functions > Logs
- Look for errors in `rag-indexing` and `google-search-indexing`

### Ask AI Not Responding

**Check API keys**:
- Verify `GEMINI_API_KEY` is set
- Verify API key has not expired
- Check API quota limits

**Check edge function**:
```bash
supabase functions list
supabase functions logs gemini-chat
```

**Test manually**:
```typescript
const { data, error } = await supabase.functions.invoke('gemini-chat', {
  body: {
    prompt: "Test query",
    enableRag: false  // Test without RAG first
  }
});
console.log(data, error);
```

### RAG Status Stuck on "Processing"

**Check webhook**:
- Supabase Dashboard > Database > Webhooks
- Verify `rag_indexing_webhook` is enabled
- Check webhook logs

**Check pg_net extension**:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

**Manually invoke function**:
```typescript
const { data, error } = await supabase.functions.invoke('rag-indexing', {
  body: {
    action: 'index',
    itemId: 'doc-uuid'
  }
});
```

### Google Search Not Working

**Verify credentials**:
```bash
# In Supabase dashboard
Settings > Edge Functions > Secrets
# Check: GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID
```

**Test API directly**:
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_ENGINE_ID&q=test"
```

**Check function deployment**:
```bash
supabase functions deploy google-search-indexing
supabase functions logs google-search-indexing
```

## Performance Tips

1. **Batch Uploads**: Upload multiple files at once instead of one-by-one
2. **Reindex Schedule**: Don't reindex too frequently (once per hour max)
3. **Document Size**: Keep files under 50MB for faster indexing
4. **Query Context**: Limit selected documents to 5-10 for best results
5. **Caching**: Results are cached for 15 minutes

## Security

- All queries filtered by `user_id` via RLS policies
- Client data is isolated (can't access other clients)
- API keys stored securely in Supabase secrets
- File access via signed URLs with expiration
- Query logs tracked for audit

## Next Steps

1. **Test the system** with real documents
2. **Train users** on Ask AI features
3. **Monitor usage** via analytics view
4. **Optimize queries** based on relevance scores
5. **Expand categories** as needed
6. **Add custom integrations** (Notion, Confluence, etc.)

## Support

For issues or questions:
1. Check Supabase function logs
2. Review database trigger logs
3. Verify environment variables
4. Test edge functions individually
5. Check network connectivity

## Additional Resources

- [Agentic RAG Integration Guide](./agentic-rag-integration.md)
- [Agentic RAG Features](./agentic-rag-features.md)
- [Google Custom Search API Docs](https://developers.google.com/custom-search)
- [Gemini File Search Docs](https://ai.google.dev/docs/file_search)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
