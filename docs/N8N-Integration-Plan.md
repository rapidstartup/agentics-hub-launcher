# Project Plan: n8n Workflow Integration and Native Agent Migration

This document outlines the plan for integrating existing n8n workflows into the Agentix platform and subsequently migrating them to native Mastra agents.

## Stage 1: n8n Workflow Integration

The initial stage focuses on integrating the existing n8n workflows into the Agentix platform. This will provide immediate value to users by making the powerful automation capabilities of these workflows accessible from within the Agentix UI.

### Integration Strategy

The core of the integration strategy is to make the n8n workflows available as "actions" or "agents" within the relevant departments of the Agentix platform. This will be achieved by:

1.  **Creating a centralized API endpoint** to trigger n8n workflows. This endpoint will receive the workflow ID and any necessary parameters from the Agentix frontend.
2.  **Developing a generic UI component** in the Agentix platform to trigger the n8n workflows. This component will be responsible for collecting user input (e.g., form fields, URLs) and sending it to the n8n trigger endpoint.
3.  **Establishing a mechanism to receive and display the output** from the n8n workflows. This will likely involve a combination of webhooks and a dedicated "results" view in the Agentix platform.

### Agent Integration Details

The following table maps the existing n8n workflows to the relevant departments in the Agentix platform and outlines the integration plan for each.

| Department | n8n Workflow | Integration Point | Input Method | Output Method |
| :--- | :--- | :--- | :--- | :--- |
| **Marketing** | Deep Research Scraping Tool | "Market Research" Page | Manual form with fields for company name, website, competitors, product description, and client avatar. | Display the generated 20-40 page analysis in a dedicated "Research Report" view. |
| **Marketing** | Facebook Ads Library Scraping | "Ad Spy" Page | Manual form for Facebook Ads Library URL, with an option for recurring scraping. | Display the scraped ads, analysis, and video scripts in a "Creative Board" or similar view. |
| **Marketing** | Ad Account Creative Iteration | "Ad Optimizer" Page | Button to trigger the analysis on the user's ad account. | Display the top-performing ad creative and the suggested iterations in a "Creative Suggestions" view. |
| **Marketing** | Landing Page Copywriter | "Marketing Agents" Page | A "CustomGPT-style" interface for ingesting information and generating landing page copy. | Display the generated copy in a text editor with options to save and export. |
| **Marketing** | Email Copywriter | "Marketing Agents" Page | A "CustomGPT-style" interface for ingesting information and generating email copy. | Display the generated copy in a text editor with options to save and export. |
| **Operations** | Meeting Notes Bot | "Operations Automation" Page | Automatically triggered when a Fathom transcript is available. | Display the meeting summary, keywords, and action items in a "Meeting Notes" view. |
| **Operations** | Email Agent | "Operations Automation" Page | Automatically triggered by incoming emails. | Display a daily email summary report in a "Daily Digest" view. Drafted email responses will be available in the user's email client. |
| **Operations** | Calendar Agent | "Operations Automation" Page | A chat-based interface for interacting with the user's calendar. | The agent will directly modify the user's calendar. Confirmation messages will be displayed in the chat interface. |
| **Strategy** | RAG Agent | "StrategyCompanyBrain" Page | Automatic vectorization of data from meetings, SOPs, and training videos. | A chat-based interface for asking questions and getting feedback from the company "brain". |
| **Operations** | LLM Swap | "System Control" Page | A dropdown selector for choosing the language model. | The chat interface will be reloaded with the selected language model. |
| **Operations** | Project Management Agent | "Operations Projects" Page | Automatically triggered when a Fathom transcript is available. | Display the proposed action items in a "Task Approval" view. Approved tasks will be created in the user's project management tool. |
| **Sales** | Setters transcript creation and grading | "Sales Call Scripts" Page | Automatically triggered when a setter call ends. | Display the transcript, summary, and grading critique in a "Call Review" view. |
| **Sales** | Setter EOD report generation | "Sales Analytics" Page | Automatically triggered at the end of each day. | Display the EOD report in a "Team Performance" dashboard. |
| **Sales** | Sales rep transcript creation and grading | "Sales Call Scripts" Page | Automatically triggered when a closer call ends. | Display the transcript, summary, and grading critique in a "Call Review" view. |
| **Sales** | Closer EOD report generation | "Sales Analytics" Page | Automatically triggered at the end of each day. | Display the EOD report in a "Team Performance" dashboard. |
| **Sales** | Sales team reporting | "Sales Projects" Page | Manual form for closers to enter their daily sales data. | Display the sales data in a "Sales Dashboard". |
| **Sales** | Setter team reporting | "Sales Projects" Page | Manual form for setters to enter their daily data. | Display the setter data in a "Sales Dashboard". |
| **Sales** | Case Studies GPT | "Sales Agents" Page | A chat-based interface for searching and retrieving case studies. | Display the relevant case studies in the chat interface. |
| **Sales** | Follow up emails and text agent | "Sales Pipeline" Page | Automatically triggered when a sales call doesn't result in a close. | Display the suggested follow-up emails and text messages in a "Follow-up Suggestions" view. |

## Stage 2: Native Agent Migration

The second stage of the project will focus on migrating the n8n workflows to native Mastra agents. This will provide a number of benefits, including:

*   **Improved performance and reliability:** Native agents will be more tightly integrated with the Agentix platform, resulting in faster execution times and improved reliability.
*   **Greater flexibility and control:** Native agents will be easier to customize and extend, allowing for more complex and sophisticated automation workflows.
*   **Reduced reliance on third-party services:** Migrating to native agents will reduce the platform's reliance on n8n, resulting in lower costs and a more streamlined architecture.

### Migration Strategy

The migration will be performed on a workflow-by-workflow basis, starting with the most critical and frequently used workflows. The migration process for each workflow will involve the following steps:

1.  **Analyze the existing n8n workflow** to understand its logic and functionality.
2.  **Re-implement the workflow as a Mastra agent** using the Mastra SDK.
3.  **Use Composio to handle authentication and integration** with any third-party services (e.g., Google Drive, Airtable, Facebook Ads).
4.  **Test the new Mastra agent** to ensure that it is functionally equivalent to the original n8n workflow.
5.  **Deploy the new Mastra agent** to the Agentix platform and update the UI to use the new agent instead of the n8n workflow.

By following this two-stage approach, we can quickly deliver value to users by integrating the existing n8n workflows, while also laying the groundwork for a more powerful and flexible platform with native Mastra agents.
