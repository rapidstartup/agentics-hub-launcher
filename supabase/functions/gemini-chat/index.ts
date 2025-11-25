import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ChatInput = {
  prompt: string;
  responseFormat?: 'json' | 'text';
  temperature?: number;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Use POST' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const body = (await req.json()) as ChatInput;
    const { prompt, responseFormat = 'text', temperature = 0.7 } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const requestId = crypto.randomUUID();
    console.log(JSON.stringify({ event: 'gemini-chat:start', requestId, userId: user.id }));

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    let response = '';

    const systemPrompt = responseFormat === 'json' 
      ? 'You are a helpful assistant. You must respond with valid JSON only, no markdown formatting or extra text.'
      : 'You are a helpful assistant.';

    if (lovableKey) {
      const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        })
      });
      const data = await resp.json();
      console.log(JSON.stringify({ event: 'gemini-chat:lovable:response', requestId, hasChoices: !!data?.choices }));
      response = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.message?.text ?? '';
    } else if (geminiKey) {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: { temperature }
        })
      });
      const data = await resp.json();
      console.log(JSON.stringify({ event: 'gemini-chat:gemini:response', requestId, status: 'ok' }));
      response = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } else {
      // Fallback mock for development
      response = responseFormat === 'json' 
        ? '{"message": "Mock response - no API key configured"}'
        : 'Mock response - no API key configured';
    }

    console.log(JSON.stringify({ event: 'gemini-chat:done', requestId, responseLength: response.length }));
    return new Response(JSON.stringify({ response, requestId }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error('gemini-chat error', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

