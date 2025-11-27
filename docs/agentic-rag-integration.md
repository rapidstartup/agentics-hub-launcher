# Agentic RAG Integration Guide

This guide documents the Agentic RAG (Retrieval Augmented Generation) system integrated into the application using Google Gemini's File Search API and Supabase Edge Functions.

## Overview

The system automatically indexes files uploaded to the Knowledge Base into Google's Vector Store (File Search). It creates "siloed" stores for each Client to ensure data privacy and relevance. When users or agents chat via the `gemini-chat` endpoint, the system dynamically attaches the relevant Knowledge Base store to the Gemini context.

### Architecture

1.  **Storage**: Files are stored in Supabase Storage (`knowledge-base` bucket).
2.  **Tracking**: Metadata and Indexing Status are tracked in the `knowledge_base_items` table.
3.  **Indexing**: A Supabase Database Webhook triggers the `rag-indexing` Edge Function on file changes.
4.  **Vector Store**: The Edge Function uploads files to Google Gemini File Search, organizing them into "Stores" (e.g., "Client 123 KB", "Agency KB").
5.  **Retrieval**: The `gemini-chat` Edge Function determines the active context (Client or Agency) and instructs Gemini to search the corresponding Store.

## Setup & Configuration

### 1. Environment Variables

Ensure the following secrets are set in your Supabase project (or `.env.local` for local dev):

*   `GEMINI_API_KEY`: Your Google Gemini API Key.
*   `SUPABASE_URL`: URL of your Supabase project.
*   `SUPABASE_SERVICE_ROLE_KEY`: Service role key (for the Indexing function to access DB/Storage).

### 2. Database Migrations

Run the following migrations to set up the schema and triggers:

1.  `supabase/migrations/20251127000001_rag_indexing.sql` (Adds tracking columns)
2.  `supabase/migrations/20251127000002_rag_webhook.sql` (Sets up `pg_net` trigger)

**Note**: You must enable the `pg_net` extension in your Supabase dashboard if not already enabled.

## Usage

### Indexing Documents

Indexing happens automatically.

1.  **Upload**: User or Agent uploads a file to the Knowledge Base (via UI or API).
2.  **Trigger**: The database detects the new row in `knowledge_base_items`.
3.  **Process**:
    *   The `rag-indexing` function is called.
    *   It determines the scope (Agency vs. Client).
    *   It checks if a Google File Store exists for that scope; if not, it creates one.
    *   It downloads the file from Supabase Storage and uploads it to Google.
    *   It updates the `indexing_status` column to `indexed`.

**Supported File Types**: PDF, CSV, TXT, Markdown, DOCX, etc. (See Google Gemini docs for full list).

### Querying (Chat)

To use the RAG context in chat, use the `gemini-chat` Edge Function with the appropriate context parameters.

**Endpoint**: `POST /functions/v1/gemini-chat`

**Payload**:

```json
{
  "prompt": "What is the brand voice for this client?",
  "clientId": "uuid-of-client",  // OPTIONAL: Restricts search to this Client's store
  "scope": "agency",             // OPTIONAL: If no client, restricts to Agency store
  "temperature": 0.7
}
```

**Logic**:
*   If `clientId` is provided, the system searches for a Knowledge Base Item belonging to that client to find the `google_store_id`.
*   If found, it passes this Store ID to Gemini as a tool.
*   Gemini will search documents in that store to answer the prompt.

## Troubleshooting

### Checking Indexing Status

You can query the status of items in the database:

```sql
SELECT title, indexing_status, google_error 
FROM knowledge_base_items 
WHERE indexing_status != 'indexed';
```

### Common Errors

1.  **`indexing_status: failed`**: Check the `google_error` column.
    *   *Error: "File too large"* -> Google limit is 2GB per file.
    *   *Error: "Unsupported mime type"* -> Convert to PDF or Text.
2.  **Webhook not firing**:
    *   Check Supabase Database Webhooks in the Dashboard.
    *   Ensure `pg_net` is enabled.
    *   Verify `app.settings.edge_function_url` is correct in the SQL trigger definition (or hardcode it).

### Manual Re-indexing

If an item failed or needs re-indexing, you can manually invoke the function or update the row to trigger it again:

```sql
-- This will trigger the UPDATE webhook
UPDATE knowledge_base_items 
SET indexing_status = 'pending' 
WHERE id = 'uuid-of-item';
```

