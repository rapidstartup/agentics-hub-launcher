// agentix/src/mastra/agents/email-copywriter-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Email Copywriter agent
interface EmailCopywriterInputs {
  topic: string;
  targetAudience: string;
  tone: "formal" | "casual" | "persuasive" | "informative";
}

// Define the output for the Email Copywriter agent
interface EmailCopywriterOutput {
  emailCopy: {
    subject: string;
    body: string;
  };
}

// Define the tools that the agent will use (initially, these will be placeholders)
const generateEmailCopyTool: Tool<EmailCopywriterInputs, EmailCopywriterOutput['emailCopy']> = {
  name: "generateEmailCopy",
  description: "Generates high-converting email copy.",
  execute: async (inputs: EmailCopywriterInputs) => {
    // In a real implementation, this would use a powerful LLM to generate the copy
    console.log("Generating email copy...");
    return {
      subject: `Important Information about ${inputs.topic}`,
      body: `Dear ${inputs.targetAudience},

This email is to inform you about ${inputs.topic}...`,
    };
  },
};

// Create the Email Copywriter agent
export const emailCopywriterAgent: Agent<EmailCopywriterInputs, EmailCopywriterOutput> = {
  name: "Email Copywriter",
  description: "A tool that can guide anyone through creating high-converting email copy for broadcasts or automations.",
  tools: [generateEmailCopyTool],
  execute: async (inputs: EmailCopywriterInputs) => {
    console.log("Executing Email Copywriter agent...");

    // 1. Generate the email copy
    const emailCopy = await generateEmailCopyTool.execute(inputs);

    return { emailCopy };
  },
};
