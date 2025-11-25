// agentix/src/mastra/agents/setter-team-reporting-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Setter team reporting agent
interface SetterTeamReportingInputs {
  dials: number;
  conversations: number;
  triages: number;
  sets: number;
  closes: number;
  productSold: string;
  cashCollected: number;
}

// Define the output for the Setter team reporting agent
interface SetterTeamReportingOutput {
  report: string; // The formatted setter report
}

// Define the tools that the agent will use (initially, these will be placeholders)
const generateSetterReportTool: Tool<SetterTeamReportingInputs, string> = {
  name: "generateSetterReport",
  description: "Generates a setter report based on daily data.",
  execute: async (inputs: SetterTeamReportingInputs) => {
    // In a real implementation, this would format the report and potentially save it to a database
    console.log("Generating setter report...");
    return `
# Daily Setter Report

- Dials: ${inputs.dials}
- Conversations: ${inputs.conversations}
- Triages: ${inputs.triages}
- Sets: ${inputs.sets}
- Closes: ${inputs.closes}
- Product Sold: ${inputs.productSold}
- Cash Collected: $${inputs.cashCollected}
`;
  },
};

// Create the Setter team reporting agent
export const setterTeamReportingAgent: Agent<SetterTeamReportingInputs, SetterTeamReportingOutput> = {
  name: "Setter Team Reporter",
  description: "Generates a setter report based on daily data entered by setters.",
  tools: [generateSetterReportTool],
  execute: async (inputs: SetterTeamReportingInputs) => {
    console.log("Executing Setter Team Reporter agent...");

    // 1. Generate the setter report
    const report = await generateSetterReportTool.execute(inputs);

    return { report };
  },
};
