import * as fs from 'fs';
import * as path from 'path';

const backupDir = path.join(process.cwd(), 'migration-backup');

const userIds = new Set<string>();

const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));

console.log('Scanning backup files for unique user IDs...\n');

for (const file of files) {
  const filePath = path.join(backupDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (Array.isArray(data)) {
    data.forEach((row: any) => {
      if (row.user_id) {
        userIds.add(row.user_id);
      }
    });
  }

  const count = Array.from(userIds).length;
  if (count > 0) {
    console.log(`${file}: Found ${data.filter((r: any) => r.user_id).length} rows with user_id`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Total unique user IDs found: ${userIds.size}`);
console.log('='.repeat(60));

Array.from(userIds).forEach((id, index) => {
  console.log(`\nUser ${index + 1}: ${id}`);
});
