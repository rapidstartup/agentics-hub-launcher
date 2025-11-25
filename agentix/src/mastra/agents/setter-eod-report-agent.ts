// agentix/src/mastra/agents/setter-eod-report-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Setter EOD report generation agent
interface SetterEODReportInputs {
  transcripts: {
    setterName: string;
    leadName: string;
    summary: string;
  }[];
}

// Define the output for the Setter EOD report generation agent
interface SetterEODReportOutput {
  report: string; // The EOD report as a formatted string
}

// Define the tools that the agent will use (initially, these will be placeholders)
const generateEODReportTool: Tool<SetterEODReportInputs['transcripts'], string> = {
  name: "generateEODReport",
  description: "Generates an end-of-day report for setters based on their call transcripts.",
  execute: async (transcripts: SetterEODReportInputs['transcripts']) => {
    // In a real implementation, this would format the report based on the transcripts
    console.log("Generating EOD report...");
    let report = "Setter EOD Report:\n\n";
    transcripts.forEach(t => {
      report += `${t.setterName}:\n<${t.leadName}> - ${t.summary}\n`;
    });
    return report;
  },
};

// Create the Setter EOD report generation agent
export const setterEODReportAgent: Agent<SetterEODReportInputs, SetterEODReportOutput> = {
  name: "Setter EOD Report Generator",
  description: "Generates an end-of-day report for the manager that includes a 1 to 2 sentence summary of each call.",
  tools: [generateEODReportTool],
  execute: async (inputs: SetterEODReportInputs) => {
    console.log("Executing Setter EOD Report Generator agent...");

    // 1. Generate the EOD report
    const report = await generateEODReportTool.execute(inputs.transcripts);

    return { report };
  },
};
