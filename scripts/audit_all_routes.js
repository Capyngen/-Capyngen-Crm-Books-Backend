const fs = require('fs');
const lines = fs.readFileSync('D:/frontend/src/app/routes.tsx', 'utf8').split('\n');

function parseSlice(startLine, endLine, domainName) {
  const pages = [];
  for (let i = startLine - 1; i < endLine; i++) {
    const line = lines[i];
    if (line.includes('path:') && line.includes('element:')) {
      const pathMatch = line.match(/path:\s*['"]([^'"]+)['"]/);
      const elementMatch = line.match(/element:\s*<([A-Za-z0-9_]+)/);
      if (pathMatch && elementMatch) {
        pages.push({ path: pathMatch[1], component: elementMatch[1], line: i + 1 });
      }
    }
  }
  console.log(`\n=================== ${domainName.toUpperCase()} DOMAIN PAGES (${pages.length} Pages) ===================`);
  pages.forEach(p => console.log(`  - [${p.path}] -> <${p.component} /> (L${p.line})`));
  return pages;
}

parseSlice(285, 533, 'Books');
parseSlice(534, 726, 'Inventory');
parseSlice(727, 855, 'Billing');
