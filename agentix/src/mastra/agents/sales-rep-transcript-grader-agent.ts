// agentix/src/mastra/agents/sales-rep-transcript-grader-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Sales rep transcript creation and grading agent
interface SalesRepTranscriptGraderInputs {
  transcript: string;
  salesRepName: string;
  leadName: string;
}

// Define the output for the Sales rep transcript creation and grading agent
interface SalesRepTranscriptGraderOutput {
  summary: string;
  grade: "A" | "B" | "C" | "D" | "F";
  critique: string;
}

// Define the tools that the agent will use (initially, these will be placeholders)
const gradeSalesRepTranscriptTool: Tool<SalesRepTranscriptGraderInputs, SalesRepTranscriptGraderOutput> = {
  name: "gradeSalesRepTranscript",
  description: "Grades a sales rep's call transcript and provides a summary and critique.",
  execute: async (inputs: SalesRepTranscriptGraderInputs) => {
    // In a real implementation, this would use an LLM to grade the transcript
    console.log("Grading sales rep transcript...");
    return {
      summary: `A sales call between ${inputs.salesRepName} and ${inputs.leadName}.`,
      grade: "A",
      critique: "The sales rep did an excellent job of closing the sale.",
    };
  },
};

// Create the Sales rep transcript creation and grading agent
export const salesRepTranscriptGraderAgent: Agent<SalesRepTranscriptGraderInputs, SalesRepTranscriptGraderOutput> = {
  name: "Sales Rep Transcript Grader",
  description: "Creates a summary, grade, and critique for a sales rep's call transcript.",
  tools: [gradeSalesRepTranscriptTool],
  execute: async (inputs: SalesRepTranscriptGraderInputs) => {
    console.log("Executing Sales Rep Transcript Grader agent...");

    // 1. Grade the transcript
    const output = await gradeSalesRepTranscriptTool.execute(inputs);

    return output;
  },
};
