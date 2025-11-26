# Knowledge Base Setup Guide

## Firecrawl API Key Configuration

The Knowledge Base uses **Firecrawl** to scrape content from external URLs when adding items via the "External URL" option.

### Required Environment Variable

**Edge Function Secret:** `FIRECRAWL_API_KEY`

### Setup Steps

1. **Get your Firecrawl API Key:**
   - Sign up at [https://firecrawl.dev](https://firecrawl.dev)
   - Navigate to your dashboard → API Keys
   - Copy your API key

2. **Add to Supabase Secrets:**
   ```powershell
   # Using Supabase CLI
   npx supabase secrets set FIRECRAWL_API_KEY=your_api_key_here
   
   # Or via Supabase Dashboard:
   # Project Settings → Edge Functions → Secrets → Add Secret
   # Name: FIRECRAWL_API_KEY
   # Value: your_api_key_here
   ```

3. **Deploy the Edge Function:**
   ```powershell
   npx supabase functions deploy scrape-url-content
   ```

### How It Works

- **When adding an external URL:** The system automatically scrapes the page content using Firecrawl
- **Scraped content is stored** in `metadata.scraped_markdown` field as markdown
- **Title and description** are auto-filled from page metadata if available
- **"Scrape Again" button** in edit modal allows refreshing content from the URL

### Edge Function: `scrape-url-content`

**Endpoint:** `/functions/v1/scrape-url-content`

**Method:** POST

**Request Body:**
```json
{
  "url": "https://example.com/page"
}
```

**Response:**
```json
{
  "success": true,
  "markdown": "# Page Title\n\nContent...",
  "title": "Page Title",
  "description": "Page description",
  "url": "https://example.com/page"
}
```

### Features

- ✅ Automatic scraping on URL add
- ✅ Manual "Scrape Again" button for refreshing content
- ✅ Markdown format for easy reading
- ✅ Content viewable in "Scraped Content" tab
- ✅ Character count and scrape date displayed

