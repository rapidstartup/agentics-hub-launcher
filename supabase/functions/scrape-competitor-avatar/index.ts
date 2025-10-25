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
    const { url, existingAvatarDescription, productDescription, companyName } = await req.json();
    
    console.log('Analyzing competitor with Gemini:', url);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build the analysis prompt
    const prompt = `Analyze the competitor at ${url} and help define the ideal client avatar for ${companyName || 'our company'}.

**Our Company's Product/Service:**
${productDescription || 'Not provided'}

**Current Ideal Client Avatar (if any):**
${existingAvatarDescription || 'Not yet defined'}

**Task:**
1. Research the competitor's target audience, case studies, testimonials, and positioning
2. Synthesize insights about who THEY serve
3. Based on our product/service description, refine and update the ideal client avatar for OUR COMPANY (not the competitor)
4. If there's existing avatar data, integrate the new insights with it to create a more comprehensive profile

**Return a detailed ideal client avatar description (200+ characters) that includes:**
- Demographics (age, location, role, industry)
- Psychographics (values, goals, challenges)
- Pain points they experience
- What they care about most
- How they make decisions
- Where they seek information

Focus on creating the ideal client profile for OUR COMPANY based on competitive intelligence.

Return ONLY a valid JSON object:
{
  "ideal_client_avatar": "comprehensive description here"
}`;

    // Use Gemini with search grounding
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
              text: prompt
            }]
          }],
          tools: [{
            googleSearch: {}
          }],
          generationConfig: {
            temperature: 0.4,
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

    // Extract the text content
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
    console.log('Extracted avatar data:', extractedData);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scrape-competitor-avatar:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
