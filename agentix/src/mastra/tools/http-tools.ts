import type { Tool } from '@mastra/core/types';

const EDGE_BASE =
  process.env.SUPABASE_EDGE_URL ||
  process.env.EDGE_BASE_URL ||
  ''; // if empty, fetch will go relative when running through reverse proxy

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = EDGE_BASE ? `${EDGE_BASE}${path}` : path;
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  // Optional: Bearer token if present
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  }
  return fetch(url, { ...init, headers });
}

export const listMetaAccountsTool: Tool = {
  name: 'listMetaAccounts',
  description: 'List Meta ad accounts/pages via edge function',
  inputSchema: {
    type: 'object',
    properties: { account_id: { type: 'string', nullable: true } },
  } as any,
  execute: async (input: { account_id?: string }) => {
    const qs = input?.account_id ? `?account_id=${encodeURIComponent(input.account_id)}` : '';
    const resp = await authedFetch(`/functions/v1/metaads-list${qs}`, { method: 'GET' });
    return await resp.json();
  },
};

export const driveListTool: Tool = {
  name: 'driveList',
  description: 'List Google Drive files via edge function',
  inputSchema: {
    type: 'object',
    properties: {
      q: { type: 'string', nullable: true },
      folderId: { type: 'string', nullable: true },
    },
  } as any,
  execute: async (input: { q?: string; folderId?: string }) => {
    const params = new URLSearchParams();
    if (input?.q) params.set('q', input.q);
    if (input?.folderId) params.set('folderId', input.folderId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const resp = await authedFetch(`/functions/v1/drive-list${qs}`, { method: 'GET' });
    return await resp.json();
  },
};

export const generateCopyTool: Tool = {
  name: 'generateCopy',
  description: 'Generate ad copy variants via Gemini (Edge function)',
  inputSchema: {
    type: 'object',
    properties: {
      productContext: { type: 'object' },
      winningExamples: { type: 'array' },
      numVariants: { type: 'number' },
    },
    required: ['productContext'],
  } as any,
  execute: async (input: {
    productContext: Record<string, unknown>;
    winningExamples?: Array<unknown>;
    numVariants?: number;
  }) => {
    const resp = await authedFetch(`/functions/v1/generate-copy`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return await resp.json();
  },
};

export const publishMetaTool: Tool = {
  name: 'publishMetaAd',
  description: 'Publish approved creatives to Meta Ads via Edge function',
  inputSchema: {
    type: 'object',
    properties: {
      accountId: { type: 'string' },
      pageId: { type: 'string' },
      campaign: { type: 'object' },
      adset: { type: 'object' },
      creatives: { type: 'array' },
      dryRun: { type: 'boolean' },
    },
    required: ['accountId', 'pageId', 'creatives'],
  } as any,
  execute: async (input: any) => {
    const resp = await authedFetch(`/functions/v1/metaads-publish`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return await resp.json();
  },
};


