// agentix/src/mastra/agents/setter-transcript-grader-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Setters transcript creation and grading agent
interface SetterTranscriptGraderInputs {
  transcript: string;
  setterName: string;
  leadName: string;
}

// Define the output for the Setters transcript creation and grading agent
interface SetterTranscriptGraderOutput {
  summary: string;
  grade: "A" | "B" | "C" | "D" | "F";
  critique: string;
}

// Define the tools that the agent will use (initially, these will be placeholders)
const gradeTranscriptTool: Tool<SetterTranscriptGraderInputs, SetterTranscriptGraderOutput> = {
  name: "gradeTranscript",
  description: "Grades a setter's call transcript and provides a summary and critique.",
  execute: async (inputs: SetterTranscriptGraderInputs) => {
    // In a real implementation, this would use an LLM to grade the transcript
    console.log("Grading transcript...");
    return {
      summary: `A call between ${inputs.setterName} and ${inputs.leadName} about the product.`,
      grade: "B",
      critique: "The setter did a good job of building rapport, but could have been more direct in asking for the sale.",
    };
  },
};

// Create the Setters transcript creation and grading agent
export const setterTranscriptGraderAgent: Agent<SetterTranscriptGraderInputs, SetterTranscriptGraderOutput> = {
  name: "Setter Transcript Grader",
  description: "Creates a summary, grade, and critique for a setter's call transcript.",
  tools: [gradeTranscriptTool],
  execute: async (inputs: SetterTranscriptGraderInputs) => {
    console.log("Executing Setter Transcript Grader agent...");

    // 1. Grade the transcript
    const output = await gradeTranscriptTool.execute(inputs);

    return output;
  },
};
