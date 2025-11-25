import { useState } from "react";
import { AgentConfig, getAgentInputFields, executeAgentWebhook } from "@/integrations/n8n/agents";
import { runN8nWorkflow } from "@/integrations/n8n/api";
import { RunAgentDynamicModal } from "./RunAgentDynamicModal";
import { AgentChatWindow } from "./AgentChatWindow";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UniversalAgentRunnerProps {
  agent: AgentConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Universal runner that displays either:
 * - Chat interface for chat_stream agents
 * - Form modal for modal_display agents
 */
export function UniversalAgentRunner({ agent, open, onOpenChange }: UniversalAgentRunnerProps) {
  const [running, setRunning] = useState(false);

  const inputFields = getAgentInputFields(agent);
  const outputBehavior = agent.output_behavior || "modal_display";

  const handleRun = async (values: Record<string, any>): Promise<any> => {
    setRunning(true);
    try {
      let response: any;

      // Check if this is a predefined agent with a direct webhook URL
      if (agent.is_predefined && agent.webhook_url) {
        const result = await executeAgentWebhook({
          webhookUrl: agent.webhook_url,
          payload: values,
        });
        if (!result.success) {
          throw new Error(result.error || "Webhook execution failed");
        }
        response = result.result;
      } else {
        // Use the n8n connection flow
        const result = await runN8nWorkflow({
          connectionId: agent.connection_id,
          workflowId: agent.workflow_id,
          webhookUrl: agent.webhook_url || undefined,
          payload: values,
          waitTillFinished: true,
        });
        response = result.result;
      }

      return response;
    } finally {
      setRunning(false);
    }
  };

  // Chat interface for chat_stream agents
  if (outputBehavior === "chat_stream") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[80vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="sr-only">{agent.display_name || agent.agent_key}</DialogTitle>
          </DialogHeader>
          <AgentChatWindow agent={agent} className="flex-1 border-0 rounded-none" />
        </DialogContent>
      </Dialog>
    );
  }

  // Form modal for modal_display or field_populate agents
  return (
    <RunAgentDynamicModal
      open={open}
      onOpenChange={onOpenChange}
      title={agent.display_name || agent.agent_key}
      description={agent.description || undefined}
      fields={inputFields}
      onRun={handleRun}
      running={running}
      outputBehavior={outputBehavior}
    />
  );
}

