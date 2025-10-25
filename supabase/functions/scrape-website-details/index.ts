import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    console.log('Scraping website details for:', url);

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'extract'],
        extract: {
          prompt: `Analyze this business website and extract:
1. COMPETITORS: Find 3 EXTERNAL competitor companies (NOT internal pages, privacy policies, or social media links). Look for companies mentioned as alternatives, comparisons, or in the same industry. Return ONLY their main website URLs (e.g., https://competitor.com). If no competitors are explicitly mentioned, research the industry/service and provide 3 major competitors in this space.
2. PRODUCT/SERVICE: Write a detailed 100+ character description of what this company does, what problems they solve, their unique value proposition, and target market.`,
          schema: {
            type: "object",
            properties: {
              competitors: {
                type: "array",
                items: { type: "string" },
                description: "Array of 3 competitor website URLs (external domains only, no internal links)",
                minItems: 3,
                maxItems: 3
              },
              product_service_description: {
                type: "string",
                description: "Comprehensive product/service description with problem solved, value proposition, and target market",
                minLength: 100
              }
            },
            required: ["competitors", "product_service_description"]
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl error:', response.status, errorText);
      throw new Error(`Firecrawl error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Firecrawl response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scrape-website-details:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
