// agentix/src/mastra/agents/project-management-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Project Management Agent
interface ProjectManagementAgentInputs {
  transcript: string;
}

// Define the output for the Project Management Agent
interface ProjectManagementAgentOutput {
  proposedTasks: {
    taskName: string;
    description: string;
    assignedUser?: string;
    dueDate?: string;
  }[];
}

// Define the tools that the agent will use (initially, these will be placeholders)
const extractActionItemsTool: Tool<string, ProjectManagementAgentOutput['proposedTasks']> = {
  name: "extractActionItems",
  description: "Reads and analyzes a transcript to pull out all relevant action items.",
  execute: async (transcript: string) => {
    // In a real implementation, this would use an LLM to extract action items
    console.log("Extracting action items from transcript...");
    return [
      {
        taskName: "Finalize Q4 roadmap",
        description: "Based on the discussion in the meeting, finalize the Q4 roadmap.",
        assignedUser: "John Doe",
        dueDate: "tomorrow",
      },
    ];
  },
};

// Create the Project Management Agent
export const projectManagementAgent: Agent<ProjectManagementAgentInputs, ProjectManagementAgentOutput> = {
  name: "Project Management Agent",
  description: "Reads and analyzes every transcript and pulls out all relevant action items that could need to be projectized.",
  tools: [extractActionItemsTool],
  execute: async (inputs: ProjectManagementAgentInputs) => {
    console.log("Executing Project Management Agent...");

    // 1. Extract action items from the transcript
    const proposedTasks = await extractActionItemsTool.execute(inputs.transcript);

    return { proposedTasks };
  },
};
