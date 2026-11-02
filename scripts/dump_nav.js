const fs = require('fs');

function dumpNav(filePath, domainName) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n=================== ${domainName} SIDEBAR NAVIGATION ===================`);
  
  // We can extract all `title:` and `path:` or `id:`
  const regex = /{\s*(?:id|title|path):\s*['"]([^'"]+)['"](?:[^{}]*?title:\s*['"]([^'"]+)['"])?(?:[^{}]*?path:\s*['"]([^'"]+)['"])?/g;
  
  const lines = content.split('\n');
  let groupTitle = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('title:') && (lines[i-1]?.includes('group') || lines[i-2]?.includes('groups') || lines[i+1]?.includes('items:'))) {
      const match = line.match(/title:\s*['"]([^'"]+)['"]/);
      if (match) {
        groupTitle = match[1];
        console.log(`\n📁 GROUP: [${groupTitle}]`);
      }
    } else if (line.startsWith('title:') || line.startsWith('label:')) {
      const match = line.match(/(?:title|label):\s*['"]([^'"]+)['"]/);
      const pathMatch = lines.slice(i, i + 5).join(' ').match(/path:\s*['"]([^'"]+)['"]/);
      if (match) {
        console.log(`   ├─ ${match[1]} ${pathMatch ? `(${pathMatch[1]})` : ''}`);
      }
    }
  }
}

dumpNav('d:/frontend/src/core/config/navigation/books.tsx', 'BOOKS');
dumpNav('d:/frontend/src/core/config/navigation/inventory.tsx', 'INVENTORY');
dumpNav('d:/frontend/src/core/config/navigation/billing.tsx', 'BILLING');
