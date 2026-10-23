const fs = require('fs');

const raw = fs.readFileSync('C:/Users/piyus/.gemini/antigravity/brain/3c8bffc7-5c06-43d3-95fc-a8e60f1a4ebd/.system_generated/steps/35397/output.txt', 'utf8');
const jsonStart = raw.indexOf('[');
const jsonEnd = raw.lastIndexOf(']');
const items = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));

console.log(`Total: ${items.length}`);

let md = '| Domain | Sidebar Option | Route / Endpoint | Backend Status | Records in DB | Root Cause / Issue |\n';
md += '|---|---|---|---|---|---|\n';

for (const item of items) {
  md += `| ${item.domain} | ${item.option} | \`${item.endpoint}\` | ${item.status} | ${item.dbCount} | ${item.reason} |\n`;
}

fs.writeFileSync('C:/Users/piyus/.gemini/antigravity/brain/3c8bffc7-5c06-43d3-95fc-a8e60f1a4ebd/audit_table.md', md, 'utf8');
console.log('Saved to audit_table.md successfully!');
