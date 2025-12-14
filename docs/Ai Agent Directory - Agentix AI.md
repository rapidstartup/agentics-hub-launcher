**Agent List & Directory**

# ***Marketing:***

### **Deep Research Scraping Tool:**

**Trigger:** Manual Form is filled out providing:

Name of the company  
Company Website  
3 Top Competitor site links  
Description of product  
Description of ideal client avatar

**Function:** Does intense market and competitive research and builds a 20-40 page analysis and psychographic profile.

**Use:** Can be used as the avatar training and base information to assist in training LLM’s in order to produce compelling and actionable copy for that market segment

### **Facebook Ads Library Scraping:**

**Trigger:** Automated OR manually

*Automated:* Can set reoccurring scraping of competitors or account want for inspiration

*Manual:* Manually triggered by pulling Facebook ads library URL with filters, added to input field, and hit submit

**Function:** Will scrape and analyze all video and images from a creator, break down the ad, the video script, explain why it works, etc. and push those to a google spreadsheet.

Use \- Creates a database of high converting video ad structures for reference to create new creative. Once scraping is done it would ask you if you would like to create those ads scripts for your offer and it would reference your VSL script (Webinar, etc.) and case studies document to recreate those ads.

### **Ad Account Creative iteration:**

**Trigger:** Manual or Automated

Automated: Can set a scheduled trigger for every Sunday (or whatever day)   
**Manual:** Could click a button to run the analysis on your ad account

**Function:** Has access to Facebook graph API and Ad Generator worksheet. When run it analyzes the ad account for the best performing ad creative in the last 7 days (window may be subject to change or selection in settings or at time of manual run). 

Finds the top 3 highest performing videos and pulls the ad name (code). With the ad name it can access all of the sheets on the ad generator and understand the make up of the ad and provide a new video script or iteration to test against it.

### **Landing Page Copywriter:**

**Trigger:** Manual Tool to use

**Function:** Tool that can be used by the user and functions similarly to a customGPT.

Has an ingestion phase and a production phase that can guide anyone through creating high converting landing page copy.

### **Email Copywriter:**

**Trigger:** Manual Tool to use

**Function:** Tool that can be used but the user and functions similarly to a customGPT

Has an ingestion phase and a production phase that can guide anyone through creating high converting email copy for broadcasts or automations.

# ***Operations:***

### **Meeting Notes Bot:**

**Trigger:** Meeting is concluded and fathom transcript is finished

**Function:** Transcription is processed by LLM, Keywords are created, summary is created, transcript is added, action items are outlined, Google doc is created in folder, google doc is added to airtable spreadsheet

**Use:** Can chat with the agent for recall of any call taken and ask specific questions about the specific call.

### **Email Agent:**

**Trigger:** Email is received

**Function:** As any email comes into the inbox, it is pre sorted and added to specific labels that are pre defined by the client.

At the top of the morning you receive a report with a 1 to 2 sentence summary of every email you received including the topic and sentiment of the email.  
If the email falls in to particular label categories an email response will be drafted for you.  
If contact does not exist in contact database, contact record is created and stored for future recall.

**Use:** Email inbox organization and time saving for replying to emails. The end user just has to read drafts, make changes, and send. Eventually if the drafts are really good, we can turn it from draft to respond.

### **Calendar Agent:**

**Trigger:** Human triggered

**Function:** Allows to person to communicate with calendar and move, cancel, update, meetings etc. without having to go to the calendar and do it manually.

has access to contacts list for reference to emails for updating contacts.

###  **RAG Agent:**

**Trigger:**  Automatically or manually vectorizes data from 3 key sources (other triggers available):

Automatic:  
A.) When meeting is concluded and transcript is created

Manual:  
B.) When SOP Is added to documents folder in drive  
C.) When training video transcript is added to sheet (Update row)

**Function:** Chunks large amounts of information about and from the company creating a c company wide brain that is accessible by anyone on the time to ask questions or get feedback.

### **LLM Swap:**

**Trigger:** Manual trigger to swap between language models

**Function:**  drop down selector for language models (with description of what each is best used for) that user can select.

Would reload the inframe instance of chat screen with history for that LLM and use open router to toggle between LLMs.

**Use:** User could use all models in one place with one subscription as opposed to going to all of them separately and paying for each one.

### **Project Management Agent:**

**Trigger:** When call is concluded and fathom transcript is created

**Function:** Reads and analyzes every transcript and pulls out all relevant action items that could need to be projectized.

Organizes all action items and creates a concise task name and appropriate description of the task based on the context of the Call

Organized action item by client and organized in chronological order \- 1, 2, 3, 4, etc. ie:

Client Name 1:  
1 \<Action Item 1\> \<Proposed Assigned User\> \<Proposed list in CU\>  
2 \<Action Item 2\> \<Proposed Assigned User\> \<Proposed list in CU\>  
3 \<Action Item 3\> \<Proposed Assigned User\> \<Proposed list in CU\>

Client Name 2:  
1 \<Action Item 1\> \<Proposed Assigned User\> \<Proposed list in CU\>  
2 \<Action Item 2\> \<Proposed Assigned User\> \<Proposed list in CU\>  
3 \<Action Item 3\> \<Proposed Assigned User\> \<Proposed list in CU\>  
Each client overview will include the list of action items and which list in ClickUp it thinks it should add the task too.

It will send those lists to the user every afternoon before it creates tasks. 

I will look through and respond back with what numbers I approve and it will create the tasks.  
Would have access to the team directory with description of each persons role so they can have the highest likelihood assigning the right user. 

All task will be due for “tomorrow” so it can show quickly the next day and reschedule if needed

# ***Sales:***

### **Setters transcript creation and grading:**

**Trigger:** Automated

**Function:** When a setter call ends where the call is longer that 90 seconds the transcript is taken and a google doc is created (google doc name includes: todays date \- setter name \- lead name) that includes the transcript, a summary of the transcript, and a grading critique for the call.

**Use:** daily the setter manager has a document with the transcript, summary, and grade of every call that he can review to QC setter performance from the day before.

### **Setter EOD report generation**

**Trigger:** automated

**Function:** at the end of every day the agent reviews all of the transcripts created for the day and creates an eod report for the manager that includes a 1 to 2 sentence summary of the call with outcomes for each call organized by setter, for example:

Setter 1:  
\<lead name\> \- summary  
 \<lead name\> \- summary  
\<lead name\> \- summary

Setter 2:  
\<lead name\> \- summary  
 \<lead name\> \- summary  
\<lead name\> \- summary

Etc. 

**Use:** setter manager has an end of day report created for them every single day that does not fail and does not deviate in value or effort that they can use to QC the overall performance of the team and hone in to the calls they want to review for feedback.

### **Sales rep transcript creation and grading:**

**Trigger:** Automated

Function \- When a closer concludes a fathom call (or fireflies \- fathom api access for free accounts may be an issue) ends  the transcript is taken and a google doc is created (google doc name includes: todays date \- closer name \- lead name) that includes the transcript, a summary of the transcript, and a grading critique for the call.

**Use:** daily the sales manager has a document with the transcript, summary, and grade of every call that he can review to QC setter performance from the day before.

### **Closer EOD report generation**

**Trigger:** automated

**Function:** at the end of every day the agent reviews all of the transcripts created for the day and creates an eod report for the manager that  includes a 1 to 2 sentence summary of the call with outcomes for each call organized by setter for example:

Setter 1:  
\<lead name\> \- summary  
 \<lead name\> \- summary  
\<lead name\> \- summary

Setter 2:  
\<lead name\> \- summary  
 \<lead name\> \- summary  
\<lead name\> \- summary

Etc. 

**Use:** sales manager has an end of day report created for them every single day that does not fail and does not deviate in value or effort that they can use to QC the overall performance of the team and hone in to the calls they want to review for feedback.

### **Sales team reporting**:

**Trigger:** manually entry by closers

**Function:** each day as part of eod activities the closer completed a quick form that includes:

Schedules calls  
Live calls  
Offers   
Deposits  
Closes  
Product sold checked off  
Cash collected

(Film video for Nathan on our setter and sales tracking sheets that I’m trying to bake into software)

**Use:** it takes the complex reporting sheet we use for each one of our clients and bakes the reporting into the software.

### **Setter team reporting:**

**Trigger:** manually entry by setters

**Function:** each day as part of eod activities the setter completes a quick form that includes:

Dials  
Number of conversations  
Triages  
Sets  
Closes  
Product sold checked off  
Cash collected

(Film video for Nathan on our setter and sales tracking sheets that I’m trying to bake into software)

**Use:** it takes the complex reporting sheet we use for each one of our clients and bakes the reporting into the software.

### **Case Studies GPT**

**Trigger:** Manual use by sales team

**Function:** is a database/RAG of all social proof, testimonials, and case studies for a business or offer that the sales person can use before or while on a sales call to find relevant case studies for the individual that they’re trying to sell.

### **Follow up emails and text agent**

**Trigger:** Automatic

**Function:** When a sales person concludes a sales call or sales conversation that doesn’t result in a close, the agent would assess the call and craft 3 follow up emails and text messages the sales person can send as follow ups and would suggest the timeline in which they would do so.  
**IDEAL:** The agent would have access to the case studies database as well as the public trainings database and weave these into the follow ups to be as unique and value-centric as possible.

**Use:** Sales would review these as part of their EOD and setup future messages from the system or tasks to follow up with their prospects.

# ***Content Creation:***

# ***Lead Gen:***

Thoughts:

In settings have some way to upload VSL scripts and call to action options and descriptions so the other 

tools can reference them and ask “which VSL is this for? What CTA do you want to use?”

Would want to 

Would need super user level for each user with web hook for each individual tool

Settings level where they can:

Add a VSL (Webinar)

Add an offer

Etc.

Agents (Manual Copywriting Agents for example) would do an ingestion before production to help select assets to create materials

**Nick van Driel’s Insights:**

N8N:

- We can use **1 n8n account** to run everything in the back, no need for clients to have their own accounts on everything  
- The PRO plan with 50,000 workflow executions should at least cover us for 50-100 clients (should give you better guidelines after 10 clients to discover usage)  
- The thing YOU read in the terms of service, was you can’t resell N8N (or a variation of that) and then give clients access to it (they don’t want where you resel 197 a month n8n accounts and give 100 clients access to that same account)

This all is a good thing, since we’re using N8N as the backend execution platform, but everything from a front end UI is being done through the Agentix tool

while also protect your IP to clients, they just use Agentix as their Business Operating System

**AgentixOS**  
**V1: Framework, Agency Pulse, “Walk the floor”, Agent coordination conception (with N8N)**

**V2: OS, implementation with Agent coordination in-house (migrate away from N8N)**

**V3: Enterprise, towards autonomous Agency and 3rd party users, Whitelable and API, standalone portable team members and departments.**