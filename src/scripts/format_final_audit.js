const fs = require('fs');

const raw = fs.readFileSync('C:/Users/piyus/.gemini/antigravity/brain/3c8bffc7-5c06-43d3-95fc-a8e60f1a4ebd/.system_generated/steps/35887/output.txt', 'utf8');
const jsonStart = raw.indexOf('[');
const jsonEnd = raw.lastIndexOf(']');
const items = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));

console.log(`Total audited items: ${items.length}`);

const status200 = items.filter(i => i.status.includes('200'));
console.log(`Healthy / 200 OK: ${status200.length} / ${items.length}`);

let md = '| Domain | Sidebar Option | Route / Endpoint | Status | Records in DB | Diagnostic State |\n';
md += '|---|---|---|---|---|---|\n';

for (const item of items) {
  md += `| ${item.domain} | ${item.option} | \`${item.endpoint}\` | **${item.status}** | ${item.dbCount} | ${item.reason} |\n`;
}

fs.writeFileSync('C:/Users/piyus/.gemini/antigravity/brain/3c8bffc7-5c06-43d3-95fc-a8e60f1a4ebd/final_verified_audit_table.md', md, 'utf8');
console.log('Saved to final_verified_audit_table.md successfully!');
