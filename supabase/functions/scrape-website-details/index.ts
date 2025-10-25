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

    const response = await fetch('https://api.firecrawl.dev/v1/extract', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [`${url}/*`],
        prompt: "From all pages, identify and list the top 3 competitors by their website URLs. Also, provide a detailed product or service description of at least 50 characters, explaining what problems it solves and what makes it unique.",
        schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: { type: "string" },
              description: "List of competitor website URLs"
            },
            product_service_description: {
              type: "string",
              description: "Detailed product or service description"
            }
          },
          required: ["competitors", "product_service_description"]
        },
        enableWebSearch: true
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
