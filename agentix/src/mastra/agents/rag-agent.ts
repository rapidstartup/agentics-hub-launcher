// agentix/src/mastra/agents/rag-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the RAG Agent
interface RAGAgentInputs {
  dataSources: {
    type: "meeting_transcript" | "sop_document" | "training_video_transcript";
    content: string;
  }[];
}

// Define the output for the RAG Agent
interface RAGAgentOutput {
  knowledgeBaseId: string;
}

// Define the tools that the agent will use (initially, these will be placeholders)
const vectorizeDataTool: Tool<RAGAgentInputs['dataSources'], string> = {
  name: "vectorizeData",
  description: "Chunks and vectorizes large amounts of information to create a company-wide brain.",
  execute: async (dataSources: RAGAgentInputs['dataSources']) => {
    // In a real implementation, this would use a vector database like Pinecone or Chroma
    console.log("Vectorizing data...");
    return "knowledge-base-123";
  },
};

// Create the RAG Agent
export const ragAgent: Agent<RAGAgentInputs, RAGAgentOutput> = {
  name: "RAG Agent",
  description: "Chunks large amounts of information about and from the company, creating a company-wide brain that is accessible by anyone on the team to ask questions or get feedback.",
  tools: [vectorizeDataTool],
  execute: async (inputs: RAGAgentInputs) => {
    console.log("Executing RAG Agent...");

    // 1. Vectorize the data sources
    const knowledgeBaseId = await vectorizeDataTool.execute(inputs.dataSources);

    return { knowledgeBaseId };
  },
};
