# Marketing Analysis Tool - Product Requirements & Implementation Status

## Implementation Status Overview

**Last Updated:** October 25, 2025  
**Overall Status:** 🟢 **Complete** (100%)

### Features Status

#### ✅ 4.1. Company Information Lookup
- **Status:** COMPLETE
- **Implementation:**
  - Search icon with 3-character activation threshold ✅
  - BusinessSearchModal with Google Maps autocomplete ✅
  - Edge function `search-business` connected to RapidAPI ✅
  - Multiple results handling with selection modal ✅
  - No results handling with user feedback ✅
  - BusinessDetailsDisplay component for selected business info ✅
  - Social media, phone, email, address display ✅

#### ✅ 4.2. Website Analysis (Competitors & Product/Service)
- **Status:** COMPLETE (Fixed with Gemini Search)
- **Implementation:**
  - Sparkles/Mine icon with valid URL detection ✅
  - Edge function `scrape-website-details` using Gemini with search grounding ✅
  - Progress toasts during operation ✅
  - Product description extraction ✅
  - **FIXED:** Now uses Gemini's search tool to find real competitor websites ✅
  - Competitors are properly identified through AI-powered web search ✅

#### ✅ 4.3. Competitor Analysis (Ideal Client Avatar)
- **Status:** COMPLETE (Enhanced with Gemini Synthesis)
- **Implementation:**
  - Star icon on each competitor URL field ✅
  - Progress toasts during analysis operation ✅
  - Edge function `scrape-competitor-avatar` using Gemini with search ✅
  - Synthesizes competitor insights with company product description ✅
  - Focuses on creating ideal client avatar for YOUR company (not competitor) ✅
  - Replaces/updates entire avatar description with comprehensive profile ✅
  - Loading states and error handling ✅

#### ✅ 4.4. Generate Market Analysis Report
- **Status:** COMPLETE
- **Implementation:**
  - Form validation for required fields ✅
  - Edge function `market-research` with Google Gemini ✅
  - Database table `market_research_reports` ✅
  - Report generation with structured Markdown output ✅
  - ResearchReportViewer component ✅
  - Markdown rendering with proper styling ✅
  - PDF download functionality (jsPDF + html2canvas) ✅
  - Markdown file download ✅
  - Real-time status updates during generation ✅

### Technical Implementation

#### ✅ Environment Variables
- `GOOGLE_MAPS_API_KEY` - Configured ✅
- `RAPIDAPI_KEY` - Configured ✅
- `FIRECRAWL_API_KEY` - Configured ✅
- `GEMINI_API_KEY` - Configured ✅

#### ✅ Edge Functions
- `search-business` - Deployed ✅
- `scrape-website-details` - Deployed ✅
- `scrape-competitor-avatar` - Deployed ✅
- `market-research` - Deployed ✅

#### ✅ Database Schema
- Table `market_research_reports` created with proper RLS policies ✅
- Columns: id, user_id, company_name, company_website, competitor_links (JSONB), product_description, client_avatar_description, status, report_content, created_at, updated_at ✅

### Known Issues & Pending Fixes

1. **✅ RESOLVED - Competitor URL Extraction**
   - ~~Firecrawl was returning internal links instead of actual competitors~~
   - **Fixed:** Now using Gemini with search grounding to intelligently find real competitor websites
   - Works by researching the industry and identifying established competitors

2. **✅ COMPLETE - Modal Auto-close**
   - Business search modal auto-closes on "not found" after 2 seconds ✅

### Design System Implementation
- Form uses semantic design tokens ✅
- Animated icons (Search, Sparkles, Star) with scale-in and pulse effects ✅
- Hover states with accent colors ✅
- Progress indicators with toast notifications ✅
- Responsive layout ✅

---

## Product Requirements Document: AI-Assisted Market Research Tool

**Version:** 1.0  
**Date:** October 26, 2023  
**Author:** [Your Name/Team]  
**Status:** Production Implementation

### 1. Overview

This document outlines the functional and technical requirements for enhancing the "Market Research Tool" with AI-powered assistance features. The goal is to reduce the manual effort required from users to fill out the market research form by integrating three external APIs: Local Business Data (via RapidAPI), Firecrawl, and Google Gemini. This will allow users to generate comprehensive inputs by providing minimal information, such as a company name or website, leading to a more streamlined workflow and higher quality data for the final report generation.

### 2. Problem Statement & Goals

**Problem:** Users find it time-consuming and difficult to gather and synthesize key business details, competitor information, and ideal client profiles. This friction can lead to incomplete forms or low-quality inputs, resulting in a less valuable final market research report.

**Goals:**
*   **Reduce User Effort:** Automate the population of form fields using AI and data extraction tools.
*   **Improve Data Quality:** Pull accurate, real-world data directly from business listings and websites.
*   **Increase User Engagement:** Provide a "magical" experience that encourages users to complete the process.
*   **Deliver High-Value Output:** Use the high-quality, AI-gathered inputs to generate a superior, comprehensive market analysis report with Gemini.

### 3. User Stories

*   **As a user, I want to** enter my business name and location **so that** the tool can automatically find and populate my business details (website, etc.) to save me time.
*   **As a user, I want to** provide my company website **so that** the tool can automatically analyze it to identify my top competitors and describe my product/service.
*   **As a user, I want to** analyze my competitors' websites with a single click **so that** the tool can help me build a detailed description of my ideal client avatar based on their positioning.
*   **As a user, I want to** use all the gathered information to generate a comprehensive market research report **so that** I can get strategic insights without writing the report myself.
*   **As a user, I want to** be able to preview, download as a PDF, and download as a Markdown file the final report **so that** I can use it in a format that suits my needs.

### 4. Functional Requirements

The user interface will be the existing form, enhanced with new interactive icons and modals.

#### 4.1. Feature: Company Information Lookup

1.  **UI Element:** A **"Search" icon** will be placed at the end of the `Company Name` input field. It is disabled by default and becomes active once the user types at least 3 characters.
2.  **User Action:** User clicks the "Search" icon.
3.  **Workflow:**
    *   A modal appears with a single input field labeled "Enter your business location (e.g., San Francisco, CA)".
    *   This input field will use the **Google Maps Places Autocomplete API** to suggest locations.
    *   Upon selecting a location, the frontend captures the place details (specifically the latitude and longitude).
    *   A Supabase Edge Function (`search-business`) is invoked with the `company name` and the `lat/lng` coordinates.
4.  **Backend (Edge Function: `search-business`):**
    *   Receives `query` (company name) and `lat`, `lng`.
    *   Makes a GET request to the **Local Business Data RapidAPI endpoint**.
    *   **API Call:**
        ```
        GET https://local-business-data.p.rapidapi.com/search
        Params: { query: `${query} in ${location_string}`, lat: lat, lng: lng, limit: 3, ... }
        Headers: { 'x-rapidapi-host': '...', 'x-rapidapi-key': process.env.RAPIDAPI_KEY }
        ```
5.  **Response Handling:**
    *   **Multiple Results:** If the API returns 1-3 results, a modal displays the business name and address of each. The user clicks one to select it.
    *   **Zero Results:** The modal displays a message "No businesses found. Please try a different name or location."
    *   **On Selection:** The modal closes. The application populates the UI with the selected business's data:
        *   `Company Website *`: Populated with the `website` URL.
        *   Below the website field, a new non-editable section appears with icons and available data:
            *   **Phone Icon:** Displays `phone_number`.
            *   **Email Icon:** Displays `email`.
            *   **Address Icon:** Displays full `address` on hover.
            *   **Social Media Icons (e.g., Facebook, Twitter):** Display links if present in the API response.

#### 4.2. Feature: Website Analysis (Competitors & Product/Service)

1.  **UI Element:** A **"Mine" icon (magic wand or pickaxe)** appears at the end of the `Company Website` field when it contains a valid URL.
2.  **User Action:** User clicks the "Mine" icon.
3.  **Workflow:**
    *   The icon shows a loading spinner.
    *   A Supabase Edge Function (`scrape-website-details`) is invoked with the `company_website` URL.
4.  **Backend (Edge Function: `scrape-website-details`):**
    *   Receives `url`.
    *   Makes a POST request to the **Firecrawl API**.
    *   **API Call (Optimized to get both Competitors and Description):**
        ```json
        POST https://api.firecrawl.dev/v1/extract
        Headers: { 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' }
        Body: {
          "urls": [`${url}/*`],
          "prompt": "From all pages, identify and list the top 3 competitors. Also, provide a detailed product or service description of at least 50 characters, explaining what problems it solves and what makes it unique.",
          "schema": {
            "type": "object",
            "properties": {
              "competitors": {
                "type": "array",
                "items": { "type": "string" }
              },
              "product_service_description": {
                "type": "string"
              }
            },
            "required": ["competitors", "product_service_description"]
          },
          "enableWebSearch": true
        }
        ```
5.  **Response Handling:**
    *   On success, the frontend parses the JSON response.
    *   The `Top 3 Competitor Websites` fields are populated with the URLs from the `competitors` array.
    *   The `Product/Service Description` textarea is populated with the `product_service_description` string.

#### 4.3. Feature: Competitor Analysis (Ideal Client Avatar)

1.  **UI Element:** A **"Stars" icon (or telescope icon)** appears at the end of each of the three `Competitor Website` fields when they contain a valid URL.
2.  **User Action:** User clicks the "Stars" icon for a specific competitor.
3.  **Workflow:**
    *   The icon shows a loading spinner.
    *   A Supabase Edge Function (`scrape-competitor-avatar`) is invoked with the competitor's URL.
4.  **Backend (Edge Function: `scrape-competitor-avatar`):**
    *   Receives `url`.
    *   Makes a POST request to the **Firecrawl API**.
    *   **API Call:**
        ```json
        POST https://api.firecrawl.dev/v1/extract
        Headers: { 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' }
        Body: {
          "urls": [`${url}/*`],
          "prompt": "Based on the content of all pages (case studies, testimonials, pricing, services), extract a detailed 'Ideal Client Avatar Description'. Describe who they are, what they care about, and what their pain points are. The description must be a minimum of 50 characters.",
          "schema": {
            "type": "object",
            "properties": {
              "ideal_client_avatar": { "type": "string" }
            },
            "required": ["ideal_client_avatar"]
          }
        }
        ```
5.  **Response Handling:**
    *   On success, the frontend retrieves the `ideal_client_avatar` string.
    *   This string is **appended** to the existing content of the `Ideal Client Avatar Description` textarea. If the textarea is not empty, a separator (`\n\n---\n\n`) should be added before the new content to delineate insights from different competitors.

#### 4.4. Feature: Generate Market Analysis Report

1.  **UI Element:** A button at the bottom of the form labeled **"Generate Market Analysis"**.
2.  **User Action:** User clicks the button.
3.  **Workflow:**
    *   **Validation:** The frontend first validates that all required fields (`*`) are filled and meet the minimum character counts. If not, an error is shown.
    *   The button enters a loading state (e.g., "Generating...").
    *   A Supabase Edge Function (`generate-report`) is invoked with all the form data as a JSON object.
4.  **Backend (Edge Function: `generate-report`):**
    *   Receives all form inputs.
    *   Constructs a detailed prompt for the **Google Gemini 2.0 Flash model**.
    *   **Master Prompt for Gemini:**
        ```text
        You are an expert market research analyst. Your task is to generate a comprehensive 20-40 page market research report based on the following data. The report should be structured, insightful, and professional. The output format MUST be in well-structured Markdown.

        **Input Data:**
        - Company Name: ${companyName}
        - Company Website: ${companyWebsite}
        - Product/Service Description: ${productServiceDescription}
        - Top 3 Competitors: 
          1. ${competitor1}
          2. ${competitor2}
          3. ${competitor3}
        - Ideal Client Avatar / Target Audience Profile: ${idealClientAvatarDescription}

        **Report Structure:**
        Generate the report using the following Markdown structure. Be thorough and elaborate on each section.

        # Market Research Report: ${companyName}

        ## 1. Executive Summary
        (A high-level overview of the market, key findings, and strategic recommendations.)

        ## 2. Company & Product Overview
        ### 2.1. Company Profile: ${companyName}
        (Analyze the company based on its provided description.)
        ### 2.2. Product/Service Analysis
        (Deep-dive into the product description. Analyze its value proposition, problem-solving capabilities, and unique selling points.)
        ### 2.3. Initial SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
        (Based on the provided data, perform a preliminary SWOT analysis.)

        ## 3. Competitive Landscape
        (For each competitor, create a subsection. Analyze their likely strengths and weaknesses based on their domain name and the context of the user's company.)
        ### 3.1. Competitor 1: ${competitor1}
        ### 3.2. Competitor 2: ${competitor2}
        ### 3.3. Competitor 3: ${competitor3}
        ### 3.4. Competitive Positioning Map
        (Create a conceptual positioning map description, e.g., plotting competitors on a Price vs. Quality axis.)

        ## 4. Target Audience Analysis
        (Based on the 'Ideal Client Avatar Description', create a detailed profile.)
        ### 4.1. Demographic & Psychographic Profile
        ### 4.2. Pain Points & Needs
        ### 4.3. Customer Journey Map (Conceptual)

        ## 5. Market Opportunities & Strategic Recommendations
        ### 5.1. Identified Market Gaps
        ### 5.2. Marketing & Sales Strategy Recommendations
        ### 5.3. Product Development Recommendations

        ## 6. Conclusion
        (Summarize the report and reiterate the most critical strategic takeaways.)
        ```
    *   The function sends this prompt to the Gemini API and awaits the Markdown response.
    *   The generated Markdown text is returned to the frontend.
5.  **Response Handling:**
    *   The frontend displays the generated report in a new view or a large modal. This view should render the Markdown for easy preview.
    *   Above the preview, two buttons are available:
        *   **"Download as .md"**: Triggers a file download of the raw Markdown text.
        *   **"Download as PDF"**: Uses a client-side library (e.g., `jspdf`, `html2canvas`) to convert the rendered HTML of the report into a PDF for download.

### 5. Technical Specifications

#### 5.1. Environment Variables
The following environment variables must be configured in the Supabase project secrets:
*   `GOOGLE_MAPS_API_KEY`: For Places Autocomplete.
*   `RAPIDAPI_KEY`: For Local Business Data API.
*   `FIRECRAWL_API_KEY`: For Firecrawl API.
*   `GEMINI_API_KEY`: For Google Gemini 2.0 Flash model.

#### 5.2. Supabase Backend
*   **Edge Functions:**
    *   `search-business`: Handles the RapidAPI call.
    *   `scrape-website-details`: Handles the first Firecrawl call.
    *   `scrape-competitor-avatar`: Handles the second Firecrawl call.
    *   `generate-report`: Handles the Gemini API call (implemented as `market-research`).
*   **Database Schema:**
    A new table `market_research_reports` has been created to store the inputs and outputs.
    ```sql
    CREATE TABLE market_research_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        company_name TEXT,
        company_website TEXT,
        competitor_links JSONB,
        product_description TEXT,
        client_avatar_description TEXT,
        report_content TEXT,
        status TEXT DEFAULT 'pending'
    );
    ```

### 6. Non-Functional Requirements

*   **Error Handling:** All API calls have robust error handling with user-friendly error messages. ✅
*   **Loading States:** All interactive elements display loading indicators during async operations. ✅
*   **Performance:** API calls have appropriate timeouts with progress feedback. ✅

### 7. Out of Scope (For this Version)

*   User accounts and authentication (though the schema allows for it). ⚠️ Auth is implemented
*   Saving/editing past reports. ⚠️ Reports are saved to database
*   Payment processing or usage limits.
*   Team collaboration features.
