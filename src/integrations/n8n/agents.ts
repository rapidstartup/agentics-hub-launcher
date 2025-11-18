import { supabase } from "@/integrations/supabase/client";
import type { N8nScope } from "./api";

export interface RuntimeField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean";
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export interface AgentConfig {
  id: string;
  scope: N8nScope;
  client_id: string | null;
  area: string;
  agent_key: string;
  display_name?: string | null;
  display_role?: string | null;
  connection_id: string;
  workflow_id: string;
  input_mapping: {
    requiredFields?: RuntimeField[];
    [k: string]: any;
  } | null;
  output_mapping: any;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

export async function fetchAgentConfig(params: {
  area: string;
  agentKey: string;
  clientId?: string;
}): Promise<AgentConfig | null> {
  // Prefer client-scoped config, fallback to agency-scoped
  const { data: clientRows, error: clientErr } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("area", params.area)
    .eq("agent_key", params.agentKey)
    .eq("scope", "client")
    .eq("client_id", params.clientId || null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!clientErr && clientRows && clientRows.length > 0) {
    return clientRows[0] as unknown as AgentConfig;
  }

  const { data: agencyRows } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("area", params.area)
    .eq("agent_key", params.agentKey)
    .eq("scope", "agency")
    .order("created_at", { ascending: false })
    .limit(1);

  return (agencyRows?.[0] as unknown as AgentConfig) || null;
}

export async function upsertAgentConfig(params: {
  scope: N8nScope;
  clientId?: string;
  area: string;
  agentKey: string;
  displayName?: string;
  displayRole?: string;
  connectionId: string;
  workflowId: string;
  requiredFields?: RuntimeField[];
}): Promise<AgentConfig> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("agent_configs")
    .insert({
      user_id: userId,
      scope: params.scope,
      client_id: params.scope === "client" ? params.clientId ?? null : null,
      area: params.area,
      agent_key: params.agentKey,
      display_name: params.displayName ?? params.agentKey,
      display_role: params.displayRole ?? null,
      connection_id: params.connectionId,
      workflow_id: params.workflowId,
      input_mapping: params.requiredFields?.length
        ? { requiredFields: params.requiredFields }
        : null,
      output_mapping: null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as AgentConfig;
}

export async function listAgentConfigs(params: {
  area: string;
  clientId?: string;
}): Promise<AgentConfig[]> {
  const pieces: AgentConfig[] = [];

  // Client scoped
  if (params.clientId) {
    const { data } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("area", params.area)
      .eq("scope", "client")
      .eq("client_id", params.clientId);
    if (Array.isArray(data)) pieces.push(...(data as any));
  }

  // Agency scoped
  const { data: agency } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("area", params.area)
    .eq("scope", "agency");
  if (Array.isArray(agency)) pieces.push(...(agency as any));

  return pieces;
}


