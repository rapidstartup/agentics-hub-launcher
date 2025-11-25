// agentix/src/mastra/agents/sales-team-reporting-agent.ts

import { Agent, Tool } from "@agentix/mastra";

// Define the inputs for the Sales team reporting agent
interface SalesTeamReportingInputs {
  scheduledCalls: number;
  liveCalls: number;
  offers: number;
  deposits: number;
  closes: number;
  productSold: string;
  cashCollected: number;
}

// Define the output for the Sales team reporting agent
interface SalesTeamReportingOutput {
  report: string; // The formatted sales report
}

// Define the tools that the agent will use (initially, these will be placeholders)
const generateSalesReportTool: Tool<SalesTeamReportingInputs, string> = {
  name: "generateSalesReport",
  description: "Generates a sales report based on daily data.",
  execute: async (inputs: SalesTeamReportingInputs) => {
    // In a real implementation, this would format the report and potentially save it to a database
    console.log("Generating sales report...");
    return `
# Daily Sales Report

- Scheduled Calls: ${inputs.scheduledCalls}
- Live Calls: ${inputs.liveCalls}
- Offers: ${inputs.offers}
- Deposits: ${inputs.deposits}
- Closes: ${inputs.closes}
- Product Sold: ${inputs.productSold}
- Cash Collected: $${inputs.cashCollected}
`;
  },
};

// Create the Sales team reporting agent
export const salesTeamReportingAgent: Agent<SalesTeamReportingInputs, SalesTeamReportingOutput> = {
  name: "Sales Team Reporter",
  description: "Generates a sales report based on daily data entered by closers.",
  tools: [generateSalesReportTool],
  execute: async (inputs: SalesTeamReportingInputs) => {
    console.log("Executing Sales Team Reporter agent...");

    // 1. Generate the sales report
    const report = await generateSalesReportTool.execute(inputs);

    return { report };
  },
};
