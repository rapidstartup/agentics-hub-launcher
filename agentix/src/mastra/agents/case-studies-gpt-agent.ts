// agentix/src/mastra/agents/case-studies-gpt-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Case Studies GPT agent
interface CaseStudiesGPTInputs {
  query: string;
}

// Define the output for the Case Studies GPT agent
interface CaseStudiesGPTOutput {
  caseStudies: {
    title: string;
    summary: string;
  }[];
}

// Define the tools that the agent will use (initially, these will be placeholders)
const searchCaseStudiesTool: Tool<string, CaseStudiesGPTOutput['caseStudies']> = {
  name: "searchCaseStudies",
  description: "Searches a database of case studies for relevant results.",
  execute: async (query: string) => {
    // In a real implementation, this would use a RAG setup to search a vector database of case studies
    console.log(`Searching for case studies related to "${query}"...`);
    return [
      {
        title: "Acme Inc. Success Story",
        summary: "How Acme Inc. increased their sales by 50% using our product.",
      },
    ];
  },
};

// Create the Case Studies GPT agent
export const caseStudiesGPTAgent: Agent<CaseStudiesGPTInputs, CaseStudiesGPTOutput> = {
  name: "Case Studies GPT",
  description: "A database/RAG of all social proof, testimonials, and case studies for a business or offer.",
  tools: [searchCaseStudiesTool],
  execute: async (inputs: CaseStudiesGPTInputs) => {
    console.log("Executing Case Studies GPT agent...");

    // 1. Search for relevant case studies
    const caseStudies = await searchCaseStudiesTool.execute(inputs.query);

    return { caseStudies };
  },
};
