Based on the provided video context, images, and the existing architectural documentation, here is the detailed Product Requirements Document (PRD): n8n Agent Integration & UI Binding.

This PRD focuses on bridging the gap between the Agentix UI and the specific n8n webhooks provided, enabling a "Schema-Driven" approach where the frontend renders inputs dynamically based on the agent's requirements.

PRD: n8n Agent Integration & UI Binding

Version: 1.0
Date: November 25, 2025
Status: Ready for Development

1. Objective

To integrate five core n8n agent workflows into the Agentix platform by creating a standardized UI interface that collects specific user inputs (forms/chat), triggers the corresponding n8n production webhooks, and handles the output (displaying in chat, generating documents, or populating fields).

2. Agent Scope & Webhook Mapping

The following agents are to be integrated immediately. All Webhooks utilize the POST method.

Agent Name	Department	Type	Webhook URL ID (Production)
Meeting Agent	Operations	Chat/Query	d1007cb5-fe82-4e98-9905-31c9197c2597
Personal Assistant	Operations	Chat/Action	e101258b-7388-4da6-a427-82191acef0c3
Prompt Engineer	Marketing	Form → Text	a35caabc-5dd3-4f07-b36e-927b7647d691
RAG Agent	Strategy	Chat/Query	7ddce9e5-57bf-4bf4-b496-87204f235f62
Copywriter	Marketing	Form → Text	86d7a192-cc8e-4966-aa43-33d61a0d2f9f
3. Technical Architecture
3.1 Database Schema Updates (public.agent_configs)

We will utilize the existing agent_configs table but need to strictly define the input_mapping and introduce an output_behavior column to handle the different UI needs (Chat vs. Modal Result).

New/Refined Columns:

input_schema (JSONB): Defines the fields the UI must render to capture data before sending the webhook.

output_behavior (Enum/String): Defines how the result is displayed.

chat_stream: Appends response to a chat window.

modal_display: Shows result in a pop-up (good for Prompt Engineer).

field_populate: Returns data to fill a specific UI element (future use).

webhook_url (Text): Stores the specific n8n production URL.

3.2 Edge Function Update (n8n-run)

The existing n8n-run function must be robust enough to:

Accept a generic JSON payload.

Pass that payload to the specific webhook_url.

Wait for the response (Synchronous execution as marked in screenshots "Respond: Immediately").

Return the JSON response to the frontend.

4. UI Implementation Details
4.1 Component: UniversalAgentRunner

A reuseable component that renders differently based on the input_schema and output_behavior.

Logic:

If input_schema contains only "message/query" AND output_behavior is "chat_stream":

Render a Chat Interface.

User types → Sends payload { "query": "user input" }.

Response appends to chat history.

If input_schema contains multiple fields (e.g., Copywriter, Prompt Engineer):

Render a Form Modal.

Generate inputs (Text Input, Text Area, Select) based on schema keys.

"Run Agent" button triggers webhook.

Result renders in a Result View (Markdown supported text area) with a "Copy to Clipboard" or "Save" button.

5. Detailed Agent Specifications
5.1 Meeting Agent (Operations)

Goal: Query Airtable/Fathom records for specific meeting details.

Location: /client/:clientId/operations/agents

Webhook: ...31c9197c2597

UI Experience: Chat Interface.

Input Schema:

code
JSON
download
content_copy
expand_less
{
  "fields": [
    { "key": "query", "label": "Ask about a meeting", "type": "textarea", "placeholder": "Find calls with Client X last week..." }
  ]
}

Output Behavior: chat_stream (Agent returns text summary or list of links).

5.2 Personal Assistant (Operations)

Goal: Manage Calendar and Email drafts via instruction.

Location: /client/:clientId/operations/automation or Global "Concierge" Icon.

Webhook: ...82191acef0c3

UI Experience: Chat Interface.

Input Schema:

code
JSON
download
content_copy
expand_less
{
  "fields": [
    { "key": "instruction", "label": "Instruction", "type": "textarea", "placeholder": "Book a meeting with Nick for Tuesday at 2pm..." }
  ]
}

Output Behavior: chat_stream (Confirmation message: "Event booked," "Draft created").

5.3 Prompt Engineer (Marketing/System)

Goal: Refine crude ideas into high-quality LLM prompts.

Location: /client/:clientId/marketing/agents OR Tool Overlay.

Webhook: ...927b7647d691

UI Experience: Form Input → Result Display.

Input Schema:

code
JSON
download
content_copy
expand_less
{
  "fields": [
    { "key": "topic", "label": "Topic/Task", "type": "text", "required": true },
    { "key": "rough_draft", "label": "Rough Idea", "type": "textarea", "required": true, "placeholder": "I need a blog post about..." }
  ]
}

Output Behavior: modal_display (Shows the optimized prompt in a code block for easy copying).

5.4 RAG Agent (Strategy)

Goal: Query the "Company Brain" (Vectorized SOPs, Videos, Docs).

Location: /client/:clientId/strategy/company-brain

Webhook: ...87204f235f62

UI Experience: Full-page Chat Interface.

Input Schema:

code
JSON
download
content_copy
expand_less
{
  "fields": [
    { "key": "query", "label": "Question", "type": "textarea", "placeholder": "What is our SOP for refund requests?" }
  ]
}

Output Behavior: chat_stream (Returns answer with citations if available).

5.5 Copywriter Agent (Marketing)

Goal: Generate copy for Ads/Emails based on VSL/Offer context.

Location: /client/:clientId/marketing/agents

Webhook: ...33d61a0d2f9f

UI Experience: Detailed Form → Editor View.

Input Schema:

code
JSON
download
content_copy
expand_less
{
  "fields": [
    { "key": "content_type", "label": "Content Type", "type": "select", "options": ["Email", "Facebook Ad", "Landing Page"], "required": true },
    { "key": "offer_details", "label": "Offer Description", "type": "textarea", "required": true },
    { "key": "vsl_context", "label": "VSL/Context", "type": "textarea", "placeholder": "Paste transcript or key points..." },
    { "key": "avatar", "label": "Target Avatar", "type": "text" }
  ]
}

Output Behavior: modal_display (Returns the generated copy in a rich text or markdown viewer).

6. Implementation Steps
Phase 1: Database Configuration

Run a migration to add input_schema and output_behavior to agent_configs.

Insert the 5 rows for the agents above into agent_configs with the JSON schemas defined in Section 5.

Store the Webhook URLs in the webhook_url column (encrypted if treating as secret, though these are public webhook triggers, plain text is acceptable for V2 if secured by RLS).

Phase 2: Frontend "Runner"

Update src/components/agents/RunAgentDynamicModal.tsx:

Fetch the input_schema from the selected agent.

Dynamically render inputs based on the JSON.

On Submit, call supabase.functions.invoke('n8n-run', { payload }).

Create src/components/agents/AgentChatWindow.tsx:

For agents marked output_behavior: chat_stream.

Standard chat UI (User bubble right, Agent bubble left).

Handle loading states while n8n processes the webhook.

Phase 3: Integration & Testing

Test Meeting Agent: Ensure Airtable queries return valid text to the chat.

Test Prompt Engineer: Verify the output prompt is formatted correctly in the modal.

Test RAG: Verify generic knowledge base queries return answers.

7. Future Considerations (V3)

Streaming Responses: Currently, n8n webhooks wait for full completion before responding. For long-running agents (like Deep Research), we will need to implement a polling mechanism or websocket integration, as the browser HTTP request might time out.

File Uploads: The Copywriter or RAG agent might eventually need file upload inputs. This requires handling multipart form data in the n8n-run function.