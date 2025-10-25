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
    
    console.log('Analyzing website with Gemini search:', url);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Use Gemini with search grounding to find competitors and analyze the business
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the business at ${url}. 

1. Research and identify 3 REAL competitor companies in the same industry/market. Return their primary website URLs (format: https://competitor.com). These must be:
   - External competitor businesses (NOT internal pages, privacy policies, or social media links)
   - Direct competitors offering similar products/services
   - Well-established companies in the same space

2. Provide a comprehensive description (100+ characters) of what this company does, including:
   - What problems they solve
   - Their unique value proposition
   - Target market
   - Key differentiators

Return ONLY a valid JSON object with this exact structure:
{
  "competitors": ["https://competitor1.com", "https://competitor2.com", "https://competitor3.com"],
  "product_service_description": "detailed description here"
}`
            }]
          }],
          tools: [{
            googleSearch: {}
          }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    console.log('Gemini response:', JSON.stringify(geminiData, null, 2));

    // Extract the text content from Gemini's response
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('No content in Gemini response');
    }

    // Parse the JSON from the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    console.log('Extracted data:', extractedData);

    // Return in the same format as before for frontend compatibility
    return new Response(JSON.stringify({
      success: true,
      data: extractedData
    }), {
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
