/*
  Quick harness to hit the five production n8n webhooks we mapped in the
  Phase 1 launch plan. This mirrors the manual table you generated earlier.

  Usage (PowerShell):
    node .\scripts\test-n8n-webhooks.cjs

  Optional flags:
    --fail-fast     stop after the first non-2xx response
    --limit=400     max characters of body to print (default 600)
*/

const { randomUUID } = require("crypto");

const webhookTests = [
  {
    name: "Meeting Agent",
    url: "https://togetherinc.app.n8n.cloud/webhook/d1007cb5-fe82-4e98-9905-31c9197c2597",
    payload: {
      query: "List meetings for Acme last week",
    },
  },
  {
    name: "Personal Assistant",
    url: "https://togetherinc.app.n8n.cloud/webhook/e101258b-7388-4da6-a427-82191acef0c3",
    payload: {
      instruction: "Draft email to Nick confirming Tuesday 2pm",
    },
  },
  {
    name: "RAG Agent",
    url: "https://togetherinc.app.n8n.cloud/webhook/7ddce9e5-57bf-4bf4-b496-87204f235f62",
    payload: {
      query: "What is our refund SOP?",
    },
  },
  {
    name: "Prompt Engineer",
    url: "https://togetherinc.app.n8n.cloud/webhook/a35caabc-5dd3-4f07-b36e-927b7647d691",
    payload: {
      topic: "Topic/Task",
      rough_draft: "Rough draft idea",
    },
  },
  {
    name: "Copywriter",
    url: "https://togetherinc.app.n8n.cloud/webhook/86d7a192-cc8e-4966-aa43-33d61a0d2f9f",
    payload: {
      content_type: "Email",
      offer_details: "Offer details go here",
      vsl_context: "Paste transcript or notes here",
      avatar: "Buyer persona description",
    },
  },
];

const outputLimit =
  process.argv
    .find((arg) => arg.startsWith("--limit="))
    ?.split("=")[1] ?? "600";
const truncateAt = Number(outputLimit) || 600;
const failFast = process.argv.includes("--fail-fast");

function pickHeaders(headers, limit = 12) {
  const entries = [];
  for (const [key, value] of headers.entries()) {
    entries.push([key, value]);
    if (entries.length >= limit) break;
  }
  return Object.fromEntries(entries);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

async function runWebhookTest(test) {
  const requestId = randomUUID();
  const start = Date.now();
  const startIso = new Date(start).toISOString();

  console.log(`\n=== ${test.name} ===`);
  console.log(`POST ${test.url}`);
  console.log(`requestId: ${requestId}`);

  try {
    const response = await fetch(test.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test.payload),
    });

    const end = Date.now();
    const durationMs = end - start;
    const endIso = new Date(end).toISOString();

    const bodyText = await response.text();
    const trimmedBody =
      bodyText.length > truncateAt
        ? `${bodyText.slice(0, truncateAt)}…`
        : bodyText;

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Duration: ${formatDuration(durationMs)}`);
    console.log(`Body (${bodyText.length} chars):`);
    console.log(trimmedBody || "(empty response)");
    console.log(
      "Trace:",
      JSON.stringify(
        {
          requestId,
          startTs: startIso,
          endTs: endIso,
          durationMs,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: pickHeaders(response.headers),
          contentLength: bodyText.length,
        },
        null,
        2
      )
    );

    return response.ok;
  } catch (error) {
    const end = Date.now();
    const durationMs = end - start;
    const endIso = new Date(end).toISOString();
    console.error(`Request failed: ${error.message}`);
    console.log(
      "Trace:",
      JSON.stringify(
        { requestId, startTs: startIso, endTs: endIso, durationMs, success: false, error: error.message },
        null,
        2
      )
    );
    return false;
  }
}

(async () => {
  for (const test of webhookTests) {
    const ok = await runWebhookTest(test);
    if (!ok && failFast) {
      console.log("Stopping early because --fail-fast was provided.");
      process.exitCode = 1;
      return;
    }
    if (!ok) {
      process.exitCode = 1;
    }
  }
})();




