import fs from 'fs';
import path from 'path';

// Let's inspect route files in D:/backend/src
const routeDirs = [
  'D:/backend/src/domains/books/routes',
  'D:/backend/src/domains/billing/routes',
  'D:/backend/src/domains/inventory/routes',
  'D:/backend/src/domains/core/routes',
  'D:/backend/src/routes'
];

interface RouteInfo {
  file: string;
  method: string;
  path: string;
  rawLine: string;
}

const allRoutes: RouteInfo[] = [];

for (const dir of routeDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/i);
      if (match) {
        allRoutes.push({
          file: file,
          method: match[1].toUpperCase(),
          path: match[2],
          rawLine: line.trim()
        });
      }
    }
  }
}

console.log(JSON.stringify(allRoutes, null, 2));
console.log('Total routes found across route files:', allRoutes.length);
