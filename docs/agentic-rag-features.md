# Agentic RAG Features - Implementation Guide

## Overview

This document outlines the comprehensive agentic RAG (Retrieval Augmented Generation) system implemented across the knowledge base. The system provides intelligent document search, multi-document querying, and contextual AI assistance.

## New Features Implemented

### 1. Enhanced Knowledge Base Browser (`KnowledgeBaseBrowser.tsx`)

**Location**: `src/pages/KnowledgeBaseBrowser.tsx`

A comprehensive library-style interface for browsing and organizing knowledge base items:

**Features**:
- **Organized Sections**: Quick access cards for all major categories
  - Knowledge Bases (Documents)
  - Strategy (Brand, research, funnels & offers)
  - Asset Library (Media & files)
  - Tools (Internal, external & prompts)
  - Swipe Files (Saved ad inspirations)
  - Integrations (Connected platforms)

- **Company Brain Status Dashboard**:
  - Real-time indexing statistics
  - Total items, indexed count, processing count, failed count
  - RAG status indicator with live updates
  - One-click reindexing

- **Advanced Filtering**:
  - Full-text search across all fields
  - Category filtering with counts
  - Scope filtering (Agency/Client)

- **Tab Navigation**:
  - Overview - Quick access to all sections
  - Knowledge Bases - Document library
  - Strategy - Strategic resources
  - Asset Library - Media files
  - Tools - Templates and scripts
  - Swipe Files - Ad inspirations
  - Integrations - Connected platforms

**Usage**:
```typescript
import KnowledgeBaseBrowser from '@/pages/KnowledgeBaseBrowser';

// Access via routing
<Route path="/knowledge-browser" element={<KnowledgeBaseBrowser />} />
```

### 2. Ask AI Chat Widget (`AskAIWidget.tsx`)

**Location**: `src/components/knowledge-base/AskAIWidget.tsx`

An intelligent chat interface with agentic RAG capabilities for querying knowledge base documents.

**Features**:
- **Multi-Document Selection**: Select specific documents to query
- **Contextual Queries**: AI understands context from selected documents
- **Source Attribution**: Shows which documents were used to answer
- **Smart Suggestions**: Pre-built query templates
- **Real-time Chat**: Streaming responses with markdown support
- **Query Statistics**: Tracks usage and relevance

**Key Capabilities**:
1. **Document Selection**:
   - Browse and select documents from knowledge base
   - Multi-select with visual checkboxes
   - Filter by indexed status
   - Display document metadata

2. **Chat Interface**:
   - Natural language queries
   - Markdown response rendering
   - Source citation with links
   - Creation date and category display
   - Query history

3. **Agentic Features**:
   - Automatic document relevance scoring
   - Related document suggestions
   - Context-aware responses
   - Cross-document synthesis

**Usage**:
```typescript
import { AskAIWidget } from '@/components/knowledge-base/AskAIWidget';

// Basic usage
<AskAIWidget
  open={isOpen}
  onOpenChange={setIsOpen}
/>

// With preselected documents
<AskAIWidget
  open={isOpen}
  onOpenChange={setIsOpen}
  preselectedItems={selectedDocs}
/>
```

**Example Queries**:
- "What are the key points in these documents?"
- "What is our brand voice?"
- "Find all mentions of our target audience"
- "Compare these documents and highlight differences"
- "Summarize the strategy documents"

### 3. Agency Central Brain (`AgencyCentralBrain.tsx`)

**Location**: `src/pages/AgencyCentralBrain.tsx`

Admin-level knowledge base interface with cross-client visibility and analytics.

**Features**:
- **Global Statistics**:
  - Total documents across all clients
  - Agency vs Client breakdown
  - Indexing status overview
  - Processing and failed items tracking

- **Client Breakdown**:
  - Per-client document counts
  - Category distribution per client
  - Indexing status per client
  - Quick client filtering

- **Multi-Scope Management**:
  - Agency-level documents (shared resources)
  - Client-level documents (client-specific)
  - Unified search across all scopes
  - Bulk reindexing operations

- **Recent Activity Feed**:
  - Latest 10 uploads across all clients
  - Indexing status indicators
  - Timestamp tracking
  - Scope identification

**Access Control**:
- Only accessible to agency admins
- RLS policies enforce user_id matching
- Client data isolation maintained

**Usage**:
```typescript
import AgencyCentralBrain from '@/pages/AgencyCentralBrain';

// Admin route
<Route path="/admin/central-brain" element={<AgencyCentralBrain />} />
```

### 4. Google Search API Integration

**Location**: `supabase/functions/google-search-indexing/index.ts`

Integration with Google Custom Search API for enhanced document indexing and search.

**Actions**:

1. **Index** - Index a single document
```typescript
await supabase.functions.invoke('google-search-indexing', {
  body: {
    action: 'index',
    itemId: 'uuid-of-item'
  }
});
```

2. **Search** - Query indexed documents
```typescript
await supabase.functions.invoke('google-search-indexing', {
  body: {
    action: 'search',
    query: 'search terms',
    filters: {
      category: 'document',
      tags: ['marketing']
    },
    limit: 10
  }
});
```

3. **Delete** - Remove from index
```typescript
await supabase.functions.invoke('google-search-indexing', {
  body: {
    action: 'delete',
    itemId: 'uuid-of-item'
  }
});
```

4. **Reindex** - Bulk reindex by scope
```typescript
await supabase.functions.invoke('google-search-indexing', {
  body: {
    action: 'reindex',
    scope: 'agency' // or 'client'
  }
});
```

**Environment Variables**:
```bash
GOOGLE_SEARCH_API_KEY=your-api-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id
```

**Document Structure**:
```typescript
{
  id: string,
  structData: {
    title: string,
    description: string,
    content: string,        // Full-text content
    url?: string,           // External URL if applicable
    category: string,
    tags: string[],
    created_at: string,
    updated_at: string,
    metadata: any
  }
}
```

### 5. Enhanced Database Schema

**Location**: `supabase/migrations/20251128000001_enhanced_kb_indexing.sql`

**New Columns**:
```sql
-- Google Search Integration
google_search_indexed: BOOLEAN
google_search_indexed_at: TIMESTAMPTZ
google_search_error: TEXT

-- Usage Analytics
last_queried_at: TIMESTAMPTZ
query_count: INTEGER
relevance_score: FLOAT

-- Content Management
content_hash: TEXT
indexed_content_length: INTEGER
```

**New Functions**:

1. **update_kb_query_stats** - Track query usage
```sql
SELECT update_kb_query_stats('item-uuid', 0.95);
```

2. **get_related_kb_items** - Find related documents
```sql
SELECT * FROM get_related_kb_items('item-uuid', 5);
```

3. **search_knowledge_base** - Full-text search
```sql
SELECT * FROM search_knowledge_base(
  'search query',
  'client',           -- filter_scope
  'client-uuid',      -- filter_client_id
  'document',         -- filter_category
  20                  -- max_results
);
```

4. **calculate_content_hash** - Detect content changes
```sql
SELECT calculate_content_hash('item-uuid');
```

**Views**:

**knowledge_base_analytics** - Aggregated statistics
```sql
SELECT * FROM knowledge_base_analytics
WHERE scope = 'agency' AND category = 'document';
```

**Indexes**:
- Full-text search index on title, description, tags
- Google Search indexed status
- Query statistics (last_queried_at, query_count)
- Content hash for change detection

### 6. Updated Client Knowledge Page

**Location**: `src/pages/ClientKnowledge.tsx`

**Enhancements**:
1. **Ask AI Button**: Quick access to AI chat widget
2. **Live Indexing Status**:
   - Real-time indexed count
   - Processing count
   - Dynamic RAG status indicator (Ready/Indexing/Idle)
3. **Reindex Functionality**: One-click reindexing with both Google Search and RAG
4. **Enhanced Statistics**: More detailed metrics display

**New Features**:
```typescript
// Ask AI Integration
<Button onClick={() => setAskAIOpen(true)}>
  <MessageSquare /> Ask AI
</Button>

// Enhanced Statistics
<div className="rounded-lg bg-emerald-500/10 p-4">
  <p className="text-2xl font-bold text-emerald-500">{indexedCount}</p>
  <p className="text-xs text-muted-foreground">Indexed</p>
</div>

// Dynamic RAG Status
<div className={`h-2 w-2 rounded-full ${
  indexedCount === totalItems ? "bg-green-500 animate-pulse" : "bg-amber-500"
}`} />
```

## Integration Flow

### Document Upload → Indexing → Query

```
1. User uploads document
   ↓
2. Document saved to Supabase Storage
   ↓
3. Metadata saved to knowledge_base_items table
   ↓
4. Database webhook triggers rag-indexing function
   ↓
5. Document indexed in Gemini File Search
   ↓
6. (Parallel) Document indexed in Google Search API
   ↓
7. indexing_status set to "indexed"
   ↓
8. Document becomes queryable via Ask AI widget
   ↓
9. User queries document
   ↓
10. Query statistics updated (query_count, last_queried_at)
    ↓
11. Relevance score calculated
    ↓
12. Response returned with source attribution
```

## Configuration

### Environment Variables

**Supabase Edge Functions** (`.env` or Supabase dashboard):
```bash
# Existing
GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# New
GOOGLE_SEARCH_API_KEY=your-google-search-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id
```

### Database Migrations

Run in order:
```bash
# Existing
supabase migration run 20251127000001_rag_indexing.sql
supabase migration run 20251127000002_rag_webhook.sql

# New
supabase migration run 20251128000001_enhanced_kb_indexing.sql
```

### Enable Extensions

```sql
-- Required for webhooks
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Required for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

## API Endpoints

### Gemini Chat (Enhanced)
```
POST /functions/v1/gemini-chat

Body:
{
  "prompt": "What is our brand voice?",
  "clientId": "uuid-of-client",
  "userId": "uuid-of-user",
  "kbItemIds": ["uuid1", "uuid2"],  // NEW: Specific documents
  "itemContext": [...],              // NEW: Document content
  "temperature": 0.7,
  "enableRag": true                  // NEW: Enable RAG search
}
```

### Google Search Indexing
```
POST /functions/v1/google-search-indexing

Actions: index, search, delete, reindex
```

### Knowledge Base (Enhanced)
```
POST /functions/v1/knowledge-base

Actions: list, get, create, update, delete, archive, pin, search, stats
```

## Usage Examples

### Example 1: Query Specific Documents

```typescript
import { AskAIWidget } from '@/components/knowledge-base/AskAIWidget';

function MyComponent() {
  const [selectedDocs, setSelectedDocs] = useState([...]);

  return (
    <AskAIWidget
      open={true}
      onOpenChange={setOpen}
      preselectedItems={selectedDocs}
    />
  );
}
```

### Example 2: Admin Dashboard

```typescript
import AgencyCentralBrain from '@/pages/AgencyCentralBrain';

function AdminDashboard() {
  return (
    <div>
      <AgencyCentralBrain />
    </div>
  );
}
```

### Example 3: Reindex All Documents

```typescript
async function reindexAll() {
  // Reindex Google Search
  await supabase.functions.invoke('google-search-indexing', {
    body: { action: 'reindex', scope: 'agency' }
  });

  // Reindex Gemini RAG
  await supabase.functions.invoke('rag-indexing', {
    body: { action: 'reindex', scope: 'agency' }
  });
}
```

### Example 4: Search Knowledge Base

```typescript
const { data } = await supabase.rpc('search_knowledge_base', {
  search_query: 'brand guidelines',
  filter_scope: 'client',
  filter_client_id: clientId,
  max_results: 10
});
```

## Analytics & Tracking

### Query Statistics

Every time a document is queried via Ask AI:
- `query_count` increments
- `last_queried_at` updates
- `relevance_score` calculated based on usage

### View Analytics

```sql
-- Get statistics by category
SELECT * FROM knowledge_base_analytics
WHERE client_id = 'uuid'
ORDER BY total_queries DESC;

-- Find most queried documents
SELECT * FROM knowledge_base_items
WHERE client_id = 'uuid'
ORDER BY query_count DESC
LIMIT 10;

-- Get related documents
SELECT * FROM get_related_kb_items('doc-uuid', 5);
```

## Troubleshooting

### Document Not Appearing in Search

1. Check indexing status:
```sql
SELECT id, title, indexing_status, google_search_indexed
FROM knowledge_base_items
WHERE id = 'uuid';
```

2. Manually trigger reindex:
```sql
UPDATE knowledge_base_items
SET indexing_status = 'pending'
WHERE id = 'uuid';
```

### Ask AI Not Finding Documents

1. Ensure documents are indexed:
```sql
SELECT COUNT(*) FROM knowledge_base_items
WHERE indexing_status = 'indexed' AND client_id = 'uuid';
```

2. Check document selection in widget
3. Verify Gemini API key is set

### RAG Status Stuck on "Processing"

1. Check edge function logs in Supabase dashboard
2. Look for errors in `google_error` column
3. Verify file size < 2GB
4. Check supported MIME types

## Performance Considerations

- **Indexing**: Asynchronous, happens in background
- **Query Speed**: Cached results expire after 15 minutes
- **Large Files**: Files > 100MB may take longer to index
- **Concurrent Queries**: Multiple users can query simultaneously
- **Rate Limits**: Google Search API has rate limits

## Security

- **RLS Policies**: All queries filtered by user_id
- **Client Isolation**: Client data never mixed
- **API Keys**: Stored securely in Supabase secrets
- **File Access**: Signed URLs with expiration
- **Query Logs**: All queries tracked for audit

## Next Steps

Potential enhancements:
1. **Vector embeddings** for semantic search
2. **Query caching** for faster responses
3. **Batch operations** for bulk uploads
4. **Export functionality** to PDF/CSV
5. **Advanced analytics dashboard**
6. **AI-powered document summarization**
7. **Automatic tagging** based on content
8. **Version control** for documents
9. **Collaboration features** (comments, annotations)
10. **Integration with external tools** (Notion, Confluence)

## Support

For issues or questions:
- Check Supabase function logs
- Review database trigger logs
- Verify environment variables
- Test edge functions individually
- Check network connectivity to Google APIs
