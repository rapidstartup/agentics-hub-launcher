// agentix/src/mastra/agents/follow-up-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Follow up emails and text agent
interface FollowUpAgentInputs {
  transcript: string;
}

// Define the output for the Follow up emails and text agent
interface FollowUpAgentOutput {
  followUps: {
    type: "email" | "text";
    content: string;
    suggestedSendTime: string;
  }[];
}

// Define the tools that the agent will use (initially, these will be placeholders)
const generateFollowUpsTool: Tool<string, FollowUpAgentOutput['followUps']> = {
  name: "generateFollowUps",
  description: "Generates follow-up emails and text messages based on a sales call transcript.",
  execute: async (transcript: string) => {
    // In a real implementation, this would use an LLM to analyze the transcript and generate follow-ups
    console.log("Generating follow-ups...");
    return [
      {
        type: "email",
        content: "Hi [Lead Name],\n\nIt was great speaking with you earlier. Here's that case study I mentioned...",
        suggestedSendTime: "tomorrow at 10am",
      },
      {
        type: "text",
        content: "Hey [Lead Name], just wanted to follow up on our conversation. Let me know if you have any questions.",
        suggestedSendTime: "in 3 days",
      },
    ];
  },
};

// Create the Follow up emails and text agent
export const followUpAgent: Agent<FollowUpAgentInputs, FollowUpAgentOutput> = {
  name: "Follow-up Agent",
  description: "Assesses a sales call and crafts follow-up emails and text messages.",
  tools: [generateFollowUpsTool],
  execute: async (inputs: FollowUpAgentInputs) => {
    console.log("Executing Follow-up Agent...");

    // 1. Generate follow-ups
    const followUps = await generateFollowUpsTool.execute(inputs.transcript);

    return { followUps };
  },
};
