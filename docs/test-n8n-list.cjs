/*
  Manual workaround for 401 local issues (CORS/Auth token mismatch).
  This script can be used to invoke the n8n-list function directly with a valid token.
  
  Usage:
  1. Log in to your app in the browser (localhost:8080).
  2. Open DevTools -> Application -> Local Storage -> https://localhost:8080
  3. Copy the 'access_token' from the `sb-...-auth-token` key.
  4. Run: node test-n8n-list.cjs <ACCESS_TOKEN> <CONNECTION_ID>
*/

const apiKey = process.argv[2]; // Just checking args, this is not the n8n api key, but supabase token
const connectionId = process.argv[3];

if (!apiKey || !connectionId) {
  console.log("Usage: node test-n8n-list.cjs <SUPABASE_ACCESS_TOKEN> <CONNECTION_ID>");
  // You can get connection ID from the DB or the UI dropdown inspect element if available
  process.exit(1);
}

const SUPABASE_URL = "http://127.0.0.1:54321"; // or your production URL if testing against prod
// If testing against prod from local script:
// const SUPABASE_URL = "https://pooeaxqkysmngpnpnswn.supabase.co";

async function main() {
  console.log(`Calling ${SUPABASE_URL}/functions/v1/n8n-list...`);
  
  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/n8n-list`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ connectionId })
    });

    console.log(`Status: ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    console.log("Body:", text.substring(0, 1000));
    
    if (resp.ok) {
        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON Data Keys:", Object.keys(json));
            if (json.workflows) {
                console.log("Workflows Type:", Array.isArray(json.workflows) ? "Array" : typeof json.workflows);
            }
        } catch (e) {
            console.log("Could not parse JSON");
        }
    }

  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

main();




