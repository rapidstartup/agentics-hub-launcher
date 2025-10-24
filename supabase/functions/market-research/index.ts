import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      reportId,
      companyName,
      companyWebsite,
      competitorLinks,
      productDescription,
      clientAvatarDescription 
    } = await req.json();

    console.log('Processing market research for report:', reportId);

    // Update status to processing
    await supabase
      .from('market_research_reports')
      .update({ 
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', reportId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Stage 1: Company Analysis
    console.log('Stage 1: Company Analysis');
    const companyAnalysis = await analyzeCompany(
      LOVABLE_API_KEY,
      companyName,
      companyWebsite,
      productDescription
    );

    // Stage 2: Competitor Analysis
    console.log('Stage 2: Competitor Analysis');
    const competitorAnalysis = await analyzeCompetitors(
      LOVABLE_API_KEY,
      competitorLinks,
      companyName
    );

    // Stage 3: Market Segment Analysis
    console.log('Stage 3: Market Segment Analysis');
    const marketAnalysis = await analyzeMarket(
      LOVABLE_API_KEY,
      companyName,
      productDescription
    );

    // Stage 4: Psychographic Profile
    console.log('Stage 4: Psychographic Profile');
    const psychographicProfile = await createPsychographicProfile(
      LOVABLE_API_KEY,
      clientAvatarDescription,
      productDescription
    );

    // Stage 5: Strategic Recommendations
    console.log('Stage 5: Strategic Recommendations');
    const recommendations = await generateRecommendations(
      LOVABLE_API_KEY,
      companyAnalysis,
      competitorAnalysis,
      marketAnalysis,
      psychographicProfile
    );

    // Compile full report
    const fullReport = compileReport({
      companyName,
      companyWebsite,
      competitorLinks,
      productDescription,
      clientAvatarDescription,
      companyAnalysis,
      competitorAnalysis,
      marketAnalysis,
      psychographicProfile,
      recommendations
    });

    // Save completed report
    const { error: updateError } = await supabase
      .from('market_research_reports')
      .update({
        status: 'completed',
        report_content: fullReport,
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      throw updateError;
    }

    console.log('Market research completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportId,
        preview: fullReport.substring(0, 500) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in market-research function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function callLovableAI(apiKey: string, messages: any[]) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function analyzeCompany(
  apiKey: string,
  companyName: string,
  website: string,
  productDescription: string
) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert market research analyst specializing in comprehensive company analysis. 
      Provide detailed, actionable insights with proper formatting using markdown.`
    },
    {
      role: 'user',
      content: `Conduct a comprehensive company analysis for:

Company: ${companyName}
Website: ${website}
Product/Service: ${productDescription}

Provide a detailed analysis (5-10 pages worth) covering:

# Company Analysis: ${companyName}

## 1. Company Overview
- Business model analysis
- Core value proposition
- Unique selling points
- Company positioning

## 2. Product/Service Analysis
- Feature breakdown
- Benefits analysis
- Quality assessment
- Pricing strategy (if available)

## 3. Brand Analysis
- Brand identity and personality
- Visual identity assessment
- Brand messaging
- Brand positioning in market

## 4. Digital Presence
- Website analysis (user experience, design, messaging)
- Content strategy
- Social media presence (if visible)
- SEO positioning

## 5. Current Market Position
- Market segment served
- Geographic reach
- Market share indicators
- Growth indicators

Provide specific, detailed insights with examples where possible.`
    }
  ];

  return await callLovableAI(apiKey, messages);
}

async function analyzeCompetitors(
  apiKey: string,
  competitorLinks: string[],
  companyName: string
) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert competitive intelligence analyst. 
      Provide thorough, objective competitive analysis with actionable insights.`
    },
    {
      role: 'user',
      content: `Conduct a comprehensive competitive analysis for ${companyName} against these competitors:

${competitorLinks.map((link, i) => `Competitor ${i + 1}: ${link}`).join('\n')}

Provide detailed analysis (10-15 pages worth) covering:

# Competitive Analysis

## Executive Summary
- Key competitive insights
- Main competitive advantages to leverage
- Primary competitive threats

${competitorLinks.map((link, i) => `
## Competitor ${i + 1}: ${link}

### Overview
- Company background
- Business model
- Target market

### Product/Service Analysis
- Core offerings
- Features and capabilities
- Pricing strategy
- Unique selling points

### Market Position
- Market share
- Brand strength
- Customer base
- Geographic reach

### Marketing Strategy
- Marketing channels
- Content strategy
- Messaging themes
- Brand positioning

### Strengths
- Key competitive advantages
- What they do exceptionally well
- Market opportunities they're capturing

### Weaknesses
- Gaps in their offering
- Areas where they fall short
- Potential vulnerabilities

### Online Presence
- Website quality and UX
- SEO positioning
- Social media engagement
- Content marketing effectiveness
`).join('\n')}

## Competitive Comparison Matrix
Create a detailed comparison showing:
- Feature comparison
- Pricing comparison
- Market positioning
- Target audience overlap
- Marketing approach differences

## Key Competitive Insights
- Market gaps and opportunities
- Competitive advantages for ${companyName}
- Threats to watch
- Strategic recommendations`
    }
  ];

  return await callLovableAI(apiKey, messages);
}

async function analyzeMarket(
  apiKey: string,
  companyName: string,
  productDescription: string
) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert market analyst specializing in industry trends and market dynamics.`
    },
    {
      role: 'user',
      content: `Conduct a comprehensive market segment analysis for:

Company: ${companyName}
Product/Service: ${productDescription}

Provide detailed analysis (3-5 pages worth) covering:

# Market Segment Analysis

## 1. Industry Overview
- Industry definition and scope
- Market size and value
- Historical growth trends
- Market maturity stage

## 2. Market Dynamics
- Key market drivers
- Growth catalysts
- Emerging trends
- Technology impact
- Regulatory factors

## 3. Market Segmentation
- Key market segments
- Segment sizes and growth rates
- Segment characteristics
- Most attractive segments

## 4. Market Trends
- Current trends shaping the market
- Future trend predictions
- Disruptive forces
- Innovation opportunities

## 5. Market Barriers
- Entry barriers
- Competitive barriers
- Regulatory barriers
- Technology barriers

## 6. Market Opportunities
- Underserved segments
- Emerging opportunities
- White space analysis
- Growth opportunities

Provide specific data points and examples where possible.`
    }
  ];

  return await callLovableAI(apiKey, messages);
}

async function createPsychographicProfile(
  apiKey: string,
  clientAvatarDescription: string,
  productDescription: string
) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert customer psychologist and marketing strategist specializing in deep customer avatar analysis.
      Create highly detailed, actionable psychographic profiles that can be used to train LLMs for copywriting.`
    },
    {
      role: 'user',
      content: `Create a comprehensive psychographic profile for:

Ideal Client Description: ${clientAvatarDescription}
Product/Service: ${productDescription}

Provide extremely detailed analysis (5-10 pages worth) covering:

# Ideal Customer Psychographic Profile

## 1. Demographics
- Age range
- Gender
- Income level
- Education level
- Occupation/industry
- Location/geography
- Family status
- Living situation

## 2. Psychographics

### Values and Beliefs
- Core values (what they hold dear)
- Belief systems
- Political leanings (if relevant)
- Social causes they support
- Life philosophy

### Personality Traits
- Key personality characteristics
- Myers-Briggs type (estimated)
- Introvert vs extrovert
- Risk tolerance
- Decision-making style
- Communication style

### Lifestyle
- Daily routines
- Hobbies and interests
- Social activities
- Media consumption habits
- Shopping preferences
- Technology usage

### Attitudes
- Toward innovation and change
- Toward brands and loyalty
- Toward spending and saving
- Toward quality vs price
- Toward sustainability

## 3. Pain Points and Challenges

### Primary Pain Points
- Biggest frustrations
- Daily challenges
- Long-term concerns
- Emotional pain points
- Practical obstacles

### Impact of Pain Points
- How these affect their life
- Emotional toll
- Financial impact
- Time impact
- Relationship impact

## 4. Goals and Aspirations

### Short-term Goals (0-6 months)
- Immediate objectives
- Quick wins they seek

### Medium-term Goals (6-24 months)
- What they're working toward
- Skills they want to develop

### Long-term Goals (2+ years)
- Ultimate aspirations
- Dream outcomes
- Legacy goals

### Emotional Desires
- How they want to feel
- Identity they want to embody
- Status they seek
- Recognition they crave

## 5. Buying Behavior

### Research Process
- Where they research solutions
- Information sources they trust
- How long they research
- Decision criteria

### Purchase Triggers
- What motivates them to buy
- Urgency factors
- Emotional triggers
- Logical triggers

### Objections and Barriers
- Common hesitations
- Price sensitivity
- Risk concerns
- Trust factors needed

### Preferred Buying Journey
- How they like to be sold to
- Preferred communication channels
- Decision timeline
- Support needed

## 6. Communication Preferences

### Language and Tone
- Vocabulary they use
- Tone that resonates
- Formality level
- Humor style

### Content Preferences
- Content formats they consume
- Topics of interest
- Information depth preferred
- Media types (video, text, audio)

### Channels
- Social media platforms they use
- Email engagement
- Community participation
- Event attendance

## 7. Influences and Trust

### Trusted Sources
- Who they listen to
- Influencers they follow
- Communities they belong to
- Publications they read

### Social Proof
- Types of testimonials that work
- Authority figures that matter
- Certifications that impress
- Awards that influence

## 8. Objections to Overcome
- Specific doubts they have
- Skepticism factors
- Competitive alternatives
- Status quo bias

## 9. Messaging That Resonates
- Key messaging themes
- Emotional appeals that work
- Rational arguments that convince
- Stories that connect
- Metaphors that land

## 10. Copy Training Instructions
Provide specific guidance for training an LLM to write compelling copy for this avatar:
- Tone of voice to use
- Sentence structure preferences
- Emotional vs rational balance
- Specificity level needed
- Call-to-action styles that work
- Words and phrases to use
- Words and phrases to avoid

Make this profile so detailed that an AI could use it to write compelling, targeted copy without any additional context.`
    }
  ];

  return await callLovableAI(apiKey, messages);
}

async function generateRecommendations(
  apiKey: string,
  companyAnalysis: string,
  competitorAnalysis: string,
  marketAnalysis: string,
  psychographicProfile: string
) {
  const messages = [
    {
      role: 'system',
      content: `You are a strategic marketing consultant providing actionable recommendations based on comprehensive research.`
    },
    {
      role: 'user',
      content: `Based on the following research, provide strategic recommendations:

COMPANY ANALYSIS:
${companyAnalysis.substring(0, 2000)}...

COMPETITIVE ANALYSIS:
${competitorAnalysis.substring(0, 2000)}...

MARKET ANALYSIS:
${marketAnalysis.substring(0, 2000)}...

PSYCHOGRAPHIC PROFILE:
${psychographicProfile.substring(0, 2000)}...

Provide detailed strategic recommendations (3-5 pages worth) covering:

# Strategic Recommendations

## 1. Market Positioning Strategy
- Recommended positioning in market
- Differentiation strategy
- Competitive advantages to emphasize
- Market gaps to exploit

## 2. Messaging Strategy

### Core Message
- Primary value proposition
- Key messaging pillars
- Brand story elements
- Unique angle

### Messaging by Audience Segment
- How to speak to different segments
- Pain points to address
- Benefits to emphasize
- Proof points to include

### Messaging Hierarchy
- Primary message
- Secondary messages
- Supporting messages

## 3. Content Strategy

### Content Themes
- Core content topics
- Content pillars
- Thought leadership opportunities

### Content Formats
- Recommended content types
- Format priorities
- Distribution strategy

### Content Calendar Recommendations
- Frequency suggestions
- Seasonal considerations
- Campaign ideas

## 4. Channel Strategy

### Priority Channels
- Where to focus efforts
- Channel-specific strategies
- Budget allocation recommendations

### Channel Tactics
- Specific tactics for each channel
- Integration opportunities
- Testing recommendations

## 5. Customer Journey Optimization

### Awareness Stage
- How to attract attention
- Content for discovery
- Channels for reach

### Consideration Stage
- How to build interest
- Content for evaluation
- Proof points to showcase

### Decision Stage
- How to drive conversion
- Offers that work
- Friction reduction

### Retention Stage
- How to maintain engagement
- Content for customers
- Loyalty strategies

## 6. Quick Wins
- Immediate opportunities
- Low-hanging fruit
- Fast-impact changes

## 7. Long-term Initiatives
- Strategic projects
- Capability building
- Market development

## 8. Success Metrics
- KPIs to track
- Success benchmarks
- Measurement framework

Provide specific, actionable recommendations that can be implemented immediately.`
    }
  ];

  return await callLovableAI(apiKey, messages);
}

function compileReport(data: any) {
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `# Market Research Report: ${data.companyName}

**Generated:** ${date}

---

## Executive Summary

This comprehensive market research report provides an in-depth analysis of ${data.companyName}, its competitive landscape, market opportunities, and ideal customer profile. This report is designed to serve as foundational training material for AI copywriting systems and marketing strategy development.

**Company:** ${data.companyName}
**Website:** ${data.companyWebsite}
**Product/Service:** ${data.productDescription}

**Competitors Analyzed:**
${data.competitorLinks.map((link: string, i: number) => `${i + 1}. ${link}`).join('\n')}

**Target Avatar:** ${data.clientAvatarDescription}

---

${data.companyAnalysis}

---

${data.competitorAnalysis}

---

${data.marketAnalysis}

---

${data.psychographicProfile}

---

${data.recommendations}

---

## Appendix

### Report Metadata
- **Report ID:** Generated for ${data.companyName}
- **Generation Date:** ${date}
- **Research Scope:** Company, competitive, market, and psychographic analysis
- **Analysis Depth:** Comprehensive (20-40 pages)
- **Primary Use Case:** LLM training and strategic copywriting

### How to Use This Report

This report is designed to be used as:

1. **LLM Training Material**: Feed this entire report to your language model to train it on your market, audience, and messaging strategy.

2. **Copy Strategy Foundation**: Use the psychographic profile and messaging recommendations as the basis for all marketing copy.

3. **Competitive Intelligence**: Reference the competitive analysis when developing differentiation strategies.

4. **Content Planning**: Use the recommended content themes and topics for editorial calendars.

5. **Strategic Planning**: Apply the strategic recommendations to guide marketing and positioning decisions.

### Next Steps

1. Review the psychographic profile and ensure it aligns with your target audience observations
2. Implement the "Quick Wins" from the Strategic Recommendations section
3. Use this report to brief your team, agencies, and AI copywriting tools
4. Update your brand messaging guidelines based on the recommendations
5. Develop a measurement framework using the suggested KPIs

---

*This report was generated using advanced AI analysis. While comprehensive, it should be supplemented with direct customer research and real-world testing.*`;
}