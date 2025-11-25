// agentix/src/mastra/agents/closer-eod-report-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Closer EOD report generation agent
interface CloserEODReportInputs {
  transcripts: {
    closerName: string;
    leadName: string;
    summary: string;
  }[];
}

// Define the output for the Closer EOD report generation agent
interface CloserEODReportOutput {
  report: string; // The EOD report as a formatted string
}

// Define the tools that the agent will use (initially, these will be placeholders)
const generateCloserEODReportTool: Tool<CloserEODReportInputs['transcripts'], string> = {
  name: "generateCloserEODReport",
  description: "Generates an end-of-day report for closers based on their call transcripts.",
  execute: async (transcripts: CloserEODReportInputs['transcripts']) => {
    // In a real implementation, this would format the report based on the transcripts
    console.log("Generating Closer EOD report...");
    let report = "Closer EOD Report:\n\n";
    transcripts.forEach(t => {
      report += `${t.closerName}:\n<${t.leadName}> - ${t.summary}\n`;
    });
    return report;
  },
};

// Create the Closer EOD report generation agent
export const closerEODReportAgent: Agent<CloserEODReportInputs, CloserEODReportOutput> = {
  name: "Closer EOD Report Generator",
  description: "Generates an end-of-day report for the manager that includes a 1 to 2 sentence summary of each call.",
  tools: [generateCloserEODReportTool],
  execute: async (inputs: CloserEODReportInputs) => {
    console.log("Executing Closer EOD Report Generator agent...");

    // 1. Generate the EOD report
    const report = await generateCloserEODReportTool.execute(inputs.transcripts);

    return { report };
  },
};
