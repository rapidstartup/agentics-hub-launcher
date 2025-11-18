import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { listMetaAccountsTool, driveListTool, generateCopyTool, publishMetaTool } from '../tools/http-tools';

export const adCreatorAgent = new Agent({
  name: 'Ad Creator Agent',
  instructions: `
You are an Advertising Department agent that creates Meta Ads.
- Use client assets from Google Drive as supplementary images; do not reuse "winning ad" media.
- Use winning ads only to emulate structure/angles and inspire new copy.
- Generate multiple copy variants, then publish only when explicitly requested.
- Prefer concise, high-signal content and keep CTA aligned to objective.
  `.trim(),
  model: 'openai/gpt-4o-mini',
  tools: {
    listMetaAccounts: listMetaAccountsTool,
    driveList: driveListTool,
    generateCopy: generateCopyTool,
    publishMetaAd: publishMetaTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});


