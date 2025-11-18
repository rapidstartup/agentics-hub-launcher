import { createWorkflow, createStep } from '@mastra/core/workflow';
import { z } from 'zod';
import { adCreatorAgent } from '../agents/ad-creator-agent';

const gatherInputs = createStep({
  id: 'gather-inputs',
  description: 'Collect product context, winning example data, and asset hints',
  inputSchema: z.object({
    productContext: z.record(z.any()),
    winningExamples: z.array(z.any()).default([]),
    numVariants: z.number().min(1).max(10).default(5),
  }),
  outputSchema: z.object({
    productContext: z.record(z.any()),
    winningExamples: z.array(z.any()),
    numVariants: z.number(),
  }),
  execute: async ({ inputData }) => {
    return inputData;
  },
});

const generateVariants = createStep({
  id: 'generate-variants',
  description: 'Generate ad copy variants from Gemini via edge function',
  inputSchema: z.object({
    productContext: z.record(z.any()),
    winningExamples: z.array(z.any()),
    numVariants: z.number(),
  }),
  outputSchema: z.object({
    variants: z.array(z.object({
      headline: z.string().optional(),
      primaryText: z.string(),
      cta: z.string().optional(),
      websiteUrl: z.string().optional(),
      rationale: z.string().optional(),
    })),
  }),
  execute: async ({ inputData }) => {
    const resp = await adCreatorAgent.callTool('generateCopy', {
      productContext: inputData.productContext,
      winningExamples: inputData.winningExamples,
      numVariants: inputData.numVariants,
    });
    return { variants: resp?.variants ?? [] };
  },
});

const publishApproved = createStep({
  id: 'publish-approved',
  description: 'Publish approved creatives to Meta Ads',
  inputSchema: z.object({
    accountId: z.string(),
    pageId: z.string(),
    campaign: z.record(z.any()).default({}),
    adset: z.record(z.any()).default({}),
    creatives: z.array(z.object({
      headline: z.string().optional(),
      primaryText: z.string(),
      cta: z.string().optional(),
      websiteUrl: z.string(),
      assetRefs: z.array(z.object({
        driveFileId: z.string().optional(),
        url: z.string().optional(),
      })).default([]),
    })),
    dryRun: z.boolean().default(true),
  }),
  outputSchema: z.object({
    result: z.record(z.any()),
  }),
  execute: async ({ inputData }) => {
    const resp = await adCreatorAgent.callTool('publishMetaAd', inputData as any);
    return { result: resp };
  },
});

const adCreatorWorkflow = createWorkflow({
  id: 'ad-creator-workflow',
  inputSchema: z.object({
    productContext: z.record(z.any()),
    winningExamples: z.array(z.any()).default([]),
    numVariants: z.number().min(1).max(10).default(5),
  }),
  outputSchema: z.object({
    variants: z.array(z.object({
      headline: z.string().optional(),
      primaryText: z.string(),
      cta: z.string().optional(),
      websiteUrl: z.string().optional(),
      rationale: z.string().optional(),
    })),
  }),
})
  .then(gatherInputs)
  .then(generateVariants);

adCreatorWorkflow.commit();

export { adCreatorWorkflow, publishApproved };


