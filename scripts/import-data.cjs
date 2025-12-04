// Node.js script to import Central Brain data
const fs = require('fs');
const https = require('https');

const IMPORT_URL = 'https://bzldwfwyriwvlyfixmrt.supabase.co/functions/v1/import-central-brain-data';

async function importData() {
  console.log('Reading export file...');
  
  const exportFile = fs.readFileSync('central-brain-export.json', 'utf8');
  const exportData = JSON.parse(exportFile);
  
  console.log('Export summary:', exportData.summary);
  console.log('Tables with data:', Object.entries(exportData.stats || {}).filter(([k, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', '));
  
  const requestBody = JSON.stringify({ data: exportData.data });
  console.log(`Request body size: ${(requestBody.length / 1024 / 1024).toFixed(2)} MB`);
  
  const url = new URL(IMPORT_URL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
  };
  
  console.log('Sending to import function...');
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        
        try {
          const result = JSON.parse(data);
          console.log(JSON.stringify(result, null, 2));
          
          if (result.success) {
            console.log('\n✅ Import successful!');
            console.log(`Total inserted: ${result.summary?.totalInserted || 0}`);
          } else {
            console.log('\n❌ Import failed:', result.error);
          }
        } catch (e) {
          console.log('Response:', data);
        }
        
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });
    
    req.write(requestBody);
    req.end();
  });
}

importData().catch(console.error);

